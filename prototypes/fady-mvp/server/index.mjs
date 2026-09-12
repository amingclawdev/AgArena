import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {createServer as createViteServer} from 'vite';
import {listFields,brief,evidence} from './domain.mjs';
import {createXSource} from './x-source.mjs';
try { process.loadEnvFile('.env'); } catch (error) { if(error.code!=='ENOENT') throw error; }
const xSource=createXSource();
const sessions=new Map();
const vite=await createViteServer({server:{middlewareMode:true,hmr:{host:'127.0.0.1'}},appType:'spa'});
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith('/v1/'))return vite.middlewares(req,res,()=>{res.writeHead(404);res.end()});
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(status,value)=>{res.writeHead(status);res.end(JSON.stringify(value))};
 try{
 if(req.method==='POST'&&url.pathname==='/v1/demo-session'){
  const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`)return send(403,{code:'ORIGIN_REJECTED'});
  const tenant=url.searchParams.get('tenant')||'alpha';listFields(tenant);
  const previous=req.headers.cookie?.match(/(?:^|; )agarena_session=([^;]+)/)?.[1];if(previous)sessions.delete(previous);
  const token=randomBytes(32).toString('hex');sessions.set(token,tenant);res.setHeader('Set-Cookie',`agarena_session=${token}; HttpOnly; SameSite=Strict; Path=/`);return send(200,{tenant,demo:true});
 }
 const token=req.headers.cookie?.match(/(?:^|; )agarena_session=([^;]+)/)?.[1],tenant=sessions.get(token);if(!tenant)return send(401,{code:'UNAUTHORIZED'});
 if(url.pathname==='/v1/sources/wxontario'&&req.method==='GET')return send(200,xSource.status());
 if(url.pathname==='/v1/sources/wxontario/refresh'&&req.method==='POST'){
  if(req.headers.origin!==`http://${req.headers.host}`)return send(403,{code:'ORIGIN_REJECTED'});
  return send(200,await xSource.refresh());
 }
 if(req.method!=='GET')return send(405,{code:'METHOD_NOT_ALLOWED'});
 if(url.pathname==='/v1/fields')return send(200,listFields(tenant));
 const match=url.pathname.match(/^\/v1\/fields\/([^/]+)\/(brief|evidence|export|tile)$/);
 if(match){const [,id,kind]=match;const data=(kind==='evidence'?evidence:brief)(tenant,id,url.searchParams.get('as_of')||undefined,url.searchParams.get('scenario')||'normal');return send(200,kind==='tile'?{type:'Feature',geometry:data.field.geometry,properties:{id:data.field.id}}:data)}
 send(404,{code:'NOT_FOUND'});
 }catch(error){const code=error.message;send(code==='NOT_FOUND'?404:code==='UNAUTHORIZED'?401:400,{code})}
});
server.listen(5173,'127.0.0.1',()=>console.log('AgArena local synthetic demo: http://127.0.0.1:5173'));
