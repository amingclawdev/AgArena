// A bounded, manually refreshed source. No scraping, background polling or LLM calls.
const USERNAME = 'WxOntario';
const TOPICS = {rain:/\b(rain|rainfall|showers|downpour)\b/i,storm:/\b(storms?|thunderstorms?|lightning|tornado|hail)\b/i,wind:/\b(wind|winds|gusts?|windy)\b/i,frost:/\b(frost|freeze|freezing)\b/i,heat:/\b(heat|hot|heatwave|humidex)\b/i,snow:/\b(snow|snowfall|blizzard|flurries)\b/i};
export function classifyPost(post,author,now){
 if(!/^\d+$/.test(post.id)||typeof post.text!=='string'||post.author_id!==author.id||!Number.isFinite(Date.parse(post.created_at))||Date.parse(post.created_at)>now)throw Error('X_INVALID_RESPONSE');
 const text=typeof post.note_tweet?.text==='string'?post.note_tweet.text:post.text;
 return {id:post.id,text,author:author.name,username:USERNAME,url:`https://x.com/${USERNAME}/status/${post.id}`,published_at:post.created_at,observed_at:null,ingested_at:new Date(now).toISOString(),evidence_type:'social_claim',verification:'unverified',topics:Object.entries(TOPICS).filter(([,re])=>re.test(text)).map(([topic])=>topic),age_hours:Math.round((now-Date.parse(post.created_at))/360000)/10,geographic_support:'Not established; no field location inferred',analysis_method:'keyword-tags.v1',has_references:Boolean(post.referenced_tweets?.length)};
}
export function createXSource({env=process.env,fetchImpl=fetch,clock=Date.now}={}){
 let state={status:'ready',posts:[],fetched_at:null},inFlight=false,lastAttempt=null,attempts=0;
 const token=()=>env.X_BEARER_TOKEN;
 function status(){
  if(!token())return {...state,posts:[],status:'not_connected',message:'Add the server-side X API bearer token to connect @WxOntario.'};
  if(env.X_READS_ENABLED!=='true')return {...state,posts:[],status:'reads_disabled',message:'X reads are disabled. Configure an approved read allowance before fetching.'};
  if(state.fetched_at&&clock()-Date.parse(state.fetched_at)>15*60000)state={posts:[],fetched_at:null,status:'expired',message:'The temporary snapshot expired. Another fetch requires a new approved server session.'};
  return {...state,can_refresh:!inFlight&&attempts===0,status:inFlight?'loading':state.status,message:state.message||'Ready for one manual fetch of up to 5 posts.',username:USERNAME};
 }
 async function request(path){
  let r;try{r=await fetchImpl(`https://api.x.com/2/${path}`,{headers:{Authorization:`Bearer ${token()}`},signal:AbortSignal.timeout(10000),redirect:'error'})}catch{throw Error('X_UNAVAILABLE')}
  if(!r.ok)throw Error(({401:'X_TOKEN_REJECTED',403:'X_ACCESS_DENIED',404:'X_ACCOUNT_NOT_FOUND',429:'X_RATE_LIMITED'})[r.status]||'X_UNAVAILABLE');
  try{return await r.json()}catch{throw Error('X_INVALID_RESPONSE')}
 }
 async function refresh(){
  if(!token()||env.X_READS_ENABLED!=='true')return status();
  if(inFlight)return status();
  // One attempt per server start; includes failed attempts, with no automatic retry.
  if(attempts>=1)return {...status(),message:'This server session’s one-fetch allowance is used. Restart only after approving another fetch.'};
  inFlight=true;attempts++;lastAttempt=new Date(clock()).toISOString();state={status:'loading',posts:[],fetched_at:null};
  try{
   const account=await request(`users/by/username/${USERNAME}`),author=account.data;
   if(!author||!/^\d+$/.test(author.id)||author.username?.toLowerCase()!==USERNAME.toLowerCase()||typeof author.name!=='string')throw Error('X_ACCOUNT_NOT_FOUND');
   const result=await request(`users/${author.id}/tweets?max_results=5&exclude=retweets,replies&tweet.fields=created_at,author_id,referenced_tweets,note_tweet`);
   if(result.errors?.length||(!Array.isArray(result.data)&&result.meta?.result_count!==0))throw Error('X_INVALID_RESPONSE');
   const now=clock(),seen=new Set();const posts=(result.data||[]).slice(0,5).map(p=>classifyPost(p,author,now)).filter(p=>!seen.has(p.id)&&seen.add(p.id));
   state={status:posts.length?'connected':'empty',posts,fetched_at:new Date(now).toISOString(),message:posts.length?'Text-only topic analysis. These reports are unverified and do not change field forecasts.':'The account returned no posts in this request.'};
  }catch(e){state={status:'error',posts:[],fetched_at:null,message:e.message}}
  finally{inFlight=false}
  return {...status(),last_attempt:lastAttempt};
 }
 return {status,refresh};
}
