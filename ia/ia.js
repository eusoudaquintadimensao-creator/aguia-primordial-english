/* IA Águia Primordial — motor local (sem internet): BM25 sobre a base do site + dicionário das 6.239 palavras. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var LS={get:function(k,d){try{var v=localStorage.getItem('ape-ia-'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem('ape-ia-'+k,JSON.stringify(v))}catch(e){}}};
/* ---------- texto ---------- */
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
var STOP=new Set('a o as os um uma uns umas de da do das dos e em no na nos nas para pra por com sem que qual quais quem como onde quando eu voce voces me te se seu sua meu minha isso isto esse essa este esta tem ter ha ao aos mais muito pouco ja nao sim ou mas tambem aqui ai la sobre the is are of to and in on for what how do does can i you it this that an be with tell fale diga explique sabe pode posso quero gostaria existe existem funciona funcionam indica indicam recomenda recomendam sugere vcs voces preciso precisa alguma algum coisa coisas fazer faco faz fica ficam conta conte contar acha voce me mim'.split(' '));
function raiz(w){if(w.length>5&&/coes$/.test(w))return w.slice(0,-4)+'cao';if(w.length>5&&/mente$/.test(w))return w.slice(0,-5);if(w.length>4&&/(es|s)$/.test(w)&&!/ss$/.test(w))return w.replace(/(es|s)$/,'');return w}
var GRUPOS=[['musica','cancao','som','song','vibracional','musicas'],['gratis','graca','gratuito','preco','custa','pagar','pago','dinheiro','credito','limite','free'],['apoiar','apoio','doar','doacao','contribuir','pix','mercado'],['palavra','vocabulario','word','termo'],['viagem','viajar','turismo','miami','eua'],['ia','inteligencia','assistente','robo','jarvis','ai'],['historia','stories','cena'],['treino','exercicio','academia','gym','malhar','corpo'],['danca','dancar','dance'],['offline','internet','conexao','rede'],['voz','som','audio','falar','fala','ouvir'],['criador','criou','autor','dono','fez'],['tema','assunto','categoria','topico'],['revisao','revisar','repetir','progresso'],['comecar','comeco','inicio','iniciar','primeiro'],['proposito','meta','objetivo','plano','data'],['salvar','guardar','curtir','coracao','favorito'],['ajuda','problema','travou','erro','suporte'],['meditacao','relaxar','escuta','chegada','respirar'],['diabetes','glicemia','acucar'],['mapa','gps','solara'],['espelho','verdade','crenca']];
var SIN={};GRUPOS.forEach(function(g){g.forEach(function(w){SIN[raiz(w)]=(SIN[raiz(w)]||[]).concat(g.map(raiz).filter(function(x){return x!==raiz(w)}))})});
function toks(s){return norm(s).split(' ').filter(function(w){return w&&w.length>1&&!STOP.has(w)}).map(raiz)}
/* ---------- base ---------- */
var PREF={},KB=null,DOCS=[],DF={},N=0,AVG=0,VOC=null,CATS=[],FRASES=[];
function prepara(kb){KB=kb;KB.entradas.forEach(function(e,i){var tf={},len=0;function soma(txt,p){toks(txt).forEach(function(t){tf[t]=(tf[t]||0)+p;len+=p})}
 soma(e.t,3);soma(e.k,2.2);soma((e.ex||[]).join(' '),2);soma(e.x,1);DOCS.push({e:e,tf:tf,len:len,boost:e.f==='resposta'?1.35:1});});
 N=DOCS.length;var tot=0;DOCS.forEach(function(d){tot+=d.len;Object.keys(d.tf).forEach(function(t){if(!DF[t]&&t.length>=5){var px=t.slice(0,5);(PREF[px]=PREF[px]||[]).push(t)}DF[t]=(DF[t]||0)+1})});AVG=tot/N;FRASES=KB.frases||[]}
function busca(q){var qt=toks(q);if(!qt.length)return{res:[],cob:0,qt:qt};var uq=qt.filter(function(t,i){return qt.indexOf(t)===i});
 var k1=1.3,b=.7,res=[];function bm(d,t){var f=d.tf[t];if(!f)return 0;var idf=Math.log(1+(N-DF[t]+.5)/(DF[t]+.5));return idf*(f*(k1+1))/(f+k1*(1-b+b*d.len/AVG))}
 DOCS.forEach(function(d){var s=0,hit=0;uq.forEach(function(t){var m=bm(d,t);if(!m&&t.length>=5&&!DF[t])(PREF[t.slice(0,5)]||[]).forEach(function(x){var v=.75*bm(d,x);if(v>m)m=v});(SIN[t]||[]).forEach(function(x){var v=.55*bm(d,x);if(v>m)m=v});if(m>0){s+=m;hit++}});
  if(s>0)res.push({d:d,s:s*d.boost*(.4+.6*hit/uq.length),hit:hit,cv:hit/uq.length})});res.sort(function(a,b){return b.s-a.s});
 return{res:res,cob:res[0]?res[0].cv:0,qt:qt}}
/* ---------- dicionário ---------- */
function carregaVoc(){if(VOC)return Promise.resolve(VOC);return fetch('../feed/data/palavras.json').then(function(r){return r.json()}).then(function(d){CATS=d.cats;VOC=d.w.map(function(w){return{i:w[0],en:w[1],pt:w[2],c:d.cats[w[3]]?d.cats[w[3]][1]:'',emo:w[4],f:w[5],ne:norm(w[1]),np:norm(w[2])}});return VOC}).catch(function(){VOC=[];return VOC})}
var RX=[/como (?:e que )?(?:se )?(?:diz|fala|escreve|falo|digo|pronuncia)\s+(.+?)(?:\s+em\s+ingl[eê]s)?\??$/i,/(?:o )?que (?:significa|quer dizer)\s+(.+?)\??$/i,/tradu(?:z|za|zir|cao de|ção de)\s+(.+?)(?:\s+(?:para|pro|em)\s+(?:o )?ingl[eê]s)?\??$/i,/^(.+?)\s+em\s+ingl[eê]s\??$/i,/^(.+?)\s+em\s+portugu[eê]s\??$/i,/what (?:is|does)\s+(.+?)\s+(?:mean|in portuguese)\??$/i];
var termoForte=true;function termoDic(q){var s=q.trim();for(var i=0;i<RX.length;i++){var m=s.match(RX[i]);if(m){termoForte=(i<3||i===5);var t=m[1].replace(/^["'“«]|["'”»]$/g,'').replace(/^(a|o|um|uma|the|a palavra)\s+/i,'').trim();if(!termoForte&&t.split(/\s+/).length>3)continue;return t}}return null}
function achaPalavra(t){var n=norm(t);if(!n)return null;var f=FRASES.filter(function(x){return norm(x[0])===n||norm(x[1])===n})[0];if(f)return{tipo:'frase',en:f[0],pt:f[1]};
 var PTS={cachorro:'cao',cachorrinho:'filhote de cachorro',celular:'celular',privada:'vaso sanitario'};if(PTS[n])n=PTS[n];var ach=function(f){return VOC.filter(f).sort(function(a,b){return a.np.length-b.np.length})[0]};var w=ach(function(v){return v.np===n})||ach(function(v){return v.ne===n||v.ne.replace(/^(a|an|the) /,'')===n})||ach(function(v){return v.np===n+'s'||v.np+'s'===n||v.ne===n+'s'})||ach(function(v){return v.np.split(' ')[0]===n&&v.np.indexOf('-')<0});
 if(w)return{tipo:'palavra',w:w};var f2=FRASES.filter(function(x){return norm(x[1]).indexOf(n)>=0||norm(x[0]).indexOf(n)>=0})[0];if(f2)return{tipo:'frase',en:f2[0],pt:f2[1]};return null}
function imgPalavra(w){if(!w.f)return'';if(/^g\//.test(w.f))return'../feed/img/'+w.f;var nome=w.f.split('/').pop();return'https://upload.wikimedia.org/wikipedia/commons/thumb/'+w.f+'/500px-'+nome}
/* ---------- voz ---------- */
var VOZ=LS.get('voz','aguia'),NOMES={aguia:'Águia',aurora:'Aurora',solar:'Conhecimento Solar'};var COM_AUDIO={};
var audio=new Audio();audio.preload='none';var ctx=null,an=null,dadosA=null,raf=0;
function nivel(v){document.documentElement.style.setProperty('--v',v.toFixed(3))}
function medidor(){if(!an)return;an.getByteTimeDomainData(dadosA);var m=0;for(var i=0;i<dadosA.length;i++){var x=Math.abs(dadosA[i]-128);if(x>m)m=x}nivel(Math.min(1,m/70));raf=requestAnimationFrame(medidor)}
function liga(){if(ctx)return;try{ctx=new (window.AudioContext||window.webkitAudioContext)();var src=ctx.createMediaElementSource(audio);an=ctx.createAnalyser();an.fftSize=512;dadosA=new Uint8Array(an.fftSize);src.connect(an);an.connect(ctx.destination)}catch(e){ctx=null;an=null}}
var falaGer=0;
function para(){falaGer++;try{audio.pause()}catch(e){}if(window.speechSynthesis)speechSynthesis.cancel();cancelAnimationFrame(raf);nivel(0);document.body.classList.remove('falando');clearInterval(pulso)}
var pulso=0;
function marca(spans,ch){var cur=-1;spans.forEach(function(s,i){var a=+s.dataset.a;if(a<=ch)cur=i});spans.forEach(function(s,i){s.classList.toggle('agora',i===cur);s.classList.toggle('dita',i<cur)})}
function vozSistema(lang){var vs=speechSynthesis.getVoices();var pref=VOZ==='solar'?['pt-PT','pt-BR']:['pt-BR','pt-PT'];if(lang&&lang.indexOf('en')===0)pref=['en-US','en-GB'];
 for(var i=0;i<pref.length;i++){var c=vs.filter(function(v){return v.lang.replace('_','-')===pref[i]});if(c.length){var fem=c.filter(function(v){return /female|francisca|luciana|maria|vit[oó]ria|thalita|raquel|fernanda|google/i.test(v.name)});var mas=c.filter(function(v){return /male|antonio|duarte|daniel|jo[aã]o|ricardo/i.test(v.name)&&!/female/i.test(v.name)});return (VOZ==='solar'?mas[0]:fem[0])||c[0]}}return null}
function falaSistema(texto,spans,lang){return new Promise(function(ok){if(!window.speechSynthesis){ok();return}var u=new SpeechSynthesisUtterance(texto);u.lang=lang||'pt-BR';var v=vozSistema(u.lang);if(v)u.voice=v;u.rate=VOZ==='solar'?.95:1;u.pitch=VOZ==='aguia'?.9:VOZ==='solar'?.8:1.05;
 var t0=0,teveB=false;u.onstart=function(){t0=performance.now();document.body.classList.add('falando');pulso=setInterval(function(){nivel(.25+Math.random()*.6)},110);
  if(spans)var tm=setInterval(function(){if(teveB||!document.body.classList.contains('falando')){clearInterval(tm);return}marca(spans,(performance.now()-t0)/(70/u.rate))},80)};
 u.onboundary=function(e){if(spans&&e.name!=='sentence'){teveB=true;marca(spans,e.charIndex)}};u.onend=u.onerror=function(){clearInterval(pulso);nivel(0);document.body.classList.remove('falando');if(spans)spans.forEach(function(s){s.classList.remove('agora');s.classList.add('dita')});ok()};speechSynthesis.speak(u)})}
function falaArquivo(id,spans){var g=falaGer;return new Promise(function(ok,erro){var url='voz/'+VOZ+'/'+id+'.mp3';audio.src=url;liga();if(ctx&&ctx.state==='suspended')ctx.resume();
 var total=spans?spans.length:0;audio.onplaying=function(){document.body.classList.add('falando');medidor()};
 audio.ontimeupdate=function(){if(spans&&audio.duration){var ch=+spans[total-1].dataset.b*audio.currentTime/audio.duration;marca(spans,ch)}};
 audio.onended=function(){cancelAnimationFrame(raf);nivel(0);document.body.classList.remove('falando');if(spans)spans.forEach(function(s){s.classList.remove('agora');s.classList.add('dita')});ok()};
 audio.onerror=function(){erro()};var p=audio.play();if(p&&p.catch)p.catch(function(){erro()})})}
function fala(texto,id,spans,lang){para();var g=falaGer;if(id&&COM_AUDIO[id]!==false){return falaArquivo(id,spans).catch(function(){COM_AUDIO[id]=false;if(g===falaGer)return falaSistema(texto,spans,lang)})}return falaSistema(texto,spans,lang)}
/* ---------- tela ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pinta(texto){var el=$('#fala');el.innerHTML='';var re=/\S+/g,m,spans=[];while((m=re.exec(texto))){if(m.index>0&&spans.length)el.appendChild(document.createTextNode(' '));var s=document.createElement('span');s.className='w';s.textContent=m[0];s.dataset.a=m.index;s.dataset.b=m.index+m[0].length;el.appendChild(s);spans.push(s)}return spans}
function fontes(lista){var f=$('#fontes');f.innerHTML='';lista.forEach(function(x){var a=document.createElement('a');a.href=x.u;a.textContent='↗ '+x.t;if(/^https?:/.test(x.u)){a.target='_blank';a.rel='noopener'}f.appendChild(a)})}
var POS=[[18,24],[82,22],[12,70],[88,68],[50,8],[50,92]];
function orbita(cards){var o=$('#orbita');Array.prototype.forEach.call(o.children,function(c){c.classList.remove('ve');setTimeout(function(){c.remove()},700)});
 cards.slice(0,innerWidth<600?4:6).forEach(function(c,i){var a=document.createElement('a');a.className='cartao';a.href=c.u||'#';if(/^https?:/.test(a.href)&&c.u&&/^https?:/.test(c.u)){a.target='_blank';a.rel='noopener'}
  a.style.left=POS[i][0]+'%';a.style.top=POS[i][1]+'%';a.style.animationDelay=(i*.8)+'s';
  a.innerHTML=(c.img?'<img alt="" loading="lazy" src="'+esc(c.img)+'" onerror="this.remove()">':'')+(c.emo?'<em>'+esc(c.emo)+'</em>':'')+'<span>'+esc(c.t)+'</span>';o.appendChild(a);setTimeout(function(){a.classList.add('ve')},120+i*160)})}
var PADRAO=['Por onde eu começo?','Como se diz cachorro em inglês?','Quantas palavras tem?','Quais são os temas?','Vou para Miami, o que tem?','Como posso apoiar?','Você funciona sem internet?','A voz não sai, o que faço?'];
function sugere(lista){var s=$('#sugestoes');s.innerHTML='';lista.forEach(function(t){var b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=function(){pergunta(t)};s.appendChild(b)})}
function cartaoDe(e){return{t:e.t.replace(/ \(\d+\)$/,''),u:e.u,img:e.img}}
/* ---------- resposta ---------- */
function resumo(x){var fr=x.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+/g)||[x];var out='';for(var i=0;i<fr.length;i++){if((out+fr[i]).length>330&&out)break;out+=fr[i]}return out.trim()}
function responde(q){var n=norm(q);
 if(/^(oi|ola|ola aguia|oi aguia|bom dia|boa tarde|boa noite|hello|hi|hey|e ai)\b/.test(n)&&n.split(' ').length<=4)return{id:'saudacao',x:'Olá. Eu sou a Águia Primordial, a guia deste site. Pergunte sobre as aulas, os temas, ou como se diz uma palavra em inglês.',cards:PADRAO.slice(0,0),sug:PADRAO.slice(0,5)};
 if(/^(obrigad[oa]|valeu|thanks|thank you)\b/.test(n))return{x:'Por nada. Em inglês: you are welcome. Continue com dez palavras por dia.',sug:PADRAO.slice(1,5)};
 var termo=termoDic(q);if(termo&&VOC){var a=achaPalavra(termo);if(a){if(a.tipo==='frase')return{x:'Em inglês: «'+a.en+'» — quer dizer «'+a.pt+'».',ingles:a.en,cards:[{t:a.en+' · '+a.pt,u:'../#ouvir',img:'../img/hero-m.webp'}],sug:['Como se diz '+(['casa','maçã','aeroporto','praia'][Math.random()*4|0])+' em inglês?','Quais são os temas?']};
   var w=a.w;var dir=norm(termo)===w.ne&&norm(termo)!==w.np;var tx=dir?'«'+w.en+'» em português é «'+w.pt+'». Tema: '+w.c+'.':'Em inglês, «'+w.pt+'» é «'+w.en+'». Tema: '+w.c+'.';
   var irm=VOC.filter(function(v){return v.c===w.c&&v.i!==w.i}).slice(0,60).sort(function(){return Math.random()-.5}).slice(0,3);
   return{x:tx,ingles:w.en,cards:[{t:w.en+' · '+w.pt,u:'../feed/#'+w.i,img:imgPalavra(w),emo:w.f?'':w.emo}].concat(irm.map(function(v){return{t:v.en+' · '+v.pt,u:'../feed/#'+v.i,img:imgPalavra(v),emo:v.f?'':v.emo}})),fontes:[{t:'Ver no feed',u:'../feed/#'+w.i}],sug:irm.map(function(v){return'Como se diz '+v.pt+' em inglês?'})}}
  if(termoForte)return{id:'naosei',x:'Não achei «'+termo+'» nas 6.239 palavras do vocabulário da Águia, então não vou inventar. Tente outra palavra, ou procure por tema.',sug:['Quais são os temas?','Como se diz casa em inglês?','Como se diz aeroporto em inglês?']}}
 var r=busca(q),top=r.res[0];
 if(!top||top.s<(top.d.e.f==='resposta'?2.2:4)||r.cob<(top.d.e.f==='resposta'?.5:.75)){var rel=r.res.slice(0,3).map(function(x){return x.d.e});return{id:'naosei',x:'Isso não está no site da Águia, então eu não vou inventar. Veja os temas que eu separei aqui para você.',cards:(rel.length?rel:KB.entradas.filter(function(e){return e.f==='resposta'}).slice(0,4)).map(cartaoDe),sug:rel.length?rel.map(function(e){return(e.ex&&e.ex[0])||e.t.replace(/ \(\d+\)$/,'')}):PADRAO.slice(0,4)}}
 var e=top.d.e;var outros=[];r.res.slice(1).forEach(function(x){var t=x.d.e.t.replace(/ \(\d+\)$/,'');if(t!==e.t&&outros.every(function(o){return o.t!==t})&&outros.length<5)outros.push(x.d.e)});
 var cards=[cartaoDe(e)].concat(outros.map(cartaoDe));
 return{id:e.f==='resposta'?e.id:null,x:e.f==='resposta'?e.x:e.t.replace(/ \(\d+\)$/,'')+': '+resumo(e.x),cards:cards,fontes:[{t:e.t.replace(/ \(\d+\)$/,''),u:e.u}].concat(outros.slice(0,2).map(function(o){return{t:o.t.replace(/ \(\d+\)$/,''),u:o.u}})),sug:outros.slice(0,4).map(function(o){return(o.ex&&o.ex[0])||('Fale sobre '+o.t.replace(/ \(\d+\)$/,''))}),entrada:e.id}}
function pergunta(q){q=String(q||'').trim();if(!q)return;$('#q').value='';var go=function(){var r=responde(q);window.__IA.ultima={q:q,r:r};var spans=pinta(r.x);fontes(r.fontes||[]);orbita(r.cards||[]);sugere(r.sug&&r.sug.length?r.sug:PADRAO.slice(0,4));
  fala(r.x,r.id,spans).then(function(){if(r.ingles)return falaSistema(r.ingles,null,'en-US')})};
 if(!KB)return;if(termoDic(q)&&!VOC)carregaVoc().then(go);else go()}
/* ---------- cosmos ---------- */
function cosmos(){var c=$('#cosmos'),g=c.getContext('2d'),E=[],W,H,dpr=Math.min(2,devicePixelRatio||1);function tam(){W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr;E=[];var n=Math.min(420,(innerWidth*innerHeight)/2600|0);for(var i=0;i<n;i++)E.push({x:Math.random()*W,y:Math.random()*H,z:Math.random(),t:Math.random()*6})}tam();addEventListener('resize',tam);
 var parado=matchMedia('(prefers-reduced-motion: reduce)').matches;function q(ts){g.clearRect(0,0,W,H);var v=+getComputedStyle(document.documentElement).getPropertyValue('--v')||0;for(var i=0;i<E.length;i++){var s=E[i];if(!parado){s.y+= (0.08+s.z*.5)*dpr*(1+v*3);if(s.y>H){s.y=0;s.x=Math.random()*W}}var a=.35+.65*Math.abs(Math.sin(ts/1000+s.t));g.fillStyle='rgba('+(s.z>.8?'255,226,150':'200,235,255')+','+(a*(.4+s.z*.6))+')';var r=(.4+s.z*1.4)*dpr;g.fillRect(s.x,s.y,r,r)}
 if(!document.hidden)requestAnimationFrame(q);else setTimeout(function(){requestAnimationFrame(q)},500)}requestAnimationFrame(q)}
/* ---------- início ---------- */
function marcaVoz(){$('#voz-nome').textContent=NOMES[VOZ];document.querySelectorAll('[data-voz]').forEach(function(b){b.setAttribute('aria-checked',String(b.dataset.voz===VOZ))})}
function init(){cosmos();marcaVoz();sugere(PADRAO);
 $('#b-vozes').onclick=function(){var m=$('#menu-vozes');m.hidden=!m.hidden;this.setAttribute('aria-expanded',String(!m.hidden))};
 document.querySelectorAll('[data-voz]').forEach(function(b){b.onclick=function(){VOZ=b.dataset.voz;LS.set('voz',VOZ);marcaVoz();$('#menu-vozes').hidden=true;COM_AUDIO={};var t='Voz escolhida: '+NOMES[VOZ]+'.';pinta(t);fala('Olá. Eu sou a Águia Primordial, a guia deste site. Pergunte sobre as aulas, os temas, ou como se diz uma palavra em inglês.','saudacao',pinta('Olá. Eu sou a Águia Primordial, a guia deste site. Pergunte sobre as aulas, os temas, ou como se diz uma palavra em inglês.'))}});
 $('#b-baixar').onclick=function(){var b=this;if(!KB)return;var ids=['saudacao','naosei','dicionario'].concat(KB.entradas.filter(function(e){return e.f==='resposta'}).map(function(e){return e.id}));var feito=0;b.textContent='Guardando… 0/'+ids.length;
  Promise.all(ids.map(function(id){return fetch('voz/'+VOZ+'/'+id+'.mp3').then(function(r){if(r.ok&&'caches' in window)return caches.open('aguia-ia-vozes').then(function(c){return c.put('voz/'+VOZ+'/'+id+'.mp3',r)})}).catch(function(){}).then(function(){feito++;b.textContent='Guardando… '+feito+'/'+ids.length})})).then(function(){b.textContent='✓ Voz '+NOMES[VOZ]+' guardada neste aparelho'})};
 $('#form').onsubmit=function(ev){ev.preventDefault();pergunta($('#q').value)};
 $('#aguia').onclick=function(){if(document.body.classList.contains('falando')){para();return}var u=window.__IA.ultima;if(u){var spans=pinta(u.r.x);fala(u.r.x,u.r.id,spans)}else{fala($('#fala').textContent,'saudacao',pinta($('#fala').textContent))}};
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR&&navigator.onLine){var mic=$('#b-mic');mic.hidden=false;mic.onclick=function(){try{var r=new SR();r.lang='pt-BR';r.interimResults=false;mic.classList.add('ouvindo');r.onresult=function(e){pergunta(e.results[0][0].transcript)};r.onend=function(){mic.classList.remove('ouvindo')};r.start()}catch(e){}}}
 function st(){$('#estado').textContent=(navigator.onLine?'IA local':'Sem internet')+' · respostas só do site · sem limite'}st();addEventListener('online',st);addEventListener('offline',st);
 fetch('kb.json').then(function(r){return r.json()}).then(function(kb){prepara(kb);var q=new URLSearchParams(location.search).get('q');if(q)pergunta(q)});
 if('requestIdleCallback' in window)requestIdleCallback(carregaVoc);else setTimeout(carregaVoc,1500);
 if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js').catch(function(){});
 window.__IA={pergunta:pergunta,responde:responde,busca:busca,ultima:null,pronto:function(){return !!KB&&!!VOC}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
