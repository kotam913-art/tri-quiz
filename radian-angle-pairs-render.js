(()=>{
  'use strict';
  function mathMarkup(value){
    const text=String(value);
    const slash=text.lastIndexOf('/');
    if(slash<0)return `<span class="math-whole">${text}</span>`;
    return `<span class="math-frac"><span>${text.slice(0,slash)}</span><i></i><span>${text.slice(slash+1)}</span></span>`;
  }
  function equationMarkup(q){
    const value=q.den==='1'?mathMarkup(q.num):mathMarkup(`${q.num}/${q.den}`);
    return `<span>${q.fn} θ</span><span>=</span><span>${q.sign}${value}</span>`;
  }
  function conversionCard(q,index){
    return `<article class="question-card conversion-card" data-id="${q.id}">
      <div class="qhead"><span class="qnum">${index+1}</span><span class="score">— / 1</span></div>
      <div class="degree-prompt">${q.deg}<sup>°</sup><span class="equals">→ ?</span></div>
      <div class="option-grid">${q.options.map(value=>`<button class="option" data-value="${value}" aria-label="${q.deg}度の答え ${value}">${mathMarkup(value)}</button>`).join('')}</div>
      <div class="answer-panel"><strong>正答</strong><span class="answer-math">${q.deg}° = ${mathMarkup(q.answer)}</span></div>
    </article>`;
  }
  function pairCard(q,index,angles){
    return `<article class="question-card pair-card" data-id="${q.id}">
      <div class="qhead"><span class="qnum">${index+1}</span><span class="score">— / 1</span></div>
      <div class="equation">${equationMarkup(q)}</div>
      <div class="pair-layout">
        <svg class="unit-circle" viewBox="0 0 180 180" role="img" aria-label="単位円"></svg>
        <div><p class="select-note">条件に合う角を2つ選択</p><div class="angle-grid">${angles.map(angle=>`<button class="angle-chip" data-angle="${angle}">${angle}°</button>`).join('')}</div><p class="limit-note" aria-live="polite"></p></div>
      </div>
      <div class="pair-answer"><strong>正答</strong><div class="answer-angles">${q.answers.join('°・')}°</div><p>${q.hint}</p></div>
    </article>`;
  }
  function drawCircle(svg,selected,correct,graded){
    const cx=90,cy=90,r=64;
    const rays=(graded?correct:selected).map(angle=>{
      const rad=angle*Math.PI/180;
      const x=cx+r*Math.cos(rad),y=cy-r*Math.sin(rad);
      return `<line class="leg" x1="${x}" y1="${y}" x2="${x}" y2="${cy}"></line><line class="ray" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line><circle class="dot" cx="${x}" cy="${y}" r="3.5"></circle>`;
    }).join('');
    svg.classList.toggle('graded',graded);
    svg.innerHTML=`<circle class="circle-line" cx="${cx}" cy="${cy}" r="${r}"></circle><line class="axis" x1="13" y1="${cy}" x2="167" y2="${cy}"></line><line class="axis" x1="${cx}" y1="13" x2="${cx}" y2="167"></line>${rays}`;
  }
  function render(data){
    document.querySelector('#conversion-grid').innerHTML=data.conversions.map(conversionCard).join('');
    document.querySelector('#pair-grid').innerHTML=data.pairs.map((q,index)=>pairCard(q,index,data.angles)).join('');
    document.querySelectorAll('.pair-card').forEach(card=>drawCircle(card.querySelector('svg'),[],[],false));
  }
  window.RadianQuizUI={mathMarkup,drawCircle,render};
})();
