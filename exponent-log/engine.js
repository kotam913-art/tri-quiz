const ExpLogEngine = (()=>{
 function number(raw){const s=String(raw??'').normalize('NFKC').trim().replace(/[−－ー]/g,'-').replace(/\s+/g,'');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s))return NaN;const a=s.split('/').map(Number);return a.length===1?a[0]:a[1]!==0?a[0]/a[1]:NaN}
 function correct(q,a){return q.type==='number'?Number.isFinite(number(a))&&Math.abs(number(a)-number(q.answer))<1e-8:String(a)===q.answer}
 function grade(task,answers){return task.questions.map((q,i)=>correct(q,answers[i]))}
 return {number,correct,grade};
})();
if(typeof module!=='undefined')module.exports=ExpLogEngine;
