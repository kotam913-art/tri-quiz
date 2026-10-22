const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const endpoint='https://script.google.com/macros/s/TEST/exec';
function fixture(){
  const fields=Object.fromEntries(['grade','group','number','code'].map(k=>[k,{value:'',disabled:false}]));
  const handlers={},form={elements:fields,querySelectorAll:()=>Object.values(fields),addEventListener:(t,f)=>handlers[t]=f};
  const status={textContent:''},makeLink=()=>({hidden:true,style:{},addEventListener(t,f){this[t]=f}});
  const links={direct:makeLink(),post:makeLink(),login:makeLink()},frames=[],posts=[],events={},timers=[],store={};
  const panel={dataset:{},style:{},set innerHTML(v){},querySelector:s=>s==='form'?form:s==='[role=status]'?status:s==='[data-direct]'?links.direct:s==='[data-post]'?links.post:links.login};
  const doc={readyState:'complete',body:{append(n){if(n.kind==='iframe')frames.push(n)}},querySelector:()=>null,addEventListener:(k,f)=>events['doc:'+k]=f,
    createElement(kind){if(kind==='section')return panel;return {kind,remove(){this.removed=true},append(n){this.input=n},submit(){posts.push({action:this.action,method:this.method,target:this.target,rel:this.rel,body:this.input.value})}}}};
  const c={document:doc,crypto:require('node:crypto').webcrypto,location:{origin:'https://raw.githack.com'},sessionStorage:{getItem:k=>store[k],setItem:(k,v)=>store[k]=v},setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout(){},URL,encodeURIComponent};
  c.window={QUIZ_SUBMISSION_CONFIG:{endpoint},addEventListener:(k,f)=>events[k]=f};
  vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/client.js','utf8'),c);events['doc:DOMContentLoaded']();
  return {c,fields,handlers,status,links,frames,posts,events,timers,store};
}
const f=fixture();assert.equal(f.frames.length,1);assert(!/secret|student|answers/.test(f.frames[0].src));
const channel=new URL(f.frames[0].src).searchParams.get('channel'),sent=[];
const source={postMessage:(data,origin)=>sent.push({data,origin})},googleOrigin='https://n-example-script.googleusercontent.com';
const ready=(origin=googleOrigin,ch=channel)=>f.events.message({origin,source,data:{type:'ready',channel:ch,version:5}});
ready('https://evil.test');ready(googleOrigin,'wrong-channel');assert.equal(sent.length,0);
ready();assert.equal(sent.length,0); // A connection alone must never submit.
for(const [k,v] of Object.entries({grade:'２',group:'１',number:'０７',code:' ｓｅｃｒｅｔ '}))f.fields[k].value=v;
f.c.window.QuizSubmission.graded('explog-01',1,6,['wrong']);assert.equal(sent.length,0);assert(f.links.post.hidden);assert.equal(f.links.post.style.display,'none');
const answers=['1','1/16','2','-5','-4','-8'];
f.c.window.QuizSubmission.graded('explog-01',6,6,answers);assert.equal(sent.length,1);assert.equal(f.frames.length,1);
assert.equal(sent[0].data.payload.student.code,'secret');assert.equal(sent[0].data.payload.student.grade,'2');assert(f.timers.some(t=>t.ms===90000));
assert(!f.links.direct.href.includes('secret'));const packet=JSON.parse(decodeURIComponent(new URL(f.links.direct.href).hash.slice(1)));
assert.deepEqual(Object.keys(packet).sort(),['answers','task']);assert.equal(packet.task,'explog-01');
// One explicit click sends existing credentials in POST, without the iframe or URL.
f.links.post.click();assert.equal(f.posts.length,1);assert.equal(f.posts[0].method,'POST');assert.equal(f.posts[0].action,endpoint);assert.equal(f.posts[0].target,'_blank');
assert.deepEqual(JSON.parse(f.posts[0].body),{task:'explog-01',answers,student:{grade:'2',group:'1',number:'07',code:'secret'}});
assert(!f.status.textContent.startsWith('提出済み'));assert(!JSON.stringify(f.store).includes('secret'));
f.fields.code.value='';f.links.post.click();assert.equal(f.posts.length,1);f.fields.code.value='secret';
f.events.message({origin:googleOrigin,source:{},data:{type:'result',channel,ok:true}});assert(!f.status.textContent.startsWith('提出済み'));
f.events.message({origin:googleOrigin,source,data:{type:'result',channel,ok:false,reason:'CODE',error:'CODE ERROR'}});assert.equal(f.status.textContent,'CODE ERROR');
f.handlers.submit({preventDefault(){}});f.events.message({origin:googleOrigin,source,data:{type:'result',channel,ok:true}});assert(f.status.textContent.startsWith('提出済み'));
// A blocked/slow connection gives a first-party path, never a false receipt.
const blocked=fixture();for(const [k,v] of Object.entries({grade:'2',group:'1',number:'1',code:'test'}))blocked.fields[k].value=v;
const blockedChannel=new URL(blocked.frames[0].src).searchParams.get('channel');blocked.c.window['__quiz_status_'+blockedChannel]({version:5,post:true});
blocked.c.window.QuizSubmission.graded('basic',1,1,['1']);assert.equal(blocked.frames.length,1);
blocked.timers.filter(t=>t.ms===45000).at(-1).f();assert(blocked.frames[0].removed);assert(blocked.status.textContent.includes('接続待ち'));assert(!blocked.status.textContent.startsWith('提出済み'));assert(!blocked.links.post.hidden);
blocked.links.post.click();assert.equal(blocked.posts.length,1);
const noScore=fixture();noScore.links.post.click();assert.equal(noScore.posts.length,0);
// An old deployment keeps the working manual form, never exposes unsupported POST.
const old=fixture();for(const [k,v] of Object.entries({grade:'2',group:'1',number:'1',code:'test'}))old.fields[k].value=v;
old.c.window.QuizSubmission.graded('basic',1,1,['1']);assert(old.links.post.hidden);assert(!old.links.direct.hidden);old.links.post.click();assert.equal(old.posts.length,0);
// The sandbox bridge targets real ancestors and only allowlisted origins.
let html='';const gas={HtmlService:{XFrameOptionsMode:{ALLOWALL:'all'},createHtmlOutput:s=>{html=s;return {setXFrameOptionsMode(){return this},setTitle(){return this},addMetaTag(){return this}}}}};
vm.createContext(gas);vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),gas);
gas.doGet({parameter:{channel:'a'.repeat(40),origin:'https://raw.githack.com'}});
const script=html.match(/<script>([\s\S]*)<\/script>/)[1],posted=[];let bridgeHandler;
const top={postMessage:d=>posted.push(['outer',d])};top.parent=top;
const quiz={parent:top,postMessage:d=>posted.push(['quiz',d])},wrapper={parent:quiz,postMessage:d=>posted.push(['wrapper',d])};
const runner={withSuccessHandler(f){this.ok=f;return this},withFailureHandler(){return this},submitPerfect(){this.ok({ok:true})}};
vm.runInNewContext(script,{window:{parent:wrapper,addEventListener:(k,f)=>bridgeHandler=f},google:{script:{run:runner}}});assert(posted.some(p=>p[0]==='quiz'));
let receipt;bridgeHandler({origin:'https://raw.githack.com',source:{postMessage:d=>receipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert(receipt.ok);
gas.doGet({parameter:{channel:'a'.repeat(40),origin:'https://kotam913-art.github.io'}});assert(html.includes('postMessage'));
let pagesHandler,pagesReceipt;vm.runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1],{window:{parent:top,addEventListener:(k,f)=>pagesHandler=f},google:{script:{run:runner}}});
pagesHandler({origin:'https://evil.test',source:{postMessage:d=>pagesReceipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert.equal(pagesReceipt,undefined);
pagesHandler({origin:'https://kotam913-art.github.io',source:{postMessage:d=>pagesReceipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert(pagesReceipt.ok);
for(const origin of ['https://evil.test','https://kotam913-art.github.io.evil.test','http://kotam913-art.github.io']){gas.doGet({parameter:{channel:'a'.repeat(40),origin}});assert(!html.includes('postMessage'))}
gas.doGet({parameter:{mode:'submit'}});new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
let metadata='';gas.ContentService={MimeType:{JAVASCRIPT:'js',JSON:'json'},createTextOutput:s=>{metadata=s;return {setMimeType(){return this}}}};
gas.doGet({parameter:{mode:'status',callback:'__quiz_status_'+'a'.repeat(40)}});new vm.Script(metadata);assert(!/student|secret|answers/.test(metadata));
gas.doGet({parameter:{mode:'status',callback:'alert(1)'}});assert.deepEqual(JSON.parse(metadata),{version:5,post:true});
console.log('PASS: early readiness, no partial-score sends, blocked iframe fallback, POST-body credentials, no false receipts, allowed origins');
