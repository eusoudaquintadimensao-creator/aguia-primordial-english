// Teste do novo feed: layout tela cheia, sobreposição, sincronia voz × legenda × foto (voz simulada, com e sem eventos de palavra).
// uso: BASE=http://127.0.0.1:8805/ TAG=local MODE=boundary|none node feed.js 390 844 i
const puppeteer=require('puppeteer-core');const fs=require('fs');
const BASE=(process.env.BASE||'http://127.0.0.1:8805/').replace(/\/?$/,'/');const TAG=process.env.TAG||'local';const MODE=process.env.MODE||'boundary';const CPS=+(process.env.CPS||12.5);
const [,,W=390,H=844,out='i']=process.argv;const mobile=(process.env.DESK?false:true);const SH='/workspace/aguia-primordial-english-site/prints/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
const p=await b.newPage();await p.setViewport({width:+W,height:+H,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
if(process.env.NET4G){const c=await p.target().createCDPSession();await c.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:6.4e6/8,uploadThroughput:750e3/8})}
const errs=[],fail=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.evaluateOnNewDocument((MODE,CPS)=>{window.__log=[];const T0=performance.now();
 class U{constructor(t){this.text=t;this.rate=1;this.lang=''}}window.SpeechSynthesisUtterance=U;let q=[],cur=null;
 const ss={speaking:false,pending:false,paused:false,getVoices:()=>[{name:'Sim en',lang:'en-US'},{name:'Sim pt',lang:'pt-BR'}],addEventListener(){},removeEventListener(){},resume(){},pause(){},cancel(){q=[];if(cur){cur.dead=true;cur=null}this.speaking=false},speak(u){q.push(u);if(!cur)next()}};
 function next(){const u=q.shift();if(!u){ss.speaking=false;cur=null;return}cur=u;ss.speaking=true;const t0=performance.now();const dur=Math.max(50,u.text.length/(CPS*u.rate/0.9)*1000);
  if(u.text.trim())window.__log.push({ev:'start',t:t0-T0,text:u.text,img:(()=>{const s=document.querySelector('.slide[style*="translate3d(0px, 0%"], .slide[style*="translate3d(0, 0%"]');const i=s&&s.querySelector('.foto');return i&&i.getAttribute('src')!==null||i&&s.dataset.temfoto?{ok:i.classList.contains('ok'),complete:i.complete&&i.naturalWidth>0}:null})()});
  u.onstart&&u.onstart({});
  const words=[];const re=/\S+/g;let m;while((m=re.exec(u.text)))words.push(m.index);
  if(MODE==='boundary')words.forEach(ci=>setTimeout(()=>{if(!u.dead&&u.onboundary)u.onboundary({charIndex:ci,name:'word'})},ci/u.text.length*dur));
  const iv=setInterval(()=>{if(u.dead){clearInterval(iv);return}const el=performance.now()-t0;const tc=el/dur*u.text.length;let tw=0;words.forEach((a,j)=>{if(tc>=a)tw=j});
   const ag=document.querySelector('.falando .w.agora');if(!ag)return;const par=ag.parentElement;if(par.textContent!==u.text)return;const hw=[...par.querySelectorAll('.w')].indexOf(ag);
   window.__log.push({ev:'pos',text:u.text,tw,hw})},40);
  setTimeout(()=>{clearInterval(iv);if(u.dead)return;u.onend&&u.onend({});cur=null;next()},dur)}
 Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true});},MODE,CPS);
await p.goto(BASE+'feed/?cb='+Date.now(),{waitUntil:'load',timeout:60000});await p.waitForFunction('window.__FEED',{timeout:20000}).catch(e=>{console.log('ERRS',errs);throw e});await sleep(800);
await p.screenshot({path:`${SH}feed-${TAG}-${out}-inicio.png`});
await p.click('#comecar');await sleep(1500);
const L=await p.evaluate(()=>{const s=[...document.querySelectorAll('.slide')].find(x=>Math.abs(x.getBoundingClientRect().top)<2);const im=s.querySelector('.foto'),b=im.getBoundingClientRect(),pal=document.getElementById('palco').getBoundingClientRect();
 const boxes=[...document.querySelectorAll('.legenda p,.legenda .dica,.legenda .cat,.credito,.trilho,.barra .tema,.barra .conta,.barra .voltar')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.top<innerHeight&&r.bottom>0&&(!s.contains(e)||true)}).filter(e=>!e.closest('.slide')||e.closest('.slide')===s).map(e=>{const r=e.getBoundingClientRect();return{n:e.className||e.tagName,x:r.left,y:r.top,w:r.width,h:r.height}});
 const ov=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];if(a.x<c.x+c.w-1&&c.x<a.x+a.w-1&&a.y<c.y+c.h-1&&c.y<a.y+a.h-1)ov.push(a.n+' × '+c.n)}
 return{vw:innerWidth,vh:innerHeight,palco:[pal.width,pal.height],img:[b.width,b.height],fit:getComputedStyle(im).objectFit,ok:im.classList.contains('ok'),nat:[im.naturalWidth,im.naturalHeight],src:im.currentSrc.slice(-70),ov}});
if(Math.abs(L.img[0]-L.vw)>1||Math.abs(L.img[1]-L.vh)>1)fail.push('imagem não ocupa a tela '+JSON.stringify(L));if(L.ov.length)fail.push('sobreposição '+L.ov.join(', '));
await sleep(3500);await p.screenshot({path:`${SH}feed-${TAG}-${out}-card1.png`});
for(let k=0;k<4;k++){await p.keyboard.press('ArrowDown');await sleep(4200)}
await p.screenshot({path:`${SH}feed-${TAG}-${out}-card5.png`});
// gesto de deslizar (toque)
const n0=await p.evaluate(()=>__FEED.idx());await p.touchscreen.touchStart(W/2,H*0.7);await p.touchscreen.touchMove(W/2,H*0.45);await p.touchscreen.touchMove(W/2,H*0.25);await p.touchscreen.touchEnd();await sleep(800);
const n1=await p.evaluate(()=>__FEED.idx());if(mobile&&n1!==n0+1)fail.push('deslizar não avançou '+n0+'→'+n1);
await sleep(3000);
const log=await p.evaluate(()=>window.__log);const pos=log.filter(l=>l.ev==='pos');const d=pos.map(l=>l.hw-l.tw);
const exato=d.filter(x=>x===0).length/Math.max(1,d.length);const starts=log.filter(l=>l.ev==='start');const semImg=starts.filter(s=>s.img&&!s.img.complete).length;
const R={W,H,MODE,L:{img:L.img,vw:L.vw,vh:L.vh,ok:L.ok,nat:L.nat,src:L.src},amostras:pos.length,palavra_certa:+(exato*100).toFixed(1)+'%',maxDesvio:Math.max(0,...d.map(Math.abs)),falasSemFotoPronta:semImg+'/'+starts.length,errs};
if(exato<0.85)fail.push('sincronia '+exato);if(errs.length)fail.push('erros '+errs);
console.log(JSON.stringify(R));console.log(fail.length?'FAIL '+fail.join(' | '):'PASS');fs.writeFileSync(`${SH}feed-${TAG}-${out}-${MODE}.json`,JSON.stringify({R,fail},null,1));await b.close()})();
