/* Feed da Águia Primordial English — tela cheia, foto HD, voz e legenda sincronizadas palavra por palavra. */
(function(){'use strict';
var $=function(s){return document.querySelector(s)};
var palco=$('#palco'),elConta=$('#conta'),elTema=$('#tema');
var LS={get:function(k,d){try{var v=localStorage.getItem('ape-feed-'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('ape-feed-'+k,JSON.stringify(v))}catch(e){}}};
var D=null,CATS=[],lista=[],idx=0,cat=LS.get('cat','todas'),curt=new Set(LS.get('curtidas',[])),vel=LS.get('vel',1),auto=LS.get('auto',false);
var slides={};// idx -> el
var DPR=Math.min(window.devicePixelRatio||1,3);
// ---------- dados ----------
function fe(e,t){var n=e.slice(),r=t||1;for(var i=n.length-1;i>0;i--){r=r*16807%2147483647;var j=r%(i+1),x=n[i];n[i]=n[j];n[j]=x}return n}
var INC=new Set(['water','air','rice','money','music','furniture','news','bread','milk','coffee','tea','sugar','salt','sand','weather','love','happiness','information','advice','luggage','homework']);
function art(t){var f=(t.trim().split(/\s+/)[0]||'').toLowerCase();return INC.has(f)?'':/^hour|^honest|^heir/.test(f)||/^[aeiou]/.test(f)&&!/^uni|^eu|^one|^use/.test(f)?'an':'a'}
var EXO={5221:['It is in C major.','Está em dó maior.'],2007:['Read the minutes.','Leia a ata.'],5911:['I wear headphones for music.','Eu uso fone para ouvir música.'],4549:['This is a power plant.','Isto é uma usina.'],2434:['We scored a point.','Nós marcamos um ponto.'],4760:['We live inland.','Nós moramos no interior.'],4824:['Fruit can rot.','A fruta pode apodrecer.'],3860:['Go northeast.','Vá para o nordeste.'],2177:['They live on the outskirts.','Eles moram na periferia.'],3250:['Zoom in on the photo.','Amplie a foto.'],2565:['I like your style.','Eu gosto do seu estilo.']};
function exemplo(w){var t=w.en.trim(),n=w.pt.trim(),r=w.c;if(EXO[w.i])return{en:EXO[w.i][0],pt:EXO[w.i][1]};if(r==='sentimentos')return{en:'I feel '+t+'.',pt:'Eu sinto '+n+'.'};if(/ly$/.test(t)&&r==='adjetivos')return{en:t+'.',pt:n+'.'};if(r==='acoes')return{en:'I '+t+'.',pt:'Eu '+n+'.'};if(r==='adjetivos'||r==='sentimentos'||r==='qualidades')return{en:'It is '+t+'.',pt:'É '+n+'.'};if(r==='geografia'||r==='idiomas'||r==='cores')return{en:t+'.',pt:n+'.'};if(r==='comida'||r==='frutas'||r==='vegetais')return{en:'I eat '+t+'.',pt:'Eu como '+n+'.'};if(r==='bebidas')return{en:'I drink '+t+'.',pt:'Eu bebo '+n+'.'};var a=art(t);return{en:a?'This is '+a+' '+t+'.':'This is '+t+'.',pt:'Isto é '+n+'.'}}
function montaLista(){var base=D.w;if(cat==='todas')lista=fe(base,base.length+17);else if(cat==='curtidas')lista=base.filter(function(w){return curt.has(w.i)});else lista=base.filter(function(w){return w.c===cat});
 if(!lista.length){cat='todas';return montaLista()}
 var c=CATS.find(function(x){return x.s===cat});elTema.textContent=(cat==='todas'?'Todas as palavras':cat==='curtidas'?'Curtidas':c?c.pt:cat)+' ▾'}
// ---------- imagens ----------
var LARG=[500,960,1280,1920];
function fotoURL(w){if(!w.f)return '';if(w.f.indexOf('g/')===0)return 'img/'+w.f+(innerWidth*DPR>900?'':'').toString();
 var need=Math.min(1920,Math.ceil(Math.max(innerWidth,innerHeight*(w.ow&&w.oh?w.ow/w.oh:1))*DPR));var L=LARG.find(function(x){return x>=need})||1920;
 var base='https://upload.wikimedia.org/wikipedia/commons/';if(!w.ow||L>=w.ow)return base+w.f;var nome=w.f.split('/').pop();return base+'thumb/'+w.f+'/'+L+'px-'+nome}
var cache={};// url -> Promise
function precarrega(w){var u=fotoURL(w);if(!u)return Promise.resolve(null);if(cache[u])return cache[u];
 cache[u]=new Promise(function(res){var im=new Image();im.decoding='async';im.onload=function(){(im.decode?im.decode():Promise.resolve()).then(function(){res(u)},function(){res(u)})};im.onerror=function(){res(null)};im.src=u});return cache[u]}
// ---------- slides ----------
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function palavrasHTML(t){var out='',re=/\S+/g,m,k=0,last=0;while((m=re.exec(t))){out+=esc(t.slice(last,m.index))+'<span class="w" data-a="'+m.index+'" data-b="'+(m.index+m[0].length)+'">'+esc(m[0])+'</span>';last=m.index+m[0].length;k++}return out+esc(t.slice(last))}
function criaSlide(n){var w=lista[(n+lista.length)%lista.length];var ex=exemplo(w);var c=CATS.find(function(x){return x.s===w.c});
 var el=document.createElement('article');el.className='slide sem-anim';el.dataset.n=n;el.dataset.id=w.i;if(w.f)el.dataset.temfoto='1';
 var cred=w.f?(w.f.indexOf('g/')===0?'Imagem: arte original Águia Primordial':(w.a||'Wikimedia Commons')+' · '+(w.l||'')):'';
 var href=w.f&&w.f.indexOf('g/')!==0?'https://commons.wikimedia.org/wiki/File:'+w.f.split('/').pop():'';
 el.innerHTML='<div class="semfoto">'+(w.m?'<span>'+esc(w.m)+'</span>':'<b>'+esc(w.en.charAt(0).toUpperCase())+'</b>')+'</div>'+
  '<img class="foto" alt="'+esc(w.en)+'" decoding="async">'+'<div class="sombra"></div>'+
  (cred?'<p class="credito">'+(href?'<a href="'+href+'" target="_blank" rel="noopener">'+esc(cred)+'</a>':esc(cred))+'</p>':'')+
  '<div class="legenda"><span class="cat">'+esc(c?c.pt:w.c)+'</span>'+
  '<p class="en" lang="en" data-k="en">'+palavrasHTML(w.en)+'</p>'+
  '<p class="pt'+(LS.get('esconderPt',false)?' escondido':'')+'" data-k="pt">'+palavrasHTML(w.pt)+'</p>'+
  '<p class="ex" lang="en" data-k="ex">'+palavrasHTML(ex.en)+'</p><p class="ex-pt">'+esc(ex.pt)+'</p>'+
  '<div class="dica">⌃ DESLIZE</div></div>';
 var img=el.querySelector('.foto');var u=fotoURL(w);
 if(u){precarrega(w).then(function(ok){if(ok){img.src=ok;img.classList.add('ok');el.querySelector('.semfoto').style.display='none'}})}
 return el}
function pos(el,off){el.style.transform='translate3d(0,'+(off*100)+'%,0)'}
function render(sem){// garante slides idx-1, idx, idx+1 e apaga o resto
 [idx-1,idx,idx+1].forEach(function(n){if(!slides[n]){slides[n]=criaSlide(n);pos(slides[n],n-idx);palco.appendChild(slides[n]);void slides[n].offsetWidth}});
 Object.keys(slides).forEach(function(k){k=+k;var el=slides[k];if(Math.abs(k-idx)>1){el.remove();delete slides[k];return}if(!sem)el.classList.remove('sem-anim');pos(el,k-idx)});
 // pré-carrega as próximas 2 fotos
 for(var j=1;j<=2;j++)precarrega(lista[(idx+j)%lista.length]);
 var n=((idx%lista.length)+lista.length)%lista.length;elConta.textContent=(n+1).toLocaleString('pt-BR')+' / '+lista.length.toLocaleString('pt-BR');
 var w=atual();$('#b-curtir').setAttribute('aria-pressed',curt.has(w.i));$('#b-salvar').setAttribute('aria-pressed',LS.get('lugar',{}).id===w.i)}
function atual(){return lista[((idx%lista.length)+lista.length)%lista.length]}
var ultimaIda=0;
function vai(d){var t=Date.now();if(t-ultimaIda<300)return;ultimaIda=t;Voz.para();idx+=d;render(false);setTimeout(tocaAtual,330)}
// ---------- voz + legenda sincronizada ----------
var Voz=(function(){var ss=window.speechSynthesis||null,ger=0,vozes=[];
 var msChar=LS.get('msChar',{en:68,pt:62});// aprendido com a duração real de cada fala
 function carrega(){try{vozes=ss.getVoices()}catch(e){}}if(ss){carrega();ss.onvoiceschanged=carrega}
 function escolhe(l){var c=vozes.filter(function(v){return(v.lang||'').replace('_','-').toLowerCase().indexOf(l.toLowerCase())===0});var f=c.find(function(v){return/female|feminin|maria|luciana|francisca|samantha|zira|jenny|aria|google us english|google português/i.test(v.name)});return f||c[0]||null}
 function para(){ger++;if(ss)try{ss.cancel()}catch(e){}document.querySelectorAll('.falando').forEach(function(p){p.classList.remove('falando','bloco-ativo');p.querySelectorAll('.w').forEach(function(s){s.classList.remove('agora','dita')})})}
 function fala(p,texto,lang,rate,g){// p = parágrafo com spans .w
  return new Promise(function(res){if(!ss||g!==ger||!texto.trim()){res();return}
   var ws=p?[].slice.call(p.querySelectorAll('.w')):[],k=lang.slice(0,2),timers=[],porEvento=false,t0=0,fim=false;
   function marca(i){ws.forEach(function(s,j){s.classList.toggle('agora',j===i);s.classList.toggle('dita',j<i)})}
   function porChar(ci){for(var j=ws.length-1;j>=0;j--)if(ci>=+ws[j].dataset.a)return j;return 0}
   function acaba(){if(fim)return;fim=true;timers.forEach(clearTimeout);clearTimeout(seguro);if(p){ws.forEach(function(s){s.classList.remove('agora');s.classList.add('dita')});p.classList.remove('bloco-ativo')}
    if(t0&&g===ger){var dur=performance.now()-t0,mc=dur/Math.max(4,texto.length)*rate;if(mc>25&&mc<200){msChar[k]=Math.round(msChar[k]*.6+mc*.4);LS.set('msChar',msChar)}}res()}
   var u=new SpeechSynthesisUtterance(texto);u.lang=lang;u.rate=rate;var v=escolhe(lang);if(v)u.voice=v;
   u.onstart=function(){if(g!==ger)return;t0=performance.now();if(p){p.classList.add('falando','bloco-ativo');marca(0)}
    // relógio de reserva: só manda se a voz não informar as palavras (comum no Android)
    var ms=msChar[k]/rate;ws.forEach(function(s,j){if(j===0)return;timers.push(setTimeout(function(){if(!porEvento&&g===ger)marca(j)},(+s.dataset.a)*ms))})};
   u.onboundary=function(e){if(g!==ger||e.name==='sentence')return;porEvento=true;timers.forEach(clearTimeout);marca(porChar(e.charIndex||0))};
   u.onend=acaba;u.onerror=acaba;var seguro=setTimeout(acaba,Math.max(6000,texto.length*260/rate));
   try{ss.speak(u)}catch(e){acaba()}})}
 function espera(ms,g){return new Promise(function(r){setTimeout(r,g===ger?ms:0)})}
 async function sequencia(el,w){para();var g=++ger;if(!ss)return;var ex=exemplo(w);var r=0.9*vel;
  await fala(el.querySelector('[data-k=en]'),w.en,'en-US',r,g);if(g!==ger)return;await espera(260,g);
  await fala(el.querySelector('[data-k=pt]'),w.pt,'pt-BR',r,g);if(g!==ger)return;await espera(320,g);
  await fala(el.querySelector('[data-k=ex]'),ex.en,'en-US',Math.max(.7,r-.04),g);if(g!==ger)return;
  if(auto){await espera(1200,g);if(g===ger)vai(1)}}
 return{para:para,sequencia:sequencia,tem:!!ss,gen:function(){return ger}}})();
var liberado=false;
function tocaAtual(){var el=slides[idx];if(!el||!liberado)return;var w=atual();LS.set('ultimo',{cat:cat,id:w.i});
 // a voz só começa quando a foto deste cartão já está pronta (ou 1,2 s no máximo): imagem e som juntos
 var g=Voz.gen();Promise.race([precarrega(w),new Promise(function(r){setTimeout(r,1200)})]).then(function(){if(Voz.gen()===g&&slides[idx]===el)Voz.sequencia(el,w)})}
// ---------- gestos ----------
var y0=null,t0=0,dy=0;
palco.addEventListener('pointerdown',function(e){y0=e.clientY;t0=Date.now();dy=0;Object.keys(slides).forEach(function(k){slides[k].classList.add('sem-anim')})});
palco.addEventListener('pointermove',function(e){if(y0==null)return;dy=e.clientY-y0;var h=palco.clientHeight;Object.keys(slides).forEach(function(k){slides[k].style.transform='translate3d(0,calc('+((k-idx)*100)+'% + '+dy+'px),0)'})});
function solta(e){if(y0==null)return;var v=Math.abs(dy)/Math.max(1,Date.now()-t0);var sw=Math.abs(dy)>Math.min(90,palco.clientHeight*.12)||v>.5&&Math.abs(dy)>24;y0=null;
 Object.keys(slides).forEach(function(k){slides[k].classList.remove('sem-anim')});
 if(sw){vai(dy<0?1:-1)}else{render(false);if(Math.abs(dy)<8&&e.target.closest&&e.target.closest('.pt.escondido')){e.target.closest('.pt').classList.remove('escondido')}else if(Math.abs(dy)<8&&!e.target.closest('a'))tocaAtual()}}
palco.addEventListener('pointerup',solta);palco.addEventListener('pointercancel',solta);
var rodaT=0;palco.addEventListener('wheel',function(e){e.preventDefault();var t=Date.now();if(t-rodaT<450||Math.abs(e.deltaY)<20)return;rodaT=t;vai(e.deltaY>0?1:-1)},{passive:false});
addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();vai(1)}else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();vai(-1)}else if(e.key===' '){e.preventDefault();tocaAtual()}});
// ---------- botões ----------
function aviso(t){var a=$('#aviso');a.textContent=t;a.hidden=false;clearTimeout(aviso.t);aviso.t=setTimeout(function(){a.hidden=true},1800)}
$('#b-curtir').onclick=function(){var w=atual();curt.has(w.i)?curt.delete(w.i):curt.add(w.i);LS.set('curtidas',[...curt]);this.setAttribute('aria-pressed',curt.has(w.i))};
$('#b-salvar').onclick=function(){var w=atual();LS.set('lugar',{cat:cat,id:w.i});this.setAttribute('aria-pressed','true');aviso('Lugar salvo: '+w.en)};
$('#b-ouvir').onclick=function(){tocaAtual()};
var VELS=[0.8,1,1.2];$('#vel').textContent=String(vel).replace('.',',')+'×';
$('#b-vel').onclick=function(){vel=VELS[(VELS.indexOf(vel)+1)%VELS.length];LS.set('vel',vel);$('#vel').textContent=String(vel).replace('.',',')+'×';tocaAtual()};
$('#b-auto').setAttribute('aria-pressed',auto);$('#b-auto').onclick=function(){auto=!auto;LS.set('auto',auto);this.setAttribute('aria-pressed',auto);aviso(auto?'Avança sozinho depois da frase':'Avanço manual')};
$('#b-env').onclick=function(){var w=atual();var d={title:'Águia Primordial English',text:w.en+' = '+w.pt+' 🦅',url:location.href.split('#')[0]+'#'+w.i};if(navigator.share)navigator.share(d).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(d.text+' '+d.url).then(function(){aviso('Link copiado')})};
elTema.onclick=function(){var box=$('#lista-temas');var cont={};D.w.forEach(function(w){cont[w.c]=(cont[w.c]||0)+1});
 var itens=[{s:'todas',pt:'Todas as palavras',n:D.w.length},{s:'curtidas',pt:'Curtidas ♥',n:curt.size}].concat(CATS.filter(function(c){return cont[c.s]}).map(function(c){return{s:c.s,pt:c.pt,n:cont[c.s]}}));
 box.innerHTML=itens.map(function(c){return'<button type="button" data-s="'+c.s+'" aria-current="'+(c.s===cat)+'">'+esc(c.pt)+'<small>'+c.n.toLocaleString('pt-BR')+'</small></button>'}).join('');
 box.onclick=function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.s==='curtidas'&&!curt.size){aviso('Toque no ♥ para curtir palavras');return}cat=b.dataset.s;LS.set('cat',cat);$('#temas').close();recomeca(0)};
 $('#temas').showModal()};
function recomeca(i){Voz.para();Object.keys(slides).forEach(function(k){slides[k].remove()});slides={};montaLista();idx=i||0;render(true);setTimeout(tocaAtual,60)}
// ---------- início ----------
function comecar(){liberado=true;$('#inicio').hidden=true;
 if(window.speechSynthesis){try{var u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}}// libera o áudio no iPhone
 tocaAtual()}
$('#comecar').onclick=comecar;
fetch('data/palavras.json').then(function(r){return r.json()}).then(function(j){
 CATS=j.cats.map(function(c){return{s:c[0],pt:c[1],en:c[2]}});
 D={w:j.w.map(function(a){return{i:a[0],en:a[1],pt:a[2],c:CATS[a[3]].s,m:a[4],f:a[5],a:a[6],l:a[7],ow:a[8],oh:a[9]}})};
 montaLista();var h=+(location.hash||'').slice(1),u=LS.get('lugar',null)||LS.get('ultimo',null),k=0;
 if(h){var p=lista.findIndex(function(w){return w.i===h});if(p<0){cat='todas';montaLista();p=lista.findIndex(function(w){return w.i===h})}k=Math.max(0,p)}
 else if(u&&u.cat===cat){var q=lista.findIndex(function(w){return w.i===u.id});if(q>0)k=q}
 idx=k;render(true);window.__FEED={lista:lista,idx:function(){return idx},vai:vai,comecar:comecar,Voz:Voz}});
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',function(){navigator.serviceWorker.register('../sw.js').catch(function(){})});
})();
