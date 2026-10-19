// Display-only formatting. The original answer strings remain unchanged for grading.
const ExpLogFormat=(()=>{
 function math(source){
  let s=String(source).replace(/log₍₁\/([₂₃])₎/g,(_,d)=>'log<sub>1/'+(d==='₂'?'2':'3')+'</sub>').replace(/\^\(([^()]*)\)/g,'<sup>$1</sup>').replace(/\^([a-z])/g,'<sup>$1</sup>');
  const saved=[];
  const atom='(?:log[₀₁₂₃₄₅₆₇₈₉]+(?:√)?[0-9]+|[⁰¹²³⁴⁵⁶⁷⁸⁹]*√[0-9]+|[−-]?[0-9n]+(?:\\.[0-9]+)?(?:√[0-9]+)?[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*|@F[0-9]+@)';
  const term='(?:\\('+atom+'\\)|'+atom+')';
  const re=new RegExp('('+term+')\\s*/\\s*('+term+')','g');
  s=s.split(/(<\/?(?:sup|sub)>)/g).map(part=>{
   if(/^<\/?(?:sup|sub)>$/.test(part))return part;
   let prev;do{prev=part;part=part.replace(re,(_,n,d)=>{const clean=x=>x.startsWith('(')&&x.endsWith(')')?x.slice(1,-1):x;const id=saved.length;saved.push('<span class="math-frac"><span class="math-num">'+clean(n)+'</span><span class="math-den">'+clean(d)+'</span></span>');return '@F'+id+'@'})}while(part!==prev);
   return part;
  }).join('');
  while(/@F\d+@/.test(s))s=s.replace(/@F(\d+)@/g,(_,i)=>saved[Number(i)]);
  return s;
 }
 return {math};
})();
if(typeof module!=='undefined')module.exports=ExpLogFormat;
