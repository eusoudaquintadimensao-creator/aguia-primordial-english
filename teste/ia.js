// Teste da IA local: 30 perguntas (precisão), tela no celular, modo sem internet.
const puppeteer=require('puppeteer-core');const fs=require('fs');
const BASE=process.env.BASE||'http://127.0.0.1:8805/';const TAG=process.env.TAG||'local';
const Q=[
['O que é a Águia Primordial English?',/r-oque/],['Sobre o que é esse site?',/r-oque/],['Por onde eu começo?',/r-comecar/],['Quantas palavras tem?',/r-palavras/],['Quantos temas existem?',/r-palavras|r-temas/],
['Quais são os temas?',/r-temas/],['Como funciona o feed?',/r-feed/],['O que é o Ninho?',/r-ninho/],['O que tem nas histórias?',/r-historias/],['O que são as Chaves?',/r-chaves/],
['Como funciona a revisão?',/r-revisao/],['Vou para Miami, o que tem?',/r-miami/],['O que é o Solara GPS?',/r-miami/],['Como posso apoiar o projeto?',/r-apoiar/],['Quanto custa?',/r-apoiar/],
['Quem criou o app?',/r-criador/],['A voz não sai, o que faço?',/r-voz/],['Você funciona sem internet?',/r-offline/],['Tem música?',/r-musicas/],['O que tem sobre Tesla?',/r-tesla/],
['O que é a aba Glicemia?',/r-glicemia/],['Tem treino em inglês?',/r-treino/],['Como se diz cachorro em inglês?',/«dog»/],['Como se diz casa em inglês?',/«house»/],['O que significa airport?',/aeroporto/],
['Como se diz obrigado em inglês?',/Thank you/],['Como pergunto onde fica a praia?',/praia|beach|Miami/i],['Quantas palavras devo estudar por dia?',/r-dez/],['Qual a capital da França?',/naosei/],['Quem ganhou a copa de 2022?',/naosei/],
['O que é o Espelho?',/r-espelho/],['Como se diz gato em inglês?',/«cat»/],['Como se diz sapato em inglês?',/«shoes»/],['O que quer dizer beach?',/«praia»/],['Onde fica o feed de palavras?',/r-feed|r-palavras/],['Preciso pagar alguma coisa?',/r-apoiar|r-offline/],['Tem alguma história em inglês?',/r-historias/],['Como faço para relaxar?',/r-chegada/],['O app tem limite de perguntas?',/r-offline/],['Qual o melhor time de futebol?',/naosei/],['Me conta uma piada',/naosei/],['Quais IAs grátis vocês indicam?',/r-ia-lista/]];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const erros=[];p.on('pageerror',e=>erros.push(String(e)));
await p.goto(BASE+'ia/',{waitUntil:'networkidle0'});await p.waitForFunction('window.__IA&&__IA.pronto()',{timeout:20000});
const res=[];for(const [q,re] of Q){const r=await p.evaluate(q=>{const r=__IA.responde(q);return{id:r.id||'',x:r.x,ent:r.entrada||''}},q);const ok=re.test(r.id+' '+r.ent+' '+r.x);res.push({q,ok,id:r.id||r.ent,x:r.x.slice(0,110)})}
const acertos=res.filter(r=>r.ok).length;
fs.mkdirSync('../prints',{recursive:true});
await p.screenshot({path:`../prints/ia-${TAG}-inicio.png`});
await p.evaluate(()=>__IA.pergunta('Vou para Miami, o que tem?'));await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:`../prints/ia-${TAG}-resposta.png`});
await p.evaluate(()=>__IA.pergunta('Como se diz cachorro em inglês?'));await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:`../prints/ia-${TAG}-dicionario.png`});
// sem internet
await p.waitForFunction('navigator.serviceWorker&&navigator.serviceWorker.controller',{timeout:15000}).catch(()=>{});
await p.reload({waitUntil:'networkidle0'});
await p.setOfflineMode(true);let off={};
try{await p.reload({waitUntil:'load',timeout:20000});await p.waitForFunction('window.__IA&&__IA.pronto()',{timeout:20000});
 off=await p.evaluate(()=>{const r=__IA.responde('Como posso apoiar?');const d=__IA.responde('Como se diz maçã em inglês?');return{apoiar:r.id,dic:d.x}});
 await p.evaluate(()=>__IA.pergunta('Quais são os temas?'));await new Promise(r=>setTimeout(r,2000));await p.screenshot({path:`../prints/ia-${TAG}-offline.png`});off.ok=off.apoiar==='r-apoiar'&&/apple/.test(off.dic)}catch(e){off={ok:false,erro:String(e)}}
await p.setOfflineMode(false);
// celular grande e desktop
await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});await p.goto(BASE+'ia/?q=Por%20onde%20eu%20come%C3%A7o%3F',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:`../prints/ia-${TAG}-412.png`});
await p.setViewport({width:1366,height:800});await p.goto(BASE+'ia/?q=Quais%20s%C3%A3o%20os%20temas%3F',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:`../prints/ia-${TAG}-desktop.png`});
const out={acertos,total:Q.length,offline:off,erros,falhas:res.filter(r=>!r.ok),res};fs.writeFileSync(`../prints/ia-${TAG}.json`,JSON.stringify(out,null,1));
console.log(JSON.stringify({acertos,total:Q.length,offline:off,erros,falhas:out.falhas},null,1));
console.log(acertos/Q.length>=.9&&off.ok&&!erros.length?'PASS':'FAIL');await b.close()})();
