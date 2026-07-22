(()=>{
  'use strict';
  const BASE_KEY='tri-quiz:trig-function-values-2026:v7';
  const SESSION_KEY=BASE_KEY+':questions';
  const pool=[
    {code:'p6',theta:'π/6',angle:30,ref:30,hint:'π/6は、正のx軸から反時計回りに30°進んだ位置です。'},
    {code:'5p6',theta:'5π/6',angle:150,ref:30,hint:'5π/6 = π − π/6。πよりπ/6手前の位置です。'},
    {code:'7p6',theta:'7π/6',angle:210,ref:30,hint:'7π/6 = π + π/6。πからさらにπ/6進んだ位置です。'},
    {code:'m5p6',theta:'−5π/6',angle:210,ref:30,hint:'負の角は時計回り。正のx軸から150°進んだ位置です。'},
    {code:'m7p6',theta:'−7π/6',angle:150,ref:30,hint:'−7π/6に2πを加えると5π/6です。'},
    {code:'13p6',theta:'13π/6',angle:30,ref:30,hint:'13π/6 = 2π + π/6。1周してからπ/6進んだ位置です。'},
    {code:'p4',theta:'π/4',angle:45,ref:45,hint:'π/4は、正のx軸から反時計回りに45°進んだ位置です。'},
    {code:'3p4',theta:'3π/4',angle:135,ref:45,hint:'3π/4 = π − π/4。πよりπ/4手前の位置です。'},
    {code:'mp4',theta:'−π/4',angle:315,ref:45,hint:'負の角は時計回り。正のx軸から45°下の位置です。'},
    {code:'m5p4',theta:'−5π/4',angle:135,ref:45,hint:'−5π/4に2πを加えると3π/4です。'},
    {code:'m7p4',theta:'−7π/4',angle:45,ref:45,hint:'−7π/4に2πを加えるとπ/4です。'},
    {code:'9p4',theta:'9π/4',angle:45,ref:45,hint:'9π/4 = 2π + π/4。1周してからπ/4進んだ位置です。'},
    {code:'p3',theta:'π/3',angle:60,ref:60,hint:'π/3は、正のx軸から反時計回りに60°進んだ位置です。'},
    {code:'2p3',theta:'2π/3',angle:120,ref:60,hint:'2π/3 = π − π/3。πよりπ/3手前の位置です。'},
    {code:'4p3',theta:'4π/3',angle:240,ref:60,hint:'4π/3 = π + π/3。πからさらにπ/3進んだ位置です。'},
    {code:'m2p3',theta:'−2π/3',angle:240,ref:60,hint:'負の角は時計回り。正のx軸から120°進んだ位置です。'},
    {code:'m4p3',theta:'−4π/3',angle:120,ref:60,hint:'−4π/3に2πを加えると2π/3です。'},
    {code:'7p3',theta:'7π/3',angle:60,ref:60,hint:'7π/3 = 2π + π/3。1周してからπ/3進んだ位置です。'}
  ];
  const navigation=performance.getEntriesByType('navigation')[0];
  const isReload=navigation&&navigation.type==='reload';
  const randomItem=list=>list[Math.floor(Math.random()*list.length)];
  const shuffle=list=>{
    const copy=[...list];
    for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
    return copy;
  };
  function chooseCodes(){
    let chosen=[];
    for(let tries=0;tries<30;tries++){
      chosen=[30,45,60].map(ref=>randomItem(pool.filter(item=>item.ref===ref)));
      if(new Set(chosen.map(item=>quadrant(item.angle))).size>=2)break;
    }
    return shuffle(chosen).map(item=>item.code);
  }
  function quadrant(angle){return angle<90?1:angle<180?2:angle<270?3:4}
  function exactValues(ref){
    return ref===30?{sin:['1','2',.5],cos:['√3','2',Math.sqrt(3)/2],tan:['√3','3',Math.sqrt(3)/3]}:
      ref===45?{sin:['√2','2',Math.SQRT1_2],cos:['√2','2',Math.SQRT1_2],tan:['1','1',1]}:
      {sin:['√3','2',Math.sqrt(3)/2],cos:['1','2',.5],tan:['√3','1',Math.sqrt(3)]};
  }
  function makeQuestion(spec,index){
    const q=quadrant(spec.angle),x=q===1||q===4?'+':'-',y=q===1||q===2?'+':'-';
    const signs={sin:y==='+'?1:-1,cos:x==='+'?1:-1,tan:x===y?1:-1};
    const exact=exactValues(spec.ref),show={},ph=[];
    ['sin','cos','tan'].forEach(name=>{
      const [num,den,value]=exact[name],signed=(signs[name]<0?'−':'')+num;
      show[name]=den==='1'?signed:`${signed}/${den}`;
      ph.push([signed,den]);
    });
    return {id:`p${index+1}`,angle:spec.angle,theta:spec.theta,q:String(q),ref:String(spec.ref),x,y,
      sin:signs.sin*exact.sin[2],cos:signs.cos*exact.cos[2],tan:signs.tan*exact.tan[2],show,hint:spec.hint,ph};
  }
  let payload=null;
  if(isReload){try{payload=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch(error){}}
  const valid=payload&&Array.isArray(payload.codes)&&payload.codes.length===3&&payload.codes.every(code=>pool.some(item=>item.code===code));
  if(!valid){
    payload={attempt:`${Date.now()}-${Math.random().toString(36).slice(2)}`,codes:chooseCodes()};
    try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(payload))}catch(error){}
  }
  if(!isReload){
    try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key&&key.startsWith(BASE_KEY))localStorage.removeItem(key)}}catch(error){}
  }
  window.TRIG_QUIZ_KEY=`${BASE_KEY}:${payload.attempt}`;
  window.QUIZ_DATA=payload.codes.map((code,index)=>makeQuestion(pool.find(item=>item.code===code),index));
})();
