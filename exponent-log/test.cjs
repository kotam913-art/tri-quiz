const fs=require('fs'),vm=require('vm'),assert=require('assert');const data=require('./data.js'),E=require('./engine.js');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../submission/Code.gs','utf8'),ctx);
assert.equal(data.length,18);assert.equal(new Set(data.map(t=>t.id)).size,18);assert.deepEqual([...new Set(data.flatMap(t=>t.sourcePages))],[1,2,3,16,17,4,5,6,7,8,9,10,11,12,13,14,15]);
for(const task of data){assert(task.questions.length>=3&&task.questions.length<=6);const a=task.questions.map(q=>q.answer);assert(E.grade(task,a).every(Boolean));assert(ctx.perfect_(task.id,a));assert(!ctx.perfect_(task.id,a.slice(1)));for(let i=0;i<a.length;i++){const b=[...a];b[i]='';assert(!ctx.perfect_(task.id,b));assert(!E.grade(task,b)[i]);const q=task.questions[i];if(q.type==='choice')assert(Number(q.answer)>=0&&Number(q.answer)<q.options.length);else assert(Number.isFinite(E.number(q.answer)))}}
assert.equal(E.number('−３／２'),-1.5);assert(Number.isNaN(E.number('1/0')));assert(Number.isNaN(E.number('')));assert(Number.isNaN(E.number('1+1')));
// Independent numeric checks for exponential/log calculations and digits.
const log=(a,b)=>Math.log(b)/Math.log(a);
const truth={1:[1,1/16,4-2,-3-2,-4,4*-2],2:[1/4,2/3,-1/4,6],3:[8**(.5+1/3-1/6),2**(.5+1/3+1/6),3**(.5-1/6-1/3),.25+3/8-.5],6:[log(4,8),log(9,1/27),(log(4,1/64)-1)/2,log(8,4)],8:[log(3,9),log(2,16),log(4,8),log(.5,32),log(9,Math.sqrt(3))],10:[log(2,2)+log(2,8),log(3,63)-log(3,21),log(3,Math.sqrt(12))-log(3,2),log(2,2/5)+log(2,10)-log(2,8),3*log(2,2)+.5*log(2,3)-log(2,4*Math.sqrt(6))],11:[log(9,27),log(8,Math.sqrt(2)),log(16,64),log(2,3)*log(3,4),log(25,75)-log(25,3)],17:[3,4,20,9],18:[Math.floor(20*.3010)+1,Math.floor(20*.4771)+1,Math.floor(30*.3010)+1]};
for(const [n,answers] of Object.entries(truth))answers.forEach((v,i)=>assert(Math.abs(E.number(data[n-1].questions[i].answer)-v)<1e-8,`${n}-${i}`));
assert(Math.abs(log(3,9)+log(3,9-8)-2)<1e-9);assert(Math.abs(log(2,2+1)+log(2,2+2)-log(2,12))<1e-9);
// Correct interval choices tested at boundaries and interior/exterior points.
for(const x of [-2,0,2/3,1,4/3,2,2.5,3,5,8,11,12,28,29]){
 assert.equal(8**x>16+1e-10,x>4/3);
 assert.equal(4**(x+1)>=8**(x-3)-1e-10,x<=11);
 if(x>2.5)assert.equal(log(.5,2*x-5)>=log(.5,x+3)-1e-10,x<=8);
}
console.log('PASS: 18 quizzes / 79 answers; every incomplete submission rejected; independent numeric and inequality checks');
