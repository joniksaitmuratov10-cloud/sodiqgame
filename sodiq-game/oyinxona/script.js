const $=s=>document.querySelector(s);
const col=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function el(tag,attrs,...kids){const e=document.createElement(tag);for(const k in(attrs||{})){if(k==="class")e.className=attrs[k];else if(k.startsWith("on"))e[k]=attrs[k];else e.setAttribute(k,attrs[k])}kids.flat().forEach(c=>e.append(c&&c.nodeType?c:document.createTextNode(c)));return e}
const mem={};
const store={get(k){try{const v=localStorage.getItem(k);return v===null?(mem[k]??null):v}catch(e){return mem[k]??null}},set(k,v){mem[k]=v;try{localStorage.setItem(k,v)}catch(e){}},del(k){delete mem[k];try{localStorage.removeItem(k)}catch(e){}}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=n=>Math.floor(Math.random()*n);
function canvasBox(box,w,h){const c=document.createElement("canvas");c.width=w;c.height=h;c.className="cv";c.style.maxWidth=w+"px";box.append(c);return{c,x:c.getContext("2d")}}
const cx=(c,e)=>{const r=c.getBoundingClientRect();return(e.clientX-r.left)*c.width/r.width};
function padRow(box,items){box.append(el("div",{class:"padrow"},...items.map(([t,f])=>el("button",{class:"btn",type:"button",onclick:f},t))))}

/* ---------- games ---------- */
function snake(box,ctx){
  const{c,x}=canvasBox(box,360,360),N=18,S=20;
  let sn=[{x:9,y:9},{x:8,y:9},{x:7,y:9}],dir={x:1,y:0},nd=dir,score=0,dead=false,food;
  const rf=()=>{let p;do p={x:rnd(N),y:rnd(N)};while(sn.some(s=>s.x===p.x&&s.y===p.y));return p};
  food=rf();ctx.score(0);ctx.msg("Oʻqlar yoki WASD bilan boshqaring.");
  const steer=(a,b)=>{if(a!==-dir.x||b!==-dir.y)nd={x:a,y:b}};
  ctx.on(window,"keydown",e=>{const m={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]}[e.key];if(m){e.preventDefault();steer(m[0],m[1])}});
  let sx=0,sy=0;
  ctx.on(c,"pointerdown",e=>{sx=e.clientX;sy=e.clientY});
  ctx.on(c,"pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;Math.abs(dx)>Math.abs(dy)?steer(Math.sign(dx),0):steer(0,Math.sign(dy))});
  padRow(box,[["◀",()=>steer(-1,0)],["▲",()=>steer(0,-1)],["▼",()=>steer(0,1)],["▶",()=>steer(1,0)]]);
  const draw=()=>{x.fillStyle=col("--field");x.fillRect(0,0,360,360);x.fillStyle=col("--gold");x.beginPath();x.arc(food.x*S+10,food.y*S+10,7,0,7);x.fill();sn.forEach((s,i)=>{x.fillStyle=i?col("--teal"):col("--accent");x.fillRect(s.x*S+1,s.y*S+1,S-2,S-2)})};
  ctx.every(()=>{if(dead)return;dir=nd;const h={x:sn[0].x+dir.x,y:sn[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||sn.some(s=>s.x===h.x&&s.y===h.y)){dead=true;ctx.msg("Yutqazdingiz. Natija: "+score);return}
    sn.unshift(h);if(h.x===food.x&&h.y===food.y){score++;ctx.score(score);food=rf()}else sn.pop();draw()},120);
  draw();
}
function xo(box,ctx){
  let b=Array(9).fill(""),wins=0,lock=false;
  const g=el("div",{class:"xo"});box.append(g);
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=(b,p)=>L.some(l=>l.every(i=>b[i]===p)),full=b=>b.every(v=>v);
  function mm(b,p){if(win(b,"O"))return 1;if(win(b,"X"))return -1;if(full(b))return 0;let best=p==="O"?-2:2;
    for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const s=mm(b,p==="O"?"X":"O");b[i]="";best=p==="O"?Math.max(best,s):Math.min(best,s)}return best}
  function ai(){const e=b.map((v,i)=>v?-1:i).filter(i=>i>=0);if(Math.random()<.3)return e[rnd(e.length)];let bi=e[0],bs=-2;e.forEach(i=>{b[i]="O";const s=mm(b,"X");b[i]="";if(s>bs){bs=s;bi=i}});return bi}
  function draw(){g.replaceChildren(...b.map((v,i)=>el("button",{class:"cell "+(v==="X"?"x":v==="O"?"o":""),type:"button",onclick:()=>play(i)},v)))}
  function reset(){b=Array(9).fill("");lock=false;ctx.msg("Siz X siz. Katakni tanlang.");draw()}
  function end(t){lock=true;ctx.msg(t);ctx.after(reset,1300)}
  function play(i){if(lock||b[i])return;b[i]="X";draw();if(win(b,"X")){wins++;ctx.score(wins);return end("Siz yutdingiz!")}if(full(b))return end("Durang");
    lock=true;ctx.after(()=>{b[ai()]="O";draw();if(win(b,"O"))return end("Kompyuter yutdi");if(full(b))return end("Durang");lock=false},350)}
  ctx.score(0);reset();
}
function memory(box,ctx){
  const sy=["★","♥","♦","♣","♠","●","▲","■"];
  const cards=[...sy,...sy].sort(()=>Math.random()-.5).map(s=>({s,open:false,done:false}));
  let first=-1,moves=0,lock=false,left=8;
  const g=el("div",{class:"mem"});box.append(g);
  function draw(){g.replaceChildren(...cards.map((c,i)=>el("button",{class:"card"+(c.open||c.done?" up":"")+(c.done?" done":""),type:"button",onclick:()=>flip(i)},c.open||c.done?c.s:"")))}
  function flip(i){const c=cards[i];if(lock||c.open||c.done)return;c.open=true;if(first<0){first=i;draw();return}
    moves++;const f=cards[first];
    if(f.s===c.s){f.done=c.done=true;f.open=c.open=false;left--;first=-1;draw();ctx.msg("Yurishlar: "+moves);if(!left){ctx.msg("Tayyor! "+moves+" yurishda.");ctx.score(moves)}}
    else{lock=true;draw();ctx.msg("Yurishlar: "+moves);ctx.after(()=>{f.open=c.open=false;first=-1;lock=false;draw()},800)}}
  ctx.msg("Juftliklarni toping.");draw();
}
function g2048(box,ctx){
  let g=Array(16).fill(0),score=0,over=false;
  const gr=el("div",{class:"g48"});box.append(gr);
  const add=()=>{const e=g.map((v,i)=>v?-1:i).filter(i=>i>=0);if(e.length)g[e[rnd(e.length)]]=Math.random()<.9?2:4};
  const line=a=>{const t=a.filter(v=>v),r=[];let gain=0;for(let i=0;i<t.length;i++){if(t[i]===t[i+1]){r.push(t[i]*2);gain+=t[i]*2;i++}else r.push(t[i])}while(r.length<4)r.push(0);return[r,gain]};
  function draw(){gr.replaceChildren(...g.map(v=>el("div",{class:"t",style:v?"background:hsl("+((Math.log2(v)*37+10)%360)+" 65% 42%);color:#fff":""},v?String(v):"")))}
  function stuck(){if(g.includes(0))return false;for(let i=0;i<16;i++){if(i%4<3&&g[i]===g[i+1])return false;if(i<12&&g[i]===g[i+4])return false}return true}
  function move(d){if(over)return;let moved=false;const ng=g.slice();
    for(let k=0;k<4;k++){const idx=[0,1,2,3].map(j=>d<2?k*4+j:j*4+k);if(d===1||d===3)idx.reverse();
      const[r,gain]=line(idx.map(i=>g[i]));idx.forEach((i,j)=>{if(ng[i]!==r[j])moved=true;ng[i]=r[j]});score+=gain}
    if(moved){g=ng;add();draw();ctx.score(score);if(stuck()){over=true;ctx.msg("Yurish qolmadi. Natija: "+score)}}}
  ctx.on(window,"keydown",e=>{const d={ArrowLeft:0,ArrowRight:1,ArrowUp:2,ArrowDown:3}[e.key];if(d!==undefined){e.preventDefault();move(d)}});
  let sx=0,sy=0;
  ctx.on(gr,"pointerdown",e=>{sx=e.clientX;sy=e.clientY});
  ctx.on(gr,"pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;Math.abs(dx)>Math.abs(dy)?move(dx<0?0:1):move(dy<0?2:3)});
  add();add();draw();ctx.score(0);ctx.msg("Plitkalarni suring yoki oʻqlarni bosing.");
}
function mines(box,ctx){
  const W=9,H=9,M=10;let cells,started,over,flagMode=false,t0=0;
  const tog=el("button",{class:"btn",type:"button",onclick:()=>{flagMode=!flagMode;tog.textContent=flagMode?"Bayroq: yoniq":"Bayroq: oʻchiq";tog.classList.toggle("on",flagMode)}},"Bayroq: oʻchiq");
  const g=el("div",{class:"ms"});box.append(tog,g);
  const nb=i=>{const x=i%W,y=Math.floor(i/W),r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const a=x+dx,b=y+dy;if(a>=0&&b>=0&&a<W&&b<H)r.push(b*W+a)}return r};
  function seed(safe){let n=0;const ban=nb(safe);while(n<M){const i=rnd(W*H);if(i===safe||cells[i].m||ban.includes(i))continue;cells[i].m=true;n++}cells.forEach((c,i)=>c.n=nb(i).filter(j=>cells[j].m).length)}
  function open(i){const st=[i];while(st.length){const k=st.pop(),c=cells[k];if(c.o||c.f)continue;c.o=true;if(!c.n&&!c.m)nb(k).forEach(j=>st.push(j))}}
  function tap(i){if(over)return;const c=cells[i];if(flagMode){if(!c.o)c.f=!c.f;draw();return}if(c.f||c.o)return;
    if(!started){started=true;seed(i);t0=Date.now()}
    if(c.m){over=true;cells.forEach(z=>{if(z.m)z.o=true});draw();ctx.msg("Minaga tushdingiz.");return}
    open(i);draw();if(cells.filter(z=>!z.o).length===M){over=true;const s=Math.round((Date.now()-t0)/1000);ctx.msg("Tozalandi! "+s+" soniya.");ctx.score(s)}}
  function draw(){g.replaceChildren(...cells.map((c,i)=>el("button",{class:"mc"+(c.o?" o":"")+(c.o&&c.m?" bomb":"")+(c.o&&c.n?" n"+c.n:""),type:"button",
    oncontextmenu:e=>{e.preventDefault();if(!over&&!c.o){c.f=!c.f;draw()}},onclick:()=>tap(i)},c.o?(c.m?"●":(c.n?String(c.n):"")):(c.f?"⚑":""))))}
  cells=Array.from({length:W*H},()=>({m:false,o:false,f:false,n:0}));started=false;over=false;
  ctx.msg("10 ta mina bor. Telefonda bayroq tugmasidan foydalaning.");draw();
}
function bird(box,ctx){
  const{c,x}=canvasBox(box,320,480);
  let y=220,v=0,pipes=[],t=0,score=0,dead=false,started=false;
  const flap=()=>{if(dead)return;started=true;v=-5.6};
  ctx.on(window,"keydown",e=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();flap()}});
  ctx.on(c,"pointerdown",flap);
  ctx.score(0);ctx.msg("Sakrash uchun bosing yoki Probel.");
  const draw=()=>{x.fillStyle=col("--field");x.fillRect(0,0,320,480);x.fillStyle=col("--teal");
    pipes.forEach(p=>{x.fillRect(p.x,0,50,p.gap-60);x.fillRect(p.x,p.gap+60,50,480-p.gap-60)});
    x.fillStyle=col("--accent");x.beginPath();x.arc(80,y,12,0,7);x.fill();x.fillStyle=col("--gold");x.fillRect(88,y-2,10,5)};
  ctx.loop(dt=>{const k=dt/16.67;
    if(started&&!dead){v+=.32*k;y+=v*k;t+=k;
      if(t>=90){t=0;pipes.push({x:320,gap:110+Math.random()*180,p:false})}
      pipes.forEach(p=>p.x-=2.2*k);pipes=pipes.filter(p=>p.x>-60);
      pipes.forEach(p=>{if(!p.p&&p.x+50<80){p.p=true;score++;ctx.score(score)}if(92>p.x&&68<p.x+50&&(y-12<p.gap-60||y+12>p.gap+60))dead=true});
      if(y>468||y<12)dead=true;if(dead)ctx.msg("Yiqildingiz. Natija: "+score)}
    draw()});
}
function pong(box,ctx){
  const{c,x}=canvasBox(box,360,480),PW=64;
  let px=180,ax=180,bx=180,by=240,vx=2.6,vy=3.6,score=0,dead=false;
  ctx.on(c,"pointermove",e=>{px=clamp(cx(c,e),PW/2,360-PW/2)});
  ctx.on(c,"pointerdown",e=>{px=clamp(cx(c,e),PW/2,360-PW/2)});
  ctx.on(window,"keydown",e=>{if(e.key==="ArrowLeft")px=clamp(px-26,PW/2,360-PW/2);if(e.key==="ArrowRight")px=clamp(px+26,PW/2,360-PW/2)});
  ctx.score(0);ctx.msg("Raketkani barmoq yoki sichqoncha bilan suring.");
  const serve=()=>{bx=180;by=240;vx=(Math.random()<.5?-1:1)*2.6;vy=3.6};
  ctx.loop(dt=>{const k=dt/16.67;
    if(!dead){bx+=vx*k;by+=vy*k;if(bx<6||bx>354){vx=-vx;bx=clamp(bx,6,354)}
      ax+=clamp(bx-ax,-2.3*k,2.3*k);
      if(vy>0&&by>=446&&by<=462&&Math.abs(bx-px)<=PW/2+6){vy=-Math.min(9,Math.abs(vy)*1.04);vx=clamp(vx+(bx-px)*.08,-6,6);score++;ctx.score(score)}
      if(vy<0&&by<=34&&by>=18&&Math.abs(bx-ax)<=PW/2+6)vy=-vy;
      if(by<-10){score+=3;ctx.score(score);serve()}
      if(by>490){dead=true;ctx.msg("Top oʻtib ketdi. Natija: "+score)}}
    x.fillStyle=col("--field");x.fillRect(0,0,360,480);
    x.fillStyle=col("--teal");x.fillRect(ax-PW/2,20,PW,10);x.fillStyle=col("--accent");x.fillRect(px-PW/2,450,PW,10);
    x.fillStyle=col("--gold");x.beginPath();x.arc(bx,by,7,0,7);x.fill()});
}
function breakout(box,ctx){
  const{c,x}=canvasBox(box,360,480),R=5,Cn=8,BW=40,BH=18,PW=70;
  const bricks=[];for(let r=0;r<R;r++)for(let q=0;q<Cn;q++)bricks.push({x:q*BW+20,y:r*BH+50,a:true,r});
  let px=180,bx=180,by=446,vx=2.4,vy=-3.6,lives=3,score=0,run=false,dead=false;
  const ball=()=>{run=false;bx=px;by=446;vx=2.4*(Math.random()<.5?-1:1);vy=-3.6};
  ctx.on(c,"pointermove",e=>{px=clamp(cx(c,e),PW/2,360-PW/2)});
  ctx.on(c,"pointerdown",e=>{px=clamp(cx(c,e),PW/2,360-PW/2);run=true});
  ctx.on(window,"keydown",e=>{if(e.key==="ArrowLeft")px=clamp(px-26,PW/2,360-PW/2);if(e.key==="ArrowRight")px=clamp(px+26,PW/2,360-PW/2);if(e.code==="Space"){e.preventDefault();run=true}});
  ctx.score(0);ctx.msg("Boshlash uchun bosing. Jon: 3");
  const hue=["--accent","--gold","--teal","--accent","--gold"];
  ctx.loop(dt=>{const k=dt/16.67;
    if(!dead){if(!run){bx=px;by=446}else{bx+=vx*k;by+=vy*k;
      if(bx<5||bx>355){vx=-vx;bx=clamp(bx,5,355)}if(by<5){vy=Math.abs(vy)}
      if(vy>0&&by>=446&&by<=462&&Math.abs(bx-px)<=PW/2+5){vy=-Math.abs(vy);vx=clamp((bx-px)*.12,-5,5)}
      for(const b of bricks){if(b.a&&bx>b.x&&bx<b.x+BW&&by>b.y&&by<b.y+BH){b.a=false;vy=-vy;score+=10;ctx.score(score);break}}
      if(bricks.every(b=>!b.a)){dead=true;ctx.msg("Hammasi sindi! Natija: "+score)}
      if(by>490){lives--;if(lives<=0){dead=true;ctx.msg("Jon tugadi. Natija: "+score)}else{ctx.msg("Jon: "+lives);ball()}}}}
    x.fillStyle=col("--field");x.fillRect(0,0,360,480);
    bricks.forEach(b=>{if(b.a){x.fillStyle=col(hue[b.r]);x.fillRect(b.x+1,b.y+1,BW-2,BH-2)}});
    x.fillStyle=col("--ink");x.fillRect(px-PW/2,456,PW,10);x.fillStyle=col("--gold");x.beginPath();x.arc(bx,by,6,0,7);x.fill()});
}
function mole(box,ctx){
  let score=0,time=30,cur=-1,over=false;
  const g=el("div",{class:"mole"});
  const holes=Array.from({length:9},(_,i)=>el("button",{class:"hole",type:"button","aria-label":"Uya "+(i+1),onclick:()=>hit(i)}));
  g.append(...holes);box.append(g);
  const show=()=>holes.forEach((h,i)=>h.classList.toggle("up",i===cur));
  function hit(i){if(over)return;if(i===cur){score++;ctx.score(score);cur=-1;show()}}
  function next(){if(over)return;cur=rnd(9);show();ctx.after(()=>{if(over)return;cur=-1;show();ctx.after(next,200+Math.random()*300)},550+Math.random()*350)}
  ctx.every(()=>{if(over)return;time--;ctx.msg("Vaqt: "+time+" s");if(time<=0){over=true;cur=-1;show();ctx.msg("Vaqt tugadi. Natija: "+score)}},1000);
  ctx.score(0);ctx.msg("Vaqt: 30 s");next();
}
function reaction(box,ctx){
  const pad=el("button",{class:"react wait",type:"button"},"Boshlash uchun bosing");box.append(pad);
  let st="idle",t0=0,tm=0;
  pad.onclick=()=>{
    if(st==="idle"||st==="done"){st="wait";pad.className="react wait";pad.textContent="Yashil rangni kuting...";tm=ctx.after(()=>{st="go";t0=performance.now();pad.className="react go";pad.textContent="Hozir bosing!"},1500+Math.random()*2500)}
    else if(st==="wait"){clearTimeout(tm);st="idle";pad.className="react early";pad.textContent="Juda erta! Qayta bosing."}
    else if(st==="go"){const ms=Math.round(performance.now()-t0);st="done";pad.className="react done";pad.textContent=ms+" ms. Yana bosing.";ctx.score(ms)}};
  ctx.msg("Eng tez natija (ms) saqlanadi.");
}
function simon(box,ctx){
  let seq=[],pos=0,lock=true,score=0;
  const g=el("div",{class:"simon"});
  const pads=[0,1,2,3].map(i=>el("button",{class:"pad p"+i,type:"button","aria-label":"Rang "+(i+1),onclick:()=>press(i)}));
  g.append(...pads);box.append(g);
  const flash=(i,ms)=>{pads[i].classList.add("lit");ctx.after(()=>pads[i].classList.remove("lit"),ms||350)};
  function play(){lock=true;pos=0;ctx.msg("Diqqat...");seq.forEach((s,k)=>ctx.after(()=>flash(s),600+k*600));ctx.after(()=>{lock=false;ctx.msg("Navbat sizda.")},600+seq.length*600)}
  function press(i){if(lock)return;flash(i,180);
    if(seq[pos]!==i){lock=true;ctx.msg("Xato. Natija: "+score);return}
    pos++;if(pos===seq.length){score=seq.length;ctx.score(score);lock=true;seq.push(rnd(4));ctx.after(play,700)}}
  ctx.score(0);seq.push(rnd(4));ctx.after(play,500);
}
function guess(box,ctx){
  const n=1+rnd(100);let tries=0,done=false;
  const inp=el("input",{type:"number",min:"1",max:"100",id:"gi",class:"field",inputmode:"numeric",placeholder:"1–100","aria-label":"Son"});
  const out=el("p",{class:"big"},"1 dan 100 gacha son oʻyladim.");
  function go(){if(done)return;const v=parseInt(inp.value,10);if(!(v>=1&&v<=100)){out.textContent="1 dan 100 gacha son kiriting.";return}
    tries++;if(v===n){done=true;out.textContent="Toʻgʻri! "+tries+" urinishda topdingiz.";ctx.score(tries)}else out.textContent=v<n?v+" dan kattaroq":v+" dan kichikroq";inp.value="";inp.focus()}
  const b=el("button",{class:"btn primary",type:"button",onclick:go},"Tekshirish");
  ctx.on(inp,"keydown",e=>{if(e.key==="Enter")go()});
  box.append(out,el("div",{class:"row"},inp,b));ctx.msg("Kam urinish, yaxshi rekord.");
}
function blocks(box,ctx){
  const{c,x}=canvasBox(box,200,400),CW=10,CH=20,S=20;
  const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
  const CL=["","#4cc9f0","#f2a900","#9b5de5","#4361ee","#f77f00","#2dc653","#e5432b"];
  let b=Array.from({length:CH},()=>Array(CW).fill(0)),p,score=0,lines=0,over=false,acc=0;
  const fits=(m,px,py)=>m.every((r,j)=>r.every((v,i)=>!v||(px+i>=0&&px+i<CW&&py+j<CH&&(py+j<0||!b[py+j][px+i]))));
  const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  function spawn(){const k=rnd(7);p={m:SH[k],x:3,y:0,k:k+1};if(!fits(p.m,p.x,p.y)){over=true;ctx.msg("Oyin tugadi. Natija: "+score)}}
  function lock(){p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&p.y+j>=0)b[p.y+j][p.x+i]=p.k}));
    let n=0;b=b.filter(r=>r.some(v=>!v)||(n++,false));while(b.length<CH)b.unshift(Array(CW).fill(0));
    if(n){score+=[0,100,300,500,800][n];lines+=n;ctx.score(score)}spawn()}
  const mv=dx=>{if(!over&&fits(p.m,p.x+dx,p.y))p.x+=dx};
  const turn=()=>{if(over)return;const r=rot(p.m);for(const d of[0,-1,1]){if(fits(r,p.x+d,p.y)){p.m=r;p.x+=d;return}}};
  const down=()=>{if(over)return;if(fits(p.m,p.x,p.y+1))p.y++;else lock()};
  const drop=()=>{if(over)return;while(fits(p.m,p.x,p.y+1))p.y++;lock()};
  ctx.on(window,"keydown",e=>{const f={ArrowLeft:()=>mv(-1),ArrowRight:()=>mv(1),ArrowUp:turn,ArrowDown:down," ":drop}[e.key];if(f){e.preventDefault();f()}});
  padRow(box,[["◀",()=>mv(-1)],["⟳",turn],["▶",()=>mv(1)],["▼",down],["⤓",drop]]);
  spawn();ctx.score(0);ctx.msg("Qatorni toʻldiring. Yuqoriga: aylantirish, Probel: tashlash.");
  ctx.loop(dt=>{if(!over){acc+=dt;if(acc>=Math.max(90,550-Math.floor(lines/5)*50)){acc=0;down()}}
    x.fillStyle=col("--field");x.fillRect(0,0,200,400);
    b.forEach((r,j)=>r.forEach((v,i)=>{if(v){x.fillStyle=CL[v];x.fillRect(i*S+1,j*S+1,S-2,S-2)}}));
    if(!over){x.fillStyle=CL[p.k];p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v)x.fillRect((p.x+i)*S+1,(p.y+j)*S+1,S-2,S-2)}))}});
}
function rps(box,ctx){
  let streak=0;const o=["Tosh","Qogʻoz","Qaychi"];
  const out=el("p",{class:"big"},"Tanlang.");
  function go(i){const k=rnd(3),r=(i-k+3)%3;let t="Siz: "+o[i]+". Kompyuter: "+o[k]+". ";
    if(r===0)t+="Durang.";else if(r===1){streak++;t+="Gʻalaba!";ctx.score(streak)}else{streak=0;t+="Yutqazdingiz.";ctx.score(0)}out.textContent=t}
  box.append(out,el("div",{class:"row"},...o.map((n,i)=>el("button",{class:"btn primary",type:"button",onclick:()=>go(i)},n))));
  ctx.score(0);ctx.msg("Natija ketma-ket gʻalabalar soni.");
}
function connect4(box,ctx){
  const R=6,Cc=7;let b,wins=0,lock=false;
  const g=el("div",{class:"c4"});box.append(g);
  const drop=(col2,p)=>{for(let r=R-1;r>=0;r--)if(!b[r][col2]){b[r][col2]=p;return r}return -1};
  const four=(r,c,p)=>[[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>{let n=1;for(const s of[1,-1]){let i=r+dr*s,j=c+dc*s;while(i>=0&&i<R&&j>=0&&j<Cc&&b[i][j]===p){n++;i+=dr*s;j+=dc*s}}return n>=4});
  function aiMove(){const cols=[...Array(Cc).keys()].filter(q=>!b[0][q]);
    for(const p of[2,1])for(const q of cols){const r=drop(q,p);const w=r>=0&&four(r,q,p);if(r>=0)b[r][q]=0;if(w)return q}
    return cols.sort((a,z)=>Math.abs(a-3)-Math.abs(z-3)+(Math.random()-.5)*2)[0]}
  function draw(){g.replaceChildren(...b.flatMap((row,r)=>row.map((v,q)=>el("button",{type:"button","aria-label":"Ustun "+(q+1),class:v===1?"r":v===2?"y":"",onclick:()=>play(q)}))))}
  function init(){b=Array.from({length:R},()=>Array(Cc).fill(0));lock=false;ctx.msg("Siz qizil donasiz. Ustunni tanlang.");draw()}
  function play(q){if(lock)return;const r=drop(q,1);if(r<0)return;draw();
    if(four(r,q,1)){wins++;ctx.score(wins);ctx.msg("Siz yutdingiz!");lock=true;ctx.after(init,1500);return}
    if(b[0].every(v=>v)){ctx.msg("Durang");lock=true;ctx.after(init,1500);return}
    lock=true;ctx.after(()=>{const q2=aiMove(),r2=drop(q2,2);draw();
      if(four(r2,q2,2)){ctx.msg("Kompyuter yutdi");ctx.after(init,1500);return}
      if(b[0].every(v=>v)){ctx.msg("Durang");ctx.after(init,1500);return}lock=false},400)}
  ctx.score(0);init();
}
function slide(box,ctx){
  const t=[1,2,3,4,5,6,7,8,0];let moves=0,solved=false;
  const g=el("div",{class:"sl"});box.append(g);
  const nbs=i=>{const x=i%3,y=Math.floor(i/3),r=[];if(x>0)r.push(i-1);if(x<2)r.push(i+1);if(y>0)r.push(i-3);if(y<2)r.push(i+3);return r};
  for(let k=0;k<120;k++){const z=t.indexOf(0),n=nbs(z),j=n[rnd(n.length)];[t[z],t[j]]=[t[j],t[z]]}
  function draw(){g.replaceChildren(...t.map((v,i)=>el("button",{class:"tile"+(v?"":" blank"),type:"button",onclick:()=>mv(i)},v?String(v):"")))}
  function mv(i){if(solved)return;const z=t.indexOf(0);if(!nbs(i).includes(z))return;[t[z],t[i]]=[t[i],t[z]];moves++;draw();ctx.msg("Yurishlar: "+moves);
    if(t.every((v,k)=>v===(k+1)%9)){solved=true;ctx.msg("Yechildi! "+moves+" yurish.");ctx.score(moves)}}
  ctx.msg("Raqamlarni 1 dan 8 gacha tartiblang.");draw();
}
function mathq(box,ctx){
  let score=0,time=30,over=false,a=0,b=0,op="+",ans=0;
  const q=el("p",{class:"big qz"});
  const inp=el("input",{type:"number",id:"mi",class:"field",inputmode:"numeric","aria-label":"Javob"});
  function nq(){op=["+","-","×"][rnd(3)];const m=op==="×"?9:40;a=1+rnd(m);b=1+rnd(m);if(op==="-"&&b>a){const z=a;a=b;b=z}
    ans=op==="+"?a+b:op==="-"?a-b:a*b;q.textContent=a+" "+op+" "+b+" = ?";inp.value=""}
  function go(){if(over)return;if(parseInt(inp.value,10)===ans){score++;ctx.score(score)}nq();inp.focus()}
  ctx.on(inp,"keydown",e=>{if(e.key==="Enter")go()});
  box.append(q,el("div",{class:"row"},inp,el("button",{class:"btn primary",type:"button",onclick:go},"Javob")));
  ctx.every(()=>{if(over)return;time--;ctx.msg("Vaqt: "+time+" s");if(time<=0){over=true;ctx.msg("Vaqt tugadi. Natija: "+score)}},1000);
  ctx.score(0);ctx.msg("Vaqt: 30 s");nq();
}

/* ---------- game catalog (the site's built-in API) ---------- */
const GAMES=[
 {id:"snake",name:"Ilon",cat:"Arkada",h:150,px:"11110000100111001000001111",help:"Mevani yeng, oʻzingga urilma. Telefonda barmoq bilan suring.",mount:snake},
 {id:"bird",name:"Qanot",cat:"Arkada",h:200,px:"00000011101111101110000100",help:"Quvurlar orasidan uching. Har bir oʻtish bitta ochko.",mount:bird},
 {id:"pong",name:"Ping-pong",cat:"Arkada",h:265,px:"10001100011010110001010001",help:"Raketkani suring. Kompyuter raketkasidan top oʻtsa, 3 ochko.",mount:pong},
 {id:"brick",name:"Gʻishtlar",cat:"Arkada",h:20,px:"11011110110000000100001110",help:"Topni boshlash uchun bosing, barcha gʻishtlarni sindiring.",mount:breakout},
 {id:"blocks",name:"Bloklar",cat:"Arkada",h:300,px:"01110001000000011000110000",help:"Toʻliq qatorlar yoʻqoladi. Koʻp qator birdan, koʻp ochko.",mount:blocks},
 {id:"g2048",name:"2048",cat:"Aql",h:35,px:"11111000011111110000111111",help:"Bir xil raqamlarni qoʻshing va 2048 ga yeting.",mount:g2048},
 {id:"mines",name:"Minalar",cat:"Aql",h:350,px:"00100011101111101110001000",lower:true,help:"Minasiz katakchalarni oching. Tez tozalash rekord boʻladi.",mount:mines},
 {id:"memory",name:"Xotira",cat:"Aql",h:175,px:"11011110110000011011110110",lower:true,help:"Juft kartalarni toping. Yurish soni kam boʻlsa yaxshi.",mount:memory},
 {id:"slide",name:"Raqam surish",cat:"Aql",h:230,px:"11011110110000011000110000",lower:true,help:"Boʻsh joyga qoʻshni plitkani suring.",mount:slide},
 {id:"guess",name:"Sonni top",cat:"Aql",h:90,px:"01110100010011000000000100",lower:true,help:"Men 1 dan 100 gacha son oʻyladim.",mount:guess},
 {id:"mole",name:"Koʻrsichqon",cat:"Tezkorlik",h:30,px:"01110111111010111111101110",help:"30 soniyada koʻp sichqonni uring.",mount:mole},
 {id:"react",name:"Reaksiya",cat:"Tezkorlik",h:130,px:"00100001000010000000000100",lower:true,help:"Rang yashil boʻlishi bilan bosing. Natija millisekundda.",mount:reaction},
 {id:"simon",name:"Rang tartibi",cat:"Tezkorlik",h:250,px:"11011110110010011011110110",help:"Chiqqan ketma-ketlikni takrorlang. Har raund uzayadi.",mount:simon},
 {id:"math",name:"Tez hisob",cat:"Tezkorlik",h:190,px:"00100001001111100100001000",help:"30 soniyada iloji boricha koʻp misol yeching.",mount:mathq},
 {id:"xo",name:"XO",cat:"Stol",h:5,px:"10001010100010001010010001",help:"Kompyuterga qarshi. Ba'zan u xato qiladi.",mount:xo},
 {id:"c4",name:"Toʻrtta qator",cat:"Stol",h:215,px:"10101000001010100000101010",help:"Toʻrtta donani bir qatorga tering.",mount:connect4},
 {id:"rps",name:"Tosh, qogʻoz, qaychi",cat:"Stol",h:320,px:"00100011101111111111001110",help:"Ketma-ket gʻalabalar soni hisoblanadi.",mount:rps}
];

/* ---------- shell ---------- */
let cur=null,filter="Hammasi";
const bestOf=g=>{const v=store.get("best_"+g.id);return v===null?null:Number(v)};
function makeCtx(def){
  const cl=[];
  const ctx={
    on(t,ev,fn,o){t.addEventListener(ev,fn,o);cl.push(()=>t.removeEventListener(ev,fn,o))},
    every(fn,ms){const id=setInterval(fn,ms);cl.push(()=>clearInterval(id));return id},
    after(fn,ms){const id=setTimeout(fn,ms);cl.push(()=>clearTimeout(id));return id},
    loop(fn){let last=performance.now(),id=0;const f=t=>{const dt=Math.min(50,t-last);last=t;fn(dt);id=requestAnimationFrame(f)};id=requestAnimationFrame(f);cl.push(()=>cancelAnimationFrame(id))},
    score(n){$("#scoreV").textContent=n;const b=bestOf(def);if(b===null||(def.lower?n<b:n>b)){if(def.lower||n>0){store.set("best_"+def.id,String(n));$("#bestV").textContent=n}}},
    msg(t){$("#stMsg").textContent=t},
    stop(){cl.splice(0).forEach(f=>f())}
  };
  return ctx;
}
function startGame(){
  if(cur.ctx)cur.ctx.stop();
  const body=$("#gbody");body.replaceChildren();
  cur.ctx=makeCtx(cur.def);
  $("#scoreV").textContent=cur.def.lower?"–":"0";
  const b=bestOf(cur.def);$("#bestV").textContent=b===null?"–":b;
  $("#stMsg").textContent="";
  try{cur.def.mount(body,cur.ctx)}catch(e){body.textContent="Oyinni ishga tushirib boʻlmadi: "+e.message}
}
function openGame(def){cur={def};$("#stTitle").textContent=def.name;$("#stHelp").textContent=def.help;$("#stage").hidden=false;document.body.classList.add("lock");startGame();$("#stClose").focus()}
function closeGame(){if(cur&&cur.ctx)cur.ctx.stop();cur=null;$("#gbody").replaceChildren();$("#stage").hidden=true;document.body.classList.remove("lock");renderGrid()}
function pixel(px){const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox","0 0 5 5");s.setAttribute("aria-hidden","true");
  for(let i=0;i<25;i++)if(px[i]==="1"){const r=document.createElementNS("http://www.w3.org/2000/svg","rect");r.setAttribute("x",i%5);r.setAttribute("y",Math.floor(i/5));r.setAttribute("width",1);r.setAttribute("height",1);r.setAttribute("fill","#fff");s.append(r)}return s}
function renderFilters(){
  const cats=["Hammasi",...new Set(GAMES.map(g=>g.cat))];
  $("#filters").replaceChildren(...cats.map(c=>el("button",{class:"chip",type:"button","aria-pressed":String(c===filter),onclick:()=>{filter=c;renderFilters();renderGrid()}},c)));
}
function renderGrid(){
  $("#grid").replaceChildren(...GAMES.filter(g=>filter==="Hammasi"||g.cat===filter).map(g=>{
    const b=bestOf(g);
    const card=el("button",{class:"gcard",type:"button",style:"--h:"+g.h,onclick:()=>openGame(g)},
      el("span",{class:"mark"},pixel(g.px)),
      el("span",{class:"meta"},el("span",{class:"gname"},g.name),el("span",{class:"gcat"},g.cat),el("span",{class:"gbest"},b===null?"Rekord yoʻq":"Rekord: "+b)));
    if(window.attachPreview)window.attachPreview(card,g);
    return card;
  }));
}
$("#stClose").onclick=closeGame;
$("#stRestart").onclick=()=>{if(cur)startGame()};
$("#count").textContent=GAMES.length;

/* ---------- sign-up ---------- */
let profile=null,db=null,userCap=null,toastT=0;
try{profile=JSON.parse(store.get("profile")||"null")}catch(e){profile=null}
function toast(t){const n=$("#toast");n.textContent=t;n.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{n.hidden=true},6000)}
function renderAuth(){
  const a=$("#auth");
  if(profile&&profile.name){
    a.replaceChildren(el("div",{class:"who"},el("span",{},"Salom, "+profile.name),el("button",{class:"btn",type:"button",onclick:()=>{store.del("profile");profile=null;renderAuth()}},"Chiqish")));
    $("#joinbox").hidden=true;
  }else{
    a.replaceChildren(el("button",{class:"btn primary",type:"button",onclick:openReg},"Roʻyxatdan oʻtish"));
    $("#joinbox").hidden=store.get("skipReg")==="1";
  }
}
function openReg(){$("#rstat").textContent="";$("#rstat").className="stat";$("#reg").hidden=false;document.body.classList.add("lock");$("#rn").focus()}
function closeReg(){$("#reg").hidden=true;if($("#stage").hidden)document.body.classList.remove("lock")}
$("#openReg").onclick=openReg;$("#rgClose").onclick=closeReg;$("#rgSkip").onclick=closeReg;
$("#skipReg").onclick=()=>{store.set("skipReg","1");renderAuth()};
$("#regform").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("#rn").value.trim(),contact=$("#rc").value.trim(),note=$("#rm").value.trim(),st=$("#rstat");
  if(name.length<2){st.className="stat bad";st.textContent="Ismingizni kiriting.";return}
  if(contact&&contact.length<5){st.className="stat bad";st.textContent="Aloqa maʼlumoti juda qisqa. Boʻsh qoldirsangiz ham boʻladi.";return}
  profile={name,contact};store.set("profile",JSON.stringify(profile));renderAuth();
  if(!db||!userCap){st.className="stat bad";st.textContent="Profil shu qurilmada saqlandi. Sayt egasiga yuborib boʻlmadi: bu koʻrinishda maʼlumot yuborish yoqilmagan.";return}
  try{
    const id=await userCap.id();if(!id)throw new Error("id");
    await db.doc("registrations/"+id).set({name,contact,note,createdAt:new Date().toISOString()});
    st.className="stat ok";st.textContent="Roʻyxatdan oʻtdingiz. Maʼlumotlaringiz sayt egasiga yuborildi.";
  }catch(err){st.className="stat bad";st.textContent="Profil shu qurilmada saqlandi, lekin sayt egasiga yuborilmadi. Yuborish uchun sahifaga kirish huquqi kerak."}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#reg").hidden)closeReg();else if(cur)closeGame()}});

function renderRegs(snap,first){
  const docs=snap.docs;$("#regcount").textContent=docs.length;
  $("#regrows").replaceChildren(...(docs.length?docs.map(d=>{const v=d.data()||{};return el("tr",{},el("td",{},String(v.name||"")),el("td",{},String(v.contact||"")),el("td",{},String(v.note||"")),el("td",{},v.createdAt?new Date(v.createdAt).toLocaleString():""))}):[el("tr",{},el("td",{colspan:"4"},"Hozircha hech kim roʻyxatdan oʻtmagan."))]));
  if(!first)snap.docChanges().forEach(ch=>{if(ch.type==="added"){const v=ch.doc.data()||{};toast("Yangi roʻyxat: "+String(v.name||"nomaʼlum")+", "+String(v.contact||""))}});
}
async function initCaps(){
  try{
    if(!(window.claude&&window.claude.use))return;
    userCap=await window.claude.use("user");db=await window.claude.use("db");
    if(db&&userCap&&await userCap.isOwner()){
      $("#admin").hidden=false;let first=true;
      db.collection("registrations").orderBy("createdAt","desc").onSnapshot(s=>{renderRegs(s,first);first=false},()=>{$("#admin").hidden=true});
    }
  }catch(e){db=null}
}

renderAuth();renderFilters();renderGrid();initCaps();
