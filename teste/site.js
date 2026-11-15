// uso: BASE=http://127.0.0.1:8805 TAG=local node site.js 390 844 i
const puppeteer=require('puppeteer-core');
const BASE=(process.env.BASE||'http://127.0.0.1:8805/').replace(/\/?$/,'/');const TAG=process.env.TAG||'local';
const [,,W=1280,H=720,out='d']=process.argv;const mobile=Math.min(+W,+H)<600;const SH='/workspace/aguia-primordial-english-site/prints/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:+W,height:+H,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
const errs=[],bad=[],fail=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGE '+e.message));
p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
const t0=Date.now();await p.goto(BASE+'?cb='+Date.now(),{waitUntil:'load',timeout:60000});const tLoad=Date.now()-t0;
const R=await p.evaluate(()=>({title:document.title,h1:document.querySelector('h1').innerText,brokenImgs:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.loading!=='lazy').map(i=>i.src),overflowX:document.documentElement.scrollWidth>innerWidth+1,cards:document.querySelectorAll('.frase').length,links:[...document.querySelectorAll('a[href^=http]')].map(a=>a.href)}));
if(!/Águia Primordial English/.test(R.title))fail.push('title');if(R.overflowX)fail.push('overflowX');if(R.cards!==8)fail.push('cards '+R.cards);if(R.brokenImgs.length)fail.push('imgs '+R.brokenImgs);
await sleep(800);await p.screenshot({path:`${SH}${TAG}-${out}-inicio.png`});
// tabs
await p.click('.abas button[data-cat=miami]');await sleep(200);const n2=await p.$$eval('.frase',x=>x.length);if(n2!==8)fail.push('miami cards '+n2);
await p.evaluate(()=>{window.speechSynthesis&&(speechSynthesis.speak=function(u){setTimeout(()=>u.onend&&u.onend(),50)})});
await p.click('.frase');await sleep(500);const ouv=await p.$eval('#ouvidas',e=>e.textContent);if(ouv!=='1')fail.push('ouvidas '+ouv);
await p.evaluate(()=>document.querySelector('#ouvir').scrollIntoView());await sleep(500);await p.screenshot({path:`${SH}${TAG}-${out}-ouvir.png`});
await p.evaluate(()=>document.querySelector('#miami').scrollIntoView());await sleep(700);await p.screenshot({path:`${SH}${TAG}-${out}-miami.png`});
await p.evaluate(()=>document.querySelector('#apoie').scrollIntoView());await sleep(500);await p.screenshot({path:`${SH}${TAG}-${out}-apoie.png`});
// lazy imgs check after scroll
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}});await sleep(1200);
const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));if(broken.length)fail.push('broken '+broken);
await p.screenshot({path:`${SH}${TAG}-${out}-pagina.png`,fullPage:true});
const real=bad.filter(x=>!/favicon/.test(x));if(real.length)fail.push('http '+real);if(errs.length)fail.push('errs '+errs);
console.log(JSON.stringify({W,H,tLoad,links:new Set(R.links).size,fail},null,0));console.log(fail.length?'FAIL':'PASS');await b.close();})();
