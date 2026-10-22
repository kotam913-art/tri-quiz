const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
// Exercise the real transport with a small DOM fixture; no live student records.
const fields=Object.fromEntries(['grade','group','number','code'].map(k=>[k,{value:'',disabled:false}]));
const handlers={},form={elements:fields,querySelectorAll:()=>[...Object.values(fields)],addEventListener:(type,f)=>handlers[type]=f};
const status={textContent:''},links={direct:{hidden:true,addEventListener(type,f){this.click=f}},login:{}},frames=[],documentEvents={},windowEvents={},timeouts=[];
const panel={dataset:{},style:{},set innerHTML(x){},querySelector:s=>s==='form'?form:s==='[role=status]'?status:s==='[data-direct]'?links.direct:links.login};
const body={append(node){if(node!==panel)frames.push(node)}};
const doc={readyState:'complete',body,querySelector:()=>null,addEventListener:(k,f)=>documentEvents[k]=f,createElement:type=>type==='section'?panel:{remove(){this.removed=true}}};
const endpoint='https://script.google.com/macros/s/TEST/exec',store={};
const c={document:doc,crypto:require('node:crypto').webcrypto,location:{origin:'https://raw.githack.com'},sessionStorage:{getItem:k=>store[k],setItem:(k,v)=>store[k]=v},setTimeout:(f,ms)=>{timeouts.push({f,ms});return timeouts.length},clearTimeout(){},URL,encodeURIComponent};
c.window={QUIZ_SUBMISSION_CONFIG:{endpoint},addEventListener:(k,f)=>windowEvents[k]=f};
vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/client.js','utf8'),c);
documentEvents.DOMContentLoaded();
for(const [k,v] of Object.entries({grade:'２',group:'１',number:'０７',code:' ｓｅｃｒｅｔ '}))fields[k].value=v;
c.window.QuizSubmission.graded('explog-01',1,6,['wrong']);assert.equal(frames.length,0);assert(links.direct.hidden);
c.window.QuizSubmission.graded('explog-01',6,6,['1','1/16','2','-5','-4','-8']);assert.equal(frames.length,1);assert(!links.direct.hidden);
assert(!links.direct.href.includes('secret'));const packet=JSON.parse(decodeURIComponent(new URL(links.direct.href).hash.slice(1)));assert.deepEqual(Object.keys(packet).sort(),['answers','task']);assert.equal(packet.task,'explog-01');
const channel=new URL(frames[0].src).searchParams.get('channel');let sent;
const source={postMessage:(data,origin)=>sent={data,origin}};
windowEvents.message({origin:'https://evil.test',source,data:{type:'ready',channel}});assert.equal(sent,undefined);
windowEvents.message({origin:'https://n-example-script.googleusercontent.com',source,data:{type:'ready',channel}});
assert.equal(sent.data.payload.student.code,'secret');assert.equal(sent.data.payload.student.grade,'2');assert(timeouts.some(t=>t.ms===90000));
windowEvents.message({origin:'https://n-example-script.googleusercontent.com',source,data:{type:'result',channel,ok:false,reason:'CODE',error:'CODE ERROR'}});assert.equal(status.textContent,'CODE ERROR');
handlers.submit({preventDefault(){}});
windowEvents.message({origin:'https://n-example-script.googleusercontent.com',source,data:{type:'result',channel,ok:true}});assert(status.textContent.startsWith('提出済み'));
assert(!JSON.stringify(store).includes('secret'));
// Connection timeouts offer a visible first-party path; they never imply success.
sent=null;const c2={...c,document:doc,window:{QUIZ_SUBMISSION_CONFIG:{endpoint},addEventListener:(k,f)=>windowEvents[k]=f}};
vm.createContext(c2);vm.runInContext(fs.readFileSync(__dirname+'/client.js','utf8'),c2);c2.window.QuizSubmission.graded('basic',1,1,['1']);
timeouts.filter(t=>t.ms===12000).at(-1).f();assert(status.textContent.includes('接続待ち'));assert(!status.textContent.includes('提出済み'));assert(!links.direct.hidden);
// The sandbox bridge targets real ancestors, not a presumed window.top.
let html='';const gas={HtmlService:{XFrameOptionsMode:{ALLOWALL:'all'},createHtmlOutput:s=>{html=s;return {setXFrameOptionsMode(){return this},setTitle(){return this},addMetaTag(){return this}}}}};
vm.createContext(gas);vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),gas);
gas.doGet({parameter:{channel:'a'.repeat(40),origin:'https://raw.githack.com'}});
const bridgeScript=html.match(/<script>([\s\S]*)<\/script>/)[1];const posted=[];let bridgeHandler;
const top={postMessage:d=>posted.push(['outer',d])};top.parent=top;
const quiz={parent:top,postMessage:d=>posted.push(['quiz',d])};const wrapper={parent:quiz,postMessage:d=>posted.push(['wrapper',d])};
const runner={withSuccessHandler(f){this.ok=f;return this},withFailureHandler(){return this},submitPerfect(){this.ok({ok:true})}};
const bw={parent:wrapper,addEventListener:(k,f)=>bridgeHandler=f};vm.runInNewContext(bridgeScript,{window:bw,google:{script:{run:runner}}});assert(posted.some(p=>p[0]==='quiz'));
let receipt;bridgeHandler({origin:'https://raw.githack.com',source:{postMessage:d=>receipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert(receipt.ok);
// Both published hosts work; unrelated and lookalike hosts never get a bridge.
gas.doGet({parameter:{channel:'a'.repeat(40),origin:'https://kotam913-art.github.io'}});
assert(html.includes('postMessage'));
const pagesScript=html.match(/<script>([\s\S]*)<\/script>/)[1];let pagesHandler,pagesReceipt;
vm.runInNewContext(pagesScript,{window:{parent:top,addEventListener:(k,f)=>pagesHandler=f},google:{script:{run:runner}}});
pagesHandler({origin:'https://evil.test',source:{postMessage:d=>pagesReceipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert.equal(pagesReceipt,undefined);
pagesHandler({origin:'https://kotam913-art.github.io',source:{postMessage:d=>pagesReceipt=d},data:{type:'submit',channel:'a'.repeat(40),payload:{}}});assert(pagesReceipt.ok);
for(const origin of ['https://evil.test','https://kotam913-art.github.io.evil.test','http://kotam913-art.github.io']){
  gas.doGet({parameter:{channel:'a'.repeat(40),origin}});assert(!html.includes('postMessage'));
}
gas.doGet({parameter:{mode:'submit'}});assert(html.includes('google.script.url.getLocation'));assert(html.includes('submitPerfect'));
new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
console.log('PASS: iframe nesting, Unicode inputs, credential-free direct link, timeout handling, verified receipts, direct-page syntax');
