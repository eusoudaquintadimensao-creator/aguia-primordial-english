(function(){
'use strict';
var D={
 dia:[["Good morning. How did you sleep?","Bom dia. Como você dormiu?"],["I need coffee.","Eu preciso de café."],["Nice to meet you.","Prazer em te conhecer."],["I'm late.","Estou atrasado."],["Where are my keys?","Cadê as minhas chaves?"],["It's raining.","Está chovendo."],["I need a minute.","Eu preciso de um minuto."],["Come in.","Entra."]],
 miami:[["Where is the beach?","Onde fica a praia?"],["How do I get to Ocean Drive?","Como eu chego na Ocean Drive?"],["How much is it?","Quanto custa?"],["Can I pay by card?","Posso pagar no cartão?"],["I'm lost. Can you help me?","Estou perdido. Pode me ajudar?"],["I have a reservation.","Eu tenho uma reserva."],["What time is check-out?","Que horas é o check-out?"],["Take me to this address, please.","Me leve a este endereço, por favor."]],
 aeroporto:[["Where is my gate?","Onde fica o meu portão?"],["I'm here on vacation.","Estou aqui de férias."],["I'm staying for ten days.","Vou ficar dez dias."],["Where is the baggage claim?","Onde é a esteira de bagagem?"],["My bag is missing.","A minha mala sumiu."],["Is this the line for customs?","Esta é a fila da alfândega?"]],
 comida:[["A table for two, please.","Uma mesa para dois, por favor."],["Can I see the menu?","Posso ver o cardápio?"],["Can I have some water?","Posso beber água?"],["I'd like the fish, please.","Eu quero o peixe, por favor."],["Is the tip included?","A gorjeta está incluída?"],["Check, please!","A conta, por favor!"]]
};
var K='ape-ouvidas', ouv={}; try{ouv=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){ouv={}}
var elC=document.getElementById('cartoes'), elN=document.getElementById('ouvidas');
function conta(){elN.textContent=Object.keys(ouv).length}
var vozes=[]; function carregaVozes(){try{vozes=speechSynthesis.getVoices()}catch(e){}}
if('speechSynthesis' in window){carregaVozes();speechSynthesis.onvoiceschanged=carregaVozes}
function voz(l){var v=vozes.filter(function(x){return x.lang&&x.lang.replace('_','-').toLowerCase().indexOf(l)===0});return v[0]||null}
function fala(t,l,cb){if(!('speechSynthesis' in window)){cb&&cb();return}var u=new SpeechSynthesisUtterance(t);u.lang=l;var v=voz(l.toLowerCase());if(v)u.voice=v;u.rate=l==='en-US'?.92:1;u.onend=u.onerror=function(){cb&&cb()};speechSynthesis.speak(u)}
function falaDupla(en,pt,el){if(!('speechSynthesis' in window)){aviso('Seu navegador não tem voz. Abra o app da Águia para ouvir.');return}speechSynthesis.cancel();document.querySelectorAll('.tocando').forEach(function(x){x.classList.remove('tocando')});if(el)el.classList.add('tocando');fala(en,'en-US',function(){setTimeout(function(){fala(pt,'pt-BR',function(){if(el)el.classList.remove('tocando')})},250)})}
function render(cat){elC.innerHTML='';D[cat].forEach(function(p){var b=document.createElement('button');b.type='button';b.className='frase'+(ouv[p[0]]?' ouvida':'');b.setAttribute('aria-label','Ouvir: '+p[0]+' — '+p[1]);b.innerHTML='<span class="som">🔊</span><span class="en" lang="en"></span><span class="pt"></span>';b.querySelector('.en').textContent=p[0];b.querySelector('.pt').textContent=p[1];b.addEventListener('click',function(){falaDupla(p[0],p[1],b);ouv[p[0]]=1;b.classList.add('ouvida');try{localStorage.setItem(K,JSON.stringify(ouv))}catch(e){}conta()});elC.appendChild(b)})}
document.querySelectorAll('.abas button').forEach(function(t){t.addEventListener('click',function(){document.querySelectorAll('.abas button').forEach(function(x){x.setAttribute('aria-selected','false')});t.setAttribute('aria-selected','true');render(t.dataset.cat)})});
render('dia');conta();
var c=document.querySelector('.ouvir-cit');if(c)c.addEventListener('click',function(){falaDupla(c.dataset.en,c.dataset.pt,null)});
function aviso(t){var a=document.createElement('div');a.className='aviso';a.textContent=t;document.body.appendChild(a);setTimeout(function(){a.remove()},2600)}
var cp=document.getElementById('copiar');if(cp)cp.addEventListener('click',function(){var l=cp.dataset.link;(navigator.clipboard?navigator.clipboard.writeText(l):Promise.reject()).then(function(){aviso('Link copiado. Obrigado!')},function(){prompt('Copie o link:',l)})});
var sh=document.getElementById('compartilhar');if(sh)sh.addEventListener('click',function(){var d={title:'Águia Primordial English',text:'Inglês grátis com voz: a Águia fala em inglês e em português. Do primeiro hello até Miami.',url:location.href.split('#')[0]};if(navigator.share){navigator.share(d).catch(function(){})}else{(navigator.clipboard?navigator.clipboard.writeText(d.text+' '+d.url):Promise.reject()).then(function(){aviso('Link copiado para compartilhar!')},function(){prompt('Copie o link:',d.url)})}});
if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
