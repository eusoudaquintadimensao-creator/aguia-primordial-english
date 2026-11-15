// Teste do memorial Marguerite Porete: telas, idioma, áudio + legenda sincronizada, vela, sem internet.
const puppeteer=require('puppeteer-core');const fs=require('fs');
const BASE=process.env.BASE||'http://127.0.0.1:8805/';const TAG=process.env.TAG||'local';
const S=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();const erros=[];p.on('pageerror',e=>erros.push(String(e)));p.on('requestfailed',r=>{if(!/fonts\.g/.test(r.url()))erros.push('falhou '+r.url())});
fs.mkdirSync('../prints',{recursive:true});const R={};
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto(BASE+'marguerite/?lang=pt',{waitUntil:'networkidle0'});await S(1200);
await p.screenshot({path:`../prints/mp-${TAG}-m-heroi.png`});
R.overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
for(const id of ['livro','processo','voz','memorial','vela','baixar']){await p.evaluate(id=>{document.getElementById(id).scrollIntoView({block:'start'});},id);await S(1300);await p.screenshot({path:`../prints/mp-${TAG}-m-${id}.png`})}
// áudio + legenda
await p.evaluate(()=>{document.getElementById('quem').scrollIntoView();MP.tocar('quem',false)});await S(6000);
R.audio1=await p.evaluate(()=>MP.estado());await S(4000);R.audio2=await p.evaluate(()=>MP.estado());
R.agora=await p.evaluate(()=>{const w=document.querySelector('.falado.pt .w.agora');return w?w.textContent:null});
await p.screenshot({path:`../prints/mp-${TAG}-m-audio.png`});
R.sync=R.audio2.t>R.audio1.t&&R.audio2.ultimo>R.audio1.ultimo&&R.audio2.tempos;
// coerência: palavra marcada x tempo do json
R.coerencia=await p.evaluate(async()=>{const j=await (await fetch('voz/pt/quem.json')).json();const s=MP.estado();let i=0;while(i+1<j.t.length&&j.t[i+1]<=s.t+.06)i++;return {esperado:i,marcado:s.ultimo,dif:Math.abs(i-s.ultimo)}});
await p.evaluate(()=>MP.parar());
// inglês
await p.evaluate(()=>MP.setL('en'));await p.evaluate(()=>scrollTo(0,0));await S(800);await p.screenshot({path:`../prints/mp-${TAG}-m-heroi-en.png`});
R.en=await p.evaluate(()=>getComputedStyle(document.querySelector('h1+.sub .en')).display!=='none'&&document.documentElement.lang==='en');
await p.evaluate(()=>MP.setL('pt'));
// vela
R.vela0=await p.evaluate(()=>+document.getElementById('n-velas').textContent);
await p.evaluate(()=>{document.getElementById('vela').scrollIntoView();document.getElementById('b-vela').click()});await S(1500);
R.vela1=await p.evaluate(()=>({n:+document.getElementById('n-velas').textContent,ls:localStorage.getItem('mp-velas'),frase:document.getElementById('frase-vela').textContent}));
await p.screenshot({path:`../prints/mp-${TAG}-m-vela-acesa.png`});
// desktop
await p.setViewport({width:1440,height:900});await p.goto(BASE+'marguerite/',{waitUntil:'networkidle0'});await S(1200);
await p.screenshot({path:`../prints/mp-${TAG}-d-heroi.png`});
for(const id of ['livro','citas','voz','memorial','vela','baixar']){await p.evaluate(id=>document.getElementById(id).scrollIntoView({block:'start'}),id);await S(1300);await p.screenshot({path:`../prints/mp-${TAG}-d-${id}.png`})}
await p.screenshot({path:`../prints/mp-${TAG}-d-inteira.png`,fullPage:true}).catch(()=>{});
// sem internet: tocar uma vez (guarda o mp3), depois offline
await p.evaluate(()=>MP.tocar('fogueira',false));await S(5000);await p.evaluate(()=>MP.parar());
await p.waitForFunction('navigator.serviceWorker&&navigator.serviceWorker.controller',{timeout:15000}).catch(()=>{});
await p.reload({waitUntil:'networkidle0'});await p.evaluate(()=>MP.tocar('fogueira',false));await S(3000);await p.evaluate(()=>MP.parar());
await p.setOfflineMode(true);
try{await p.reload({waitUntil:'load',timeout:20000});await S(1500);
 R.off={titulo:await p.evaluate(()=>document.querySelector('h1').textContent),img:await p.evaluate(()=>{const i=document.querySelector('.heroi-img img');return i.complete&&i.naturalWidth>0})};
 await p.evaluate(()=>{document.getElementById('fogueira').scrollIntoView();MP.tocar('fogueira',false)});await S(4000);R.off.audio=await p.evaluate(()=>MP.estado());
 await p.screenshot({path:`../prints/mp-${TAG}-m-offline.png`});
 R.off.ok=/Marguerite/.test(R.off.titulo)&&R.off.img&&R.off.audio.t>1&&!R.off.audio.sintese;
}catch(e){R.off={ok:false,erro:String(e)}}
await p.setOfflineMode(false);
// home: card + menu
await p.goto(BASE,{waitUntil:'networkidle0'});R.home=await p.evaluate(()=>({card:!!document.querySelector('a.mp-destaque[href="marguerite/"]'),menu:!!document.querySelector('.nav a[href="marguerite/"]')}));
await p.evaluate(()=>document.querySelector('.mp-destaque').scrollIntoView({block:'center'}));await S(800);await p.screenshot({path:`../prints/mp-${TAG}-home-card-d.png`});
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await p.goto(BASE,{waitUntil:'networkidle0'});await p.evaluate(()=>document.querySelector('.mp-destaque').scrollIntoView({block:'center'}));await S(800);await p.screenshot({path:`../prints/mp-${TAG}-home-card-m.png`});
const ok=R.overflow<=1&&R.sync&&R.coerencia.dif<=2&&R.en&&R.vela1.n===R.vela0+1&&R.off.ok&&R.home.card&&R.home.menu&&!erros.length;
console.log(JSON.stringify({R,erros},null,1));console.log(ok?'PASS':'FAIL');await b.close()})();
