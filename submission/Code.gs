// スプレッドシートの「拡張機能 → Apps Script」に貼り付けます。
// 初期設定・課題更新は adminSetup を実行。提出コード発行は adminIssueCodes。
const EXP_TASKS_ = {"explog-01": {"title": "整数の指数・指数法則", "questions": [{"type": "number", "answer": "1"}, {"type": "number", "answer": "1/16"}, {"type": "number", "answer": "2"}, {"type": "number", "answer": "-5"}, {"type": "number", "answer": "-4"}, {"type": "number", "answer": "-8"}]}, "explog-02": {"title": "累乗根と分数の指数", "questions": [{"type": "number", "answer": "1/4"}, {"type": "number", "answer": "2/3"}, {"type": "number", "answer": "-1/4"}, {"type": "number", "answer": "6"}]}, "explog-03": {"title": "分数の指数の計算", "questions": [{"type": "number", "answer": "4"}, {"type": "number", "answer": "2"}, {"type": "number", "answer": "1"}, {"type": "number", "answer": "1/8"}]}, "explog-04": {"title": "指数関数のグラフ", "questions": [{"type": "number", "answer": "1"}, {"type": "number", "answer": "1/3"}, {"type": "choice", "answer": "0"}, {"type": "choice", "answer": "1"}, {"type": "choice", "answer": "0"}]}, "explog-05": {"title": "指数・累乗根の大小比較", "questions": [{"type": "choice", "answer": "0"}, {"type": "choice", "answer": "1"}, {"type": "choice", "answer": "0"}, {"type": "choice", "answer": "2"}]}, "explog-06": {"title": "指数方程式", "questions": [{"type": "number", "answer": "3/2"}, {"type": "number", "answer": "-3/2"}, {"type": "number", "answer": "-2"}, {"type": "number", "answer": "2/3"}]}, "explog-07": {"title": "指数不等式", "questions": [{"type": "choice", "answer": "0"}, {"type": "choice", "answer": "1"}, {"type": "choice", "answer": "1"}, {"type": "choice", "answer": "2"}]}, "explog-08": {"title": "対数の意味と値", "questions": [{"type": "number", "answer": "2"}, {"type": "number", "answer": "4"}, {"type": "number", "answer": "3/2"}, {"type": "number", "answer": "-5"}, {"type": "number", "answer": "1/4"}]}, "explog-09": {"title": "対数の性質", "questions": [{"type": "number", "answer": "5"}, {"type": "number", "answer": "7"}, {"type": "number", "answer": "3"}, {"type": "number", "answer": "5"}, {"type": "number", "answer": "2"}, {"type": "number", "answer": "1/2"}]}, "explog-10": {"title": "対数をまとめて計算", "questions": [{"type": "number", "answer": "4"}, {"type": "number", "answer": "1"}, {"type": "number", "answer": "1/2"}, {"type": "number", "answer": "-1"}, {"type": "number", "answer": "1/2"}]}, "explog-11": {"title": "底の変換公式", "questions": [{"type": "number", "answer": "3/2"}, {"type": "number", "answer": "1/6"}, {"type": "number", "answer": "3/2"}, {"type": "number", "answer": "2"}, {"type": "number", "answer": "1"}]}, "explog-12": {"title": "対数の条件とグラフ", "questions": [{"type": "choice", "answer": "0"}, {"type": "number", "answer": "0"}, {"type": "number", "answer": "-1"}, {"type": "choice", "answer": "1"}, {"type": "choice", "answer": "3"}]}, "explog-13": {"title": "対数の大小比較", "questions": [{"type": "choice", "answer": "0"}, {"type": "choice", "answer": "2"}, {"type": "choice", "answer": "2"}, {"type": "choice", "answer": "2"}, {"type": "choice", "answer": "0"}]}, "explog-14": {"title": "対数方程式・基本の不等式", "questions": [{"type": "number", "answer": "16"}, {"type": "number", "answer": "1/4"}, {"type": "choice", "answer": "0"}, {"type": "choice", "answer": "1"}]}, "explog-15": {"title": "対数の和を含む方程式", "questions": [{"type": "choice", "answer": "1"}, {"type": "number", "answer": "9"}, {"type": "number", "answer": "2"}]}, "explog-16": {"title": "真数条件を伴う対数不等式", "questions": [{"type": "choice", "answer": "1"}, {"type": "choice", "answer": "0"}, {"type": "choice", "answer": "2"}]}, "explog-17": {"title": "常用対数と桁数の考え方", "questions": [{"type": "number", "answer": "3"}, {"type": "number", "answer": "4"}, {"type": "number", "answer": "20"}, {"type": "number", "answer": "9"}]}, "explog-18": {"title": "常用対数で累乗の桁数を求める", "questions": [{"type": "number", "answer": "7"}, {"type": "number", "answer": "10"}, {"type": "number", "answer": "10"}]}};
const TASKS_ = {basic:'三角比 基本',angle:'角度・単位円',trig:'三角関数 思考ステップ',radian:'弧度法・2つの角',...Object.fromEntries(Object.entries(EXP_TASKS_).map(([id,t])=>[id,'指数対数 '+id.slice(-2)+' '+t.title]))};
function setup_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID',ss.getId());
  [['名簿',['学年','組','出席番号','提出コード']],['満点記録',['年度','学年','組','出席番号','課題ID','課題名','達成日時']],['集計',['年度','学年','組','出席番号',...Object.values(TASKS_),'加点合計']]].forEach(([name,header])=>{
    const sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getMaxColumns()<header.length)sh.insertColumnsAfter(sh.getMaxColumns(),header.length-sh.getMaxColumns());if(sh.getLastRow()===0)sh.appendRow(header);sh.setFrozenRows(1);sh.getRange(1,1,1,header.length).setBackground('#173b72').setFontColor('white').setFontWeight('bold');
  });
  refreshSummary_();
}
function book_(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'))}
function issueCodes_(){
  const sh=book_().getSheetByName('名簿');if(sh.getLastRow()<2)return;
  const rows=sh.getRange(2,1,sh.getLastRow()-1,4).getValues();
  rows.forEach((r,i)=>{if(r.slice(0,3).every(x=>String(x).trim())&&!r[3])sh.getRange(i+2,4).setValue(Utilities.getUuid().replace(/-/g,'').slice(0,12))});refreshSummary_();
}
function refreshSummary_(){
  const ss=book_(), ids=Object.keys(TASKS_);
  writeSummary_(ss,'集計',ids);
  writeSummary_(ss,'三角関数の集計',ids.filter(id=>!id.startsWith('explog-')));
  writeSummary_(ss,'指数・対数の集計',ids.filter(id=>id.startsWith('explog-')));
}
function writeSummary_(ss,name,ids){
  const sh=ss.getSheetByName(name)||ss.insertSheet(name);
  const headers=['年度','学年','組','出席番号',...ids.map(id=>TASKS_[id]),'加点合計'];
  sh.setFrozenRows(1);
  sh.setFrozenColumns(4);
  if(sh.getMaxColumns()<headers.length)sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
  sh.getRange('A2').clearContent();
  sh.getRange(1,1,1,headers.length).setValues([headers]).setBackground('#173b72').setFontColor('white').setFontWeight('bold');
  const columns=ids.map(id=>`MAP(grades,groups,nums,LAMBDA(gg,cc,nn,IF(COUNTIFS('満点記録'!A2:A,schoolyear,'満点記録'!B2:B,gg,'満点記録'!C2:C,cc,'満点記録'!D2:D,nn,'満点記録'!E2:E,"${id}")>0,1,0)))`).join(',');
  sh.getRange('A2').setFormula(`=IFERROR(LET(schoolyear,YEAR(TODAY())-IF(MONTH(TODAY())<4,1,0),roster,FILTER('名簿'!A2:C,'名簿'!A2:A<>""),grades,CHOOSECOLS(roster,1),groups,CHOOSECOLS(roster,2),nums,CHOOSECOLS(roster,3),scores,HSTACK(${columns}),HSTACK(ARRAYFORMULA(IF(grades<>"",schoolyear,)),roster,scores,BYROW(scores,LAMBDA(rowvalues,SUM(rowvalues))))),"")`);
}
// スプレッドシートを開き直すと管理メニューが現れます。
function onOpen(){SpreadsheetApp.getUi().createMenu('クイズ管理').addItem('初期設定・課題を更新','adminSetup').addItem('提出コードを発行','adminIssueCodes').addToUi()}
function requireEditor_(){
 const sheet=SpreadsheetApp.getActiveSpreadsheet();
 const email=Session.getActiveUser().getEmail();
 if(!sheet||!email||email!==Session.getEffectiveUser().getEmail())throw Error('スプレッドシートの編集画面から実行してください。');
 const allowed=PropertiesService.getScriptProperties().getProperty('SHEET_ID');
 if(allowed&&allowed!==sheet.getId())throw Error('登録したスプレッドシートから実行してください。');
}
function adminSetup(){requireEditor_();setup_()}
function adminIssueCodes(){requireEditor_();issueCodes_()}
function doGet(e){
  const params=e&&e.parameter||{};const channel=String(params.channel||''),origin=String(params.origin||'');
  if(!/^[\w-]{20,80}$/.test(channel)||origin!=='https://raw.githack.com')return HtmlService.createHtmlOutput('満点提出用の接続先です。教材サイトから利用してください。');
  const html='<!doctype html><html><body><script>const channel='+JSON.stringify(channel)+', origin='+JSON.stringify(origin)+';window.addEventListener("message",e=>{const d=e.data;if(e.origin!==origin||e.source!==window.top||!d||d.channel!==channel||d.type!=="submit")return;google.script.run.withSuccessHandler(r=>window.top.postMessage({type:"result",channel,...r},origin)).withFailureHandler(()=>window.top.postMessage({type:"result",channel,ok:false,error:"保存できませんでした。再送してください。"},origin)).submitPerfect(d.payload)});window.top.postMessage({type:"ready",channel},origin);</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function submitPerfect(payload){
  try{
    if(!payload||JSON.stringify(payload).length>20000||!Object.prototype.hasOwnProperty.call(TASKS_,payload.task))throw Error('提出内容が不正です。');
    const s=payload.student||{},nums=['grade','group','number'].map(k=>Number(s[k]));
    if(nums.some(x=>!Number.isInteger(x)||x<1)||nums[0]>6||nums[1]>30||nums[2]>99)throw Error('学年・組・出席番号を確認してください。');
    const ss=book_(),roster=ss.getSheetByName('名簿').getDataRange().getValues().slice(1);
    const found=roster.filter(r=>nums.every((n,i)=>Number(r[i])===n));
    if(found.length!==1||!found[0][3]||String(found[0][3])!==String(s.code||''))throw Error('学年・組・番号・提出コードを確認してください。');
    if(!perfect_(payload.task,payload.answers))throw Error('満点を確認できませんでした。問題をやり直してください。');
    const lock=LockService.getScriptLock();lock.waitLock(25000);
    try{
      const sh=ss.getSheetByName('満点記録'),now=new Date(),y=Number(Utilities.formatDate(now,'Asia/Tokyo','yyyy'))-(Number(Utilities.formatDate(now,'Asia/Tokyo','M'))<4?1:0);
      const duplicate=sh.getDataRange().getValues().slice(1).some(r=>Number(r[0])===y&&nums.every((n,i)=>Number(r[i+1])===n)&&r[4]===payload.task);
      if(!duplicate)sh.appendRow([y,...nums,payload.task,TASKS_[payload.task],now]);
      SpreadsheetApp.flush();return {ok:true,duplicate};
    }finally{lock.releaseLock()}
  }catch(e){return {ok:false,error:e.message||'保存できませんでした。'};}
}
function norm_(v){return String(v==null?'':v).normalize('NFKC').trim().replace(/[−－ー]/g,'-').replace(/\s+/g,'')}
// 数値式を専用パーサーで評価します。受信文字列をeval/Functionに渡しません。
function number_(raw){
 let s=norm_(raw).toLowerCase().replace(/[°度]/g,'').replace(/[×x]/g,'*').replace(/÷/g,'/').replace(/(?:root|sqrt|rt|r)/g,'√').replace(/(\d)√/g,'$1*√');
 if(!s||s.length>100)return NaN;
 let i=0;
 function atom(){if(s[i]==='+'){i++;return atom()}if(s[i]==='-'){i++;return -atom()}if(s[i]==='√'){i++;return Math.sqrt(atom())}if(s[i]==='('){i++;const v=expr();if(s[i++]!==')')throw Error();return v}if(s[i]==='π'){i++;return Math.PI}const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error();i+=m[0].length;return Number(m[0])}
 function product(){let v=atom();while(s[i]==='*'||s[i]==='/'){const op=s[i++],b=atom();v=op==='*'?v*b:v/b}return v}
 function expr(){let v=product();while(s[i]==='+'||s[i]==='-'){const op=s[i++],b=product();v=op==='+'?v+b:v-b}return v}
 try{const v=expr();return i===s.length&&Number.isFinite(v)?v:NaN}catch(e){return NaN}
}
function close_(raw,n,tol){return Math.abs(number_(raw)-n)<=(tol||1e-6)}
function ratio_(v){if(!v)return NaN;const n=number_(v.n===undefined?v[0]:v.n),d=number_(v.d===undefined?v[1]:v.d);return d!==0?n/d:NaN}
function perfect_(task,a){
 try{
 if(Object.prototype.hasOwnProperty.call(EXP_TASKS_,task)){const qs=EXP_TASKS_[task].questions;return Array.isArray(a)&&a.length===qs.length&&qs.every((q,i)=>q.type==='number'?close_(a[i],number_(q.answer),1e-8):String(a[i])===q.answer)}
 if(task==='basic'){
  const values=[4,Math.sqrt(5),2,1,Math.sqrt(3),Math.sqrt(2),1,1,2,Math.sqrt(3),1,Math.sqrt(3)/2,-Math.sqrt(3)/2,null,Math.sqrt(2),45,2,60,30,Math.sqrt(3)];
  return Array.isArray(a)&&a.length===20&&values.every((v,i)=>v===null?['なし','ない','存在しない','定義されない','未定義','不可能','undefined','undef','dne','nan','×','x'].includes(norm_(a[i]).toLowerCase()):close_(a[i],v,.015));
 }
 if(task==='angle')return a.deg.length===6&&a.frac.length===9&&[210,225,240,300,315,330].every((n,i)=>close_(a.deg[i],n,1e-4))&&[2/3,3/4,5/6,7/6,5/4,4/3,5/3,7/4,11/6].every((n,i)=>Math.abs(ratio_(a.frac[i])-n)<1e-6);
 if(task==='radian')return ['π/3','π/4','π/6','7π/6','5π/3','3π/4'].every((v,i)=>a.conversions['c'+(i+1)]===v)&&[[1,4],[3,4],[2,3],[1,3],[2,4]].every((v,i)=>Array.isArray(a.pairs['p'+(i+1)])&&a.pairs['p'+(i+1)].length===2&&v.every(n=>a.pairs['p'+(i+1)].includes(n)));
 if(task==='trig'){
 const angles={'π/6':30,'5π/6':150,'7π/6':210,'−5π/6':210,'−7π/6':150,'13π/6':30,'π/4':45,'3π/4':135,'−π/4':315,'−5π/4':135,'−7π/4':45,'9π/4':45,'π/3':60,'2π/3':120,'4π/3':240,'−2π/3':240,'−4π/3':120,'7π/3':60};
 if(!Array.isArray(a)||a.length!==3)return false;
 const refs=[];
 const ok=a.every(v=>{if(!Object.prototype.hasOwnProperty.call(angles,v.theta))return false;const d=angles[v.theta],q=d<90?1:d<180?2:d<270?3:4,ref=q===1?d:q===2?180-d:q===3?d-180:360-d,s=v.answer;refs.push(ref);return String(s.q)===String(q)&&String(s.ref)===String(ref)&&s.x===(q===1||q===4?'+':'-')&&s.y===(q<3?'+':'-')&&['sin','cos','tan'].every(f=>Math.abs(ratio_(s[f])-Math[f](d*Math.PI/180))<1e-6)});
 return ok&&new Set(refs).size===3;
 }
 return false;
 }catch(e){return false}
}
