import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173/v1';
const session=async tenant=>{const r=await fetch(`${base}/demo-session?tenant=${tenant}`,{method:'POST'});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]};
assert.equal((await fetch(`${base}/fields`)).status,401);
let alpha=await session('alpha'),beta=await session('beta');
for(const kind of ['brief','evidence','tile','export']){const denied=await fetch(`${base}/fields/north/${kind}`,{headers:{cookie:beta}});assert.equal(denied.status,404);assert.deepEqual(await denied.json(),{code:'NOT_FOUND'});const allowed=await fetch(`${base}/fields/north/${kind}`,{headers:{cookie:alpha}});assert.equal(allowed.status,200);assert.equal(allowed.headers.get('cache-control'),'no-store')}
const switched=await fetch(`${base}/demo-session?tenant=beta`,{method:'POST',headers:{cookie:alpha}});assert.equal(switched.status,200);assert.equal((await fetch(`${base}/fields`,{headers:{cookie:alpha}})).status,401);
assert.equal((await fetch(`${base}/demo-session`,{method:'POST',headers:{origin:'https://example.com'}})).status,403);
assert.equal((await fetch(`${base}/fields/west/brief?as_of=invalid`,{headers:{cookie:beta}})).status,400);
console.log('PASS: unauthenticated requests, four cross-tenant derivative routes, cache headers, session revocation, origin rejection, invalid replay input');
