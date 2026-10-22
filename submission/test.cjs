const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),c);
const basic=['4','√5','2','1','√3','√2','1','1','2','√3','1','√3/2','-√3/2','定義されない','√2','45','2','60','30','√3'];
assert(c.perfect_('basic',basic));assert(!c.perfect_('basic',basic.slice(1)));assert(!c.perfect_('basic',['',...basic.slice(1)]));
const angle={deg:[210,225,240,300,315,330],frac:[[2,3],[3,4],[5,6],[7,6],[5,4],[4,3],[5,3],[7,4],[11,6]]};assert(c.perfect_('angle',angle));assert(!c.perfect_('angle',{...angle,frac:[[2,0],...angle.frac.slice(1)]}));
const radian={conversions:{c1:'π/3',c2:'π/4',c3:'π/6',c4:'7π/6',c5:'5π/3',c6:'3π/4'},pairs:{p1:[1,4],p2:[3,4],p3:[2,3],p4:[1,3],p5:[2,4]}};assert(c.perfect_('radian',radian));assert(!c.perfect_('radian',{...radian,pairs:{...radian.pairs,p1:[1,1]}}));
const trig=[['π/6',30],['3π/4',135],['4π/3',240]].map(([theta,d])=>({theta,answer:{q:String(d<90?1:d<180?2:3),ref:String(d===30?30:d===135?45:60),x:d<90?'+':'-',y:d<180?'+':'-',sin:{n:String(Math.sin(d*Math.PI/180)),d:'1'},cos:{n:String(Math.cos(d*Math.PI/180)),d:'1'},tan:{n:String(Math.tan(d*Math.PI/180)),d:'1'}}}));assert(c.perfect_('trig',trig));assert(!c.perfect_('trig',[trig[0],trig[0],trig[0]]));
assert(Number.isNaN(c.number_('process.exit()')));assert(Number.isNaN(c.number_('')));assert(Number.isNaN(c.number_('1/0')));
// Mock storage: no writes for wrong score/code, dedupe successful and repeated requests.
const rows=[['年度','学年','組','番号','課題']];let locked=false;
c.PropertiesService={getScriptProperties:()=>({getProperty:()=> 'test'})};
c.LockService={getScriptLock:()=>({tryLock:()=>{locked=true;return true},releaseLock:()=>{locked=false}})};
c.Utilities={formatDate:(d,z,f)=>f==='yyyy'?'2026':'10'};
c.SpreadsheetApp={openById:()=>({getSheetByName:name=>name==='名簿'?{getDataRange:()=>({getDisplayValues:()=>[['学年','組','番号','コード'],[2,1,1,'secret']]})}:{getDataRange:()=>({getValues:()=>rows}),appendRow:r=>rows.push(r)}}),flush:()=>{}};
const p={task:'basic',answers:basic,student:{grade:2,group:1,number:1,code:'secret'}};
assert(!c.submitPerfect({...p,answers:[]}).ok);assert.equal(rows.length,1);
assert(!c.submitPerfect({...p,student:{...p.student,code:'wrong'}}).ok);assert.equal(rows.length,1);
assert(c.submitPerfect(p).ok);assert.equal(rows.length,2);assert(c.submitPerfect(p).duplicate);assert.equal(rows.length,2);assert(!locked);
assert(c.submitPerfect({...p,student:{grade:'２',group:'１',number:'１',code:' ｓｅｃｒｅｔ '}}).duplicate);
c.LockService={getScriptLock:()=>({tryLock:()=>false})};
assert(c.submitPerfect(p).retryable);assert.equal(rows.length,2);
assert.equal(c.submitPerfect({...p,task:'not-a-task'}).reason,'TASK');
assert.equal(c.submitPerfect({...p,student:{...p.student,code:'Secret'}}).reason,'CODE');
// Top-level POST uses the same validator and duplicate guard; no credential echo.
let html='';c.HtmlService={createHtmlOutput:s=>{html=s;return {setTitle(){return this},addMetaTag(){return this}}}};
c.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})};
c.doPost({parameter:{payload:JSON.stringify(p)}});assert(html.includes('提出済みです'));assert(html.includes('すでに記録されています'));assert.equal(rows.length,2);assert(!html.includes('secret'));
c.doPost({parameter:{payload:JSON.stringify({...p,student:{...p.student,code:'wrong'}})}});assert(html.includes('提出できませんでした'));assert.equal(rows.length,2);
c.doPost({parameter:{payload:JSON.stringify({...p,answers:[]})}});assert(html.includes('満点と確認できませんでした'));assert.equal(rows.length,2);
for(const raw of ['{broken', 'null', 'x'.repeat(20001)]){c.doPost({parameter:{payload:raw}});assert(html.includes('提出できませんでした'));assert.equal(rows.length,2)}
c.doPost();assert(html.includes('提出できませんでした'));
c.doPost({parameter:{payload:JSON.stringify({task:'explog-01',answers:['1','1/16','2','-5','-4','-8'],student:p.student})}});assert(html.includes('満点の達成を記録しました'));assert.equal(rows.length,3);
c.postResult_({ok:false,error:'<img src=x onerror=alert(1)>'},'basic');assert(!html.includes('<img'));assert(html.includes('&lt;img'));
console.log('PASS: 4 validators, malformed answers, identity, non-perfect rejection, duplicate prevention');
