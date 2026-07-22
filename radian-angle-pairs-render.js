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
  function pairCard(q,index){
    const regionNames=['','右上','左上','左下','右下'];
    return `<article class="question-card pair-card" data-id="${q.id}">
      <div class="qhead"><span class="qnum">${index+1}</span><span class="score">— / 1</span></div>
      <div class="equation">${equationMarkup(q)}</div>
      <div class="pair-layout">
        <p class="select-note">円の中で三角形を描きたい場所をタップ</p>
        <div class="circle-picker">
          <svg class="unit-circle" viewBox="0 0 180 180" role="img" aria-label="三角形を描く円"></svg>
          ${[1,2,3,4].map(quadrant=>`<button class="quadrant-hit q${quadrant}" data-quadrant="${quadrant}" aria-label="円の${regionNames[quadrant]}に三角形を描く"></button>`).join('')}
        </div>
        <p class="toggle-note">同じ場所をもう一度タップすると取り消せます。</p>
        <p class="limit-note" aria-live="polite"></p>
      </div>
      <div class="pair-answer"><strong>答え合わせ</strong><div class="answer-legend" aria-label="あなたの答えは青、正答は赤"><span><i class="legend-choice"></i>あなたの答え</span><span><i class="legend-correct"></i>正答</span></div><p>青い三角形と赤い三角形の位置を比べよう。</p></div>
    </article>`;
  }
  function angleForQuadrant(reference,quadrant){
    return quadrant===1?reference:quadrant===2?180-reference:quadrant===3?180+reference:360-reference;
  }
  function triangleMarkup(quadrants,q,kind){
    const cx=90,cy=90,r=64;
    return quadrants.map(quadrant=>{
      const angle=angleForQuadrant(q.ref,quadrant);
      const rad=angle*Math.PI/180;
      const x=cx+r*Math.cos(rad),y=cy-r*Math.sin(rad);
      return `<polygon class="${kind}-triangle" points="${cx},${cy} ${x},${y} ${x},${cy}"></polygon><line class="${kind}-leg" x1="${x}" y1="${y}" x2="${x}" y2="${cy}"></line><line class="${kind}-ray" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line><circle class="${kind}-dot" cx="${x}" cy="${y}" r="3.5"></circle>`;
    }).join('');
  }
  function drawCircle(svg,selected,q,graded){
    const cx=90,cy=90,r=64;
    const chosen=triangleMarkup(selected,q,'chosen');
    const correct=graded?triangleMarkup(q.quadrants,q,'correct'):'';
    svg.classList.toggle('graded',graded);
    svg.setAttribute('aria-label',graded?'青があなたの答え、赤が正答の円':'三角形を描く円');
    svg.innerHTML=`<circle class="circle-line" cx="${cx}" cy="${cy}" r="${r}"></circle><line class="axis" x1="13" y1="${cy}" x2="167" y2="${cy}"></line><line class="axis" x1="${cx}" y1="13" x2="${cx}" y2="167"></line>${chosen}${correct}`;
  }
  function render(data){
    document.querySelector('#conversion-grid').innerHTML=data.conversions.map(conversionCard).join('');
    document.querySelector('#pair-grid').innerHTML=data.pairs.map(pairCard).join('');
    document.querySelectorAll('.pair-card').forEach((card,index)=>drawCircle(card.querySelector('svg'),[],data.pairs[index],false));
  }
  window.RadianQuizUI={mathMarkup,drawCircle,render};
})();
