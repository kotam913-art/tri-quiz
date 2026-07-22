'use strict';
const Q=window.QUIZ_DATA,KEY=window.TRIG_QUIZ_KEY||'tri-quiz:trig-function-values-2026:v7',LIMIT=300,$=s=>document.querySelector(s);
const grid=$('#grid'),timer=$('#timer'),progress=$('#progress'),overlay=$('#overlay'),submit=$('#submit'),reset=$('#reset'),result=$('#result');
let state={},startAt=0,timerId=null,locked=false,active=null;
const fs=id=>state[id]||(state[id]={});
const vf=(s,f)=>s[f]&&typeof s[f]==='object'?s[f]:(s[f]={n:'',d:''});
const save=()=>{try{localStorage.setItem(KEY+':state',JSON.stringify(state))}catch(e){}};
const store=(k,v)=>{try{localStorage.setItem(KEY+k,String(v))}catch(e){}};
const get=(k,d='')=>{try{return localStorage.getItem(KEY+k)||d}catch(e){return d}};
const clear=()=>{try{[':state',':start',':done'].forEach(k=>localStorage.removeItem(KEY+k))}catch(e){}};
function term(v){v=String(v||'').trim().replace(/[−－ー]/g,'-').replace(/[ＲｒRr]/g,'√').replace(/\s+/g,'');if(!v)return NaN;let sign=1;if(v[0]==='-'){sign=-1;v=v.slice(1)}else if(v[0]==='+')v=v.slice(1);if(v.includes('√')){const p=v.split('√');if(p.length!==2)return NaN;const c=p[0]?Number(p[0]):1,r=Number(p[1]);return Number.isFinite(c)&&Number.isFinite(r)?sign*c*Math.sqrt(r):NaN}const n=Number(v);return Number.isFinite(n)?sign*n:NaN}
function val(n,d){n=term(n);d=term(d);return Number.isFinite(n)&&Number.isFinite(d)&&d!==0?n/d:NaN}
