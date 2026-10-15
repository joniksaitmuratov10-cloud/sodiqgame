/* Karta ustiga sichqoncha olib borilganda ishlaydigan kichik animatsiyalar.
   Hech qanday tashqi fayl kerak emas: har bir oyin uchun sahna canvas'da chiziladi.
   Xohlasangiz, haqiqiy GIF yoki video ham qoyish mumkin: script.js ichida GAMES royxatidagi
   oyin qatoriga  media:"previews/ilon.gif"  yoki  media:"previews/ilon.mp4"  deb yozing. */
(function(){
  const W=160,H=92;
  const TAU=Math.PI*2;
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  const circ=(c,x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
  const WH="#fff",DK="rgba(0,0,0,.28)",GD="#ffd24a",RD="#ff6a4f",TL="#3fd0c8",BL="#6c8cff";

  const S={
    snake(c,t){
      const n=9;
      for(let i=n;i>=0;i--){
        const a=t*2.2-i*.32;
        const x=80+Math.cos(a)*48, y=46+Math.sin(a*1.6)*22;
        rect(c,x-5,y-5,10,10,i===0?WH:"rgba(255,255,255,.75)");
      }
      const f=(Math.sin(t*3)+1)/2;
      circ(c,130,20+f*4,4,RD);
    },
    bird(c,t){
      const off=(t*60)%80;
      for(let k=0;k<3;k++){
        const x=200-off-k*80+80, gy=26+((k*37)%30);
        rect(c,x,0,16,gy,TL);rect(c,x,gy+34,16,H,TL);
      }
      const y=46+Math.sin(t*4)*14;
      circ(c,50,y,7,GD);rect(c,52,y-2,9,4,RD);
    },
    pong(c,t){
      const by=46+Math.sin(t*3.1)*34, bx=80+Math.cos(t*2.3)*62;
      for(let y=4;y<H;y+=10)rect(c,79,y,2,5,"rgba(255,255,255,.5)");
      rect(c,10,by-14,5,28,WH);rect(c,145,46+Math.sin(t*3.1+.6)*30-14,5,28,WH);
      circ(c,bx,by,4.5,GD);
    },
    brick(c,t){
      const cols=["#ff6a4f","#ffd24a","#3fd0c8","#6c8cff"];
      for(let r=0;r<4;r++)for(let k=0;k<8;k++){
        const gone=((t*1.2)|0)%8===k&&r===(((t*1.2)|0)%4);
        if(!gone)rect(c,8+k*19,8+r*10,17,8,cols[r]);
      }
      const bx=80+Math.sin(t*2.4)*60, by=50+Math.abs(Math.sin(t*3.3))*-30+10;
      circ(c,bx,by+14,4,WH);rect(c,bx-16,82,32,5,WH);
    },
    blocks(c,t){
      const cols=[RD,GD,TL,BL];
      for(let k=0;k<6;k++)for(let r=0;r<2;r++)rect(c,54+k*9,76-r*9,8,8,cols[(k+r)%4]);
      const y=((t*28)%66);
      const col=cols[((t/2.4)|0)%4];
      [[0,0],[1,0],[2,0],[1,1]].forEach(([dx,dy])=>rect(c,70+dx*9,y+dy*9-10,8,8,col));
    },
    g2048(c,t){
      const v=[2,4,8,16,32,64,128,256,512,1024,2048,4];
      const cols=["#eee4da","#ede0c8","#f2b179","#f59563","#f67c5f","#f65e3b","#edcf72","#edcc61","#edc850","#edc53f","#edc22e","#ede0c8"];
      const p=((t*.9)|0), sl=(t*.9)%1;
      for(let r=0;r<3;r++)for(let k=0;k<4;k++){
        const i=(r*4+k+p)%12;
        const x=26+k*30+(r===1?Math.sin(sl*Math.PI)*4:0), y=8+r*27;
        rect(c,x,y,26,24,cols[i]);
        c.fillStyle="#3b3224";c.font="800 11px sans-serif";c.textAlign="center";c.fillText(v[i],x+13,y+16);
      }
    },
    mines(c,t){
      const open=((t*3)|0)%30;
      for(let r=0;r<4;r++)for(let k=0;k<9;k++){
        const i=r*9+k, o=i<open;
        rect(c,12+k*15,12+r*17,13,15,o?"rgba(255,255,255,.85)":"rgba(0,0,0,.35)");
        if(o&&(i*7)%5===0){c.fillStyle="#2f7bd8";c.font="800 10px sans-serif";c.textAlign="center";c.fillText(1+(i%3),18.5+k*15,24+r*17)}
      }
      const f=(t*2)%2;if(f<1)circ(c,12+((open%9))*15+6,12+((open/9)|0)*17+7,3,RD);
    },
    memory(c,t){
      const emo=["★","♥","●","▲"];
      const ph=((t*1.1)|0)%4;
      for(let r=0;r<2;r++)for(let k=0;k<4;k++){
        const i=r*4+k, up=(i%4===ph)||((i+2)%4===ph&&r===1);
        rect(c,18+k*33,10+r*40,28,36,up?"rgba(255,255,255,.92)":"rgba(0,0,0,.4)");
        if(up){c.fillStyle="#333";c.font="800 18px sans-serif";c.textAlign="center";c.fillText(emo[i%4],32+k*33,34+r*40)}
      }
    },
    slide(c,t){
      const order=[1,2,3,4,5,6,7,8,0];
      const m=((t*1.3)|0)%4, sl=(t*1.3)%1;
      for(let r=0;r<3;r++)for(let k=0;k<3;k++){
        const n=order[r*3+k];if(!n)continue;
        let dx=0;if(n===8)dx=-(1-sl)*0;
        rect(c,42+k*26+dx,6+r*27,24,25,"rgba(255,255,255,.88)");
        c.fillStyle="#0b3d3a";c.font="800 14px sans-serif";c.textAlign="center";c.fillText(n,54+k*26+dx,24+r*27);
      }
      const s=Math.sin(sl*Math.PI)*6;
      rect(c,42+2*26-s,6+2*27,24,25,"rgba(255,255,255,.88)");
      c.fillStyle="#0b3d3a";c.fillText("8",54+2*26-s,24+2*27);
    },
    guess(c,t){
      const x=20+((Math.sin(t*1.7)+1)/2)*120;
      rect(c,20,44,120,6,"rgba(255,255,255,.35)");
      rect(c,x-2,34,4,26,GD);
      const q=["?","↑","↓","✓"][((t*1.2)|0)%4];
      c.fillStyle=WH;c.font="800 26px sans-serif";c.textAlign="center";c.fillText(q,80,26);
      c.font="700 11px sans-serif";c.fillText(String(1+((t*13)|0)%99),80,80);
    },
    mole(c,t){
      for(let k=0;k<3;k++)for(let r=0;r<2;r++){
        const x=34+k*46, y=30+r*34;
        circ(c,x,y+10,15,"rgba(0,0,0,.4)");
        const ph=(t*1.4+k*.7+r*1.3)%3;
        if(ph<1){const up=Math.sin(ph*Math.PI)*14;
          c.save();c.beginPath();c.rect(x-16,y-12,32,24);c.clip();
          circ(c,x,y+12-up,10,GD);circ(c,x-4,y+9-up,1.6,"#222");circ(c,x+4,y+9-up,1.6,"#222");
          c.restore();}
      }
    },
    react(c,t){
      const p=t%2.4, go=p>1.4;
      rect(c,22,10,116,72,go?"#1c7f49":"#c22d2d");
      c.fillStyle=WH;c.font="800 15px sans-serif";c.textAlign="center";
      c.fillText(go?"HOZIR!":"Kuting...",80,52);
      if(go)c.fillText(((p-1.4)*240|0)+" ms",80,72);
    },
    simon(c,t){
      const cols=[RD,TL,GD,BL], lit=((t*2)|0)%4;
      for(let i=0;i<4;i++){
        c.globalAlpha=i===lit?1:.45;
        rect(c,42+(i%2)*40,6+((i/2)|0)*40,38,38,cols[i]);
      }
      c.globalAlpha=1;
    },
    math(c,t){
      const a=2+((t/2)|0)%9, b=3+((t/2)|0)%7;
      c.fillStyle=WH;c.font="800 26px sans-serif";c.textAlign="center";
      c.fillText(a+" + "+b+" = ?",80,44);
      const w=((t%2)/2)*120;
      rect(c,20,66,120,6,"rgba(255,255,255,.3)");rect(c,20,66,120-w,6,GD);
    },
    xo(c,t){
      c.strokeStyle="rgba(255,255,255,.7)";c.lineWidth=3;
      [[62,12,62,80],[98,12,98,80],[28,34,132,34],[28,58,132,58]].forEach(([a,b,d,e])=>{c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke()});
      const seq=[[0,0,"X"],[1,1,"O"],[2,0,"X"],[0,2,"O"],[2,2,"X"],[1,0,"O"]];
      const n=Math.min(seq.length,((t*1.6)|0)%(seq.length+2));
      c.font="800 24px sans-serif";c.textAlign="center";
      for(let i=0;i<n;i++){const [k,r,s]=seq[i];c.fillStyle=s==="X"?RD:GD;c.fillText(s,45+k*36,32+r*24)}
    },
    c4(c,t){
      rect(c,22,6,116,80,"#2b47c2");
      for(let r=0;r<5;r++)for(let k=0;k<7;k++)circ(c,35+k*15,17+r*15,5.5,"rgba(0,0,0,.35)");
      const cnt=Math.floor(t*2.2)%12;
      for(let i=0;i<=cnt;i++){
        const k=(i*3)%7, row=4-Math.floor(i/3)%5;
        const dropY=i===cnt?Math.min(1,(t*2.2)%1):1;
        circ(c,35+k*15,-8+(17+row*15+8)*dropY,5.5,i%2?GD:RD);
      }
    },
    rps(c,t){
      const ph=((t*1.2)|0)%3, sh=Math.sin(t*14)*(((t*1.2)%1)<.5?5:0);
      c.fillStyle=WH;c.font="800 34px sans-serif";c.textAlign="center";
      c.fillText(["✊","✋","✌"][ph],48,56+sh);
      c.fillText(["✌","✊","✋"][ph],112,56-sh);
      c.font="800 12px sans-serif";c.fillText("VS",80,50);
    }
  };

  const fallback=(c,t)=>{circ(c,80+Math.cos(t*3)*30,46+Math.sin(t*3)*20,8,WH)};

  /* Kartaga animatsiya qoshadi: hover/focus bolganda ochiladi, chiqib ketganda toxtaydi */
  window.attachPreview=function(card,g){
    const mark=card.querySelector(".mark");
    if(!mark)return;
    const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    let layer=null,raf=0,t0=0;

    function stop(){
      cancelAnimationFrame(raf);raf=0;
      if(layer){const v=layer.querySelector("video");if(v)v.pause();layer.remove();layer=null}
      mark.classList.remove("playing");
    }
    function start(){
      if(layer||reduce)return;
      layer=document.createElement("span");layer.className="anim";layer.setAttribute("aria-hidden","true");
      if(g.media){
        if(/\.(mp4|webm|ogg)$/i.test(g.media)){
          const v=document.createElement("video");v.src=g.media;v.muted=true;v.loop=true;v.playsInline=true;v.autoplay=true;
          layer.append(v);v.play().catch(()=>{});
        }else{
          const im=document.createElement("img");im.src=g.media;im.alt="";layer.append(im);
        }
      }else{
        const cv=document.createElement("canvas");
        const dpr=Math.min(2,window.devicePixelRatio||1);
        cv.width=W*dpr;cv.height=H*dpr;
        layer.append(cv);
        const c=cv.getContext("2d"),draw=S[g.id]||fallback;
        t0=performance.now();
        const frame=now=>{
          c.setTransform(dpr,0,0,dpr,0,0);
          c.clearRect(0,0,W,H);c.textBaseline="alphabetic";
          draw(c,(now-t0)/1000);
          raf=requestAnimationFrame(frame);
        };
        raf=requestAnimationFrame(frame);
      }
      mark.append(layer);
      mark.classList.add("playing");
    }
    card.addEventListener("mouseenter",start);
    card.addEventListener("mouseleave",stop);
    card.addEventListener("focus",start);
    card.addEventListener("blur",stop);
    /* telefonda: bosib turganda ham korinadi */
    card.addEventListener("touchstart",start,{passive:true});
    card.addEventListener("touchend",()=>setTimeout(stop,900),{passive:true});
  };
})();
