/* ==========================================================
   Labstyle Arcade · js/main.js
   Núcleo: audio, idioma, menús, portada (iframe), pasillo 3D con puertas, carga de modelos .glb y arranque.
   Se carga DESPUÉS de chemistry-games.js.
   Script clásico (sin módulos): comparte el ámbito global con
   los demás archivos para que los onclick="" de las plantillas funcionen.
   ========================================================== */

const $=document.getElementById('app');
;



/* stickers recortados de las hojas de @nic.labstyle (WebP embebido) */
const STK={"kgafas":"assets/img/stickers/kgafas.webp","gatoLibro":"assets/img/stickers/gatoLibro.webp","gatoMicro":"assets/img/stickers/gatoMicro.webp","gatoLupa":"assets/img/stickers/gatoLupa.webp","molecula":"assets/img/stickers/molecula.webp","gatoMatraz":"assets/img/stickers/gatoMatraz.webp","gatoBata":"assets/img/stickers/gatoBata.webp","matrazLlora":"assets/img/stickers/matrazLlora.webp","saturno":"assets/img/stickers/saturno.webp","lunaMorada":"assets/img/stickers/lunaMorada.webp","jupiter":"assets/img/stickers/jupiter.webp","nocheLuna":"assets/img/stickers/nocheLuna.webp","luna":"assets/img/stickers/luna.webp","astronauta":"assets/img/stickers/astronauta.webp","geoda":"assets/img/stickers/geoda.webp","monarca":"assets/img/stickers/monarca.webp","morpho":"assets/img/stickers/morpho.webp","verde":"assets/img/stickers/verde.webp","rosa":"assets/img/stickers/rosa.webp"};
;

const sti=(k,c='')=>`<img class="stk ${c}" src="${STK[k]}" alt="" draggable="false">`;
;

const pick=a=>a[Math.random()*a.length|0];
;

const extraSticker=()=>'',rewardSticker=()=> '';
;

function decorateGameQuestion(){}
;

const track=(n,d)=>{try{window.va&&window.va('event',{name:n,data:d})}catch(e){}};
;

const STKI={};
;
const stkImg=k=>{if(!STKI[k]){const i=new Image();i.src=STK[k];STKI[k]=i}return STKI[k]};
;


const sub=f=>f.replace(/(\d+)/g,'<sub>$1</sub>');
;

const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
;

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
;


/* ---------- ESTADO ---------- */
let S={score:0,streak:0,lives:3,i:0,list:[],kind:'',title:'',back:'home'};
;

const LS={get(k,d){try{const v=localStorage.getItem('lsa:'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('lsa:'+k,JSON.stringify(v))}catch(e){}}};
;

const dstr=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
;

const dayStreak=()=>{const o=LS.get('days',{last:'',n:0});return o.last===dstr(0)||o.last===dstr(-1)?o.n:0};
;

function markPlayed(){const o=LS.get('days',{last:'',n:0});if(o.last===dstr(0))return o.n;o.n=o.last===dstr(-1)?o.n+1:1;o.last=dstr(0);o.b=Math.max(o.b||0,o.n);LS.set('days',o);return o.n}
;

const modeId=()=>S.kind==='org'?'org-'+ORGKEY:S.kind;
;

let LASTRES=null;
;

function toast(h){const t=document.createElement('div');t.className='toast';t.innerHTML=h;document.body.appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),450)},3200)}
;

let MUTE=LS.get('mute',false),AC=null,MUSIC_GAIN=null,MUSIC_TIMER=null,MUSIC_STEP=0,AUDIO_UNLOCKED=false,CLICK_SOUND=false,AUDIO_WARNED=false;
;

const SFX={tap:[[440,0,.035],[554,.025,.045]],ok:[[660,0,.09],[880,.09,.15]],no:[[220,0,.14],[150,.13,.24]],win:[[523,0,.1],[659,.1,.1],[784,.2,.1],[1047,.3,.3]],lose:[[330,0,.16],[262,.16,.16],[196,.32,.34]]};
;

const MUSIC_NOTES=[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,523.25,440,392,329.63,293.66];
;

function audioContext(){
const AudioCtor=window.AudioContext||window.webkitAudioContext;
if(!AC&&!AudioCtor){if(!AUDIO_WARNED){console.warn('Este navegador no es compatible con Web Audio.');AUDIO_WARNED=true}return null}
if(!AC)AC=new AudioCtor();
if(AC.state==='suspended')AC.resume().catch(e=>console.warn('No se pudo reanudar el audio.',e));
return AC}
;

function sfx(k){
CLICK_SOUND=true;
if(MUTE)return;
const ctx=audioContext();if(!ctx)return;
const now=ctx.currentTime,bad=k==='no'||k==='lose',m=k==='ok'?1+Math.min(S.streak,5)*.05:1;
(SFX[k]||[]).forEach(([f,t,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=bad?'sawtooth':'triangle';o.frequency.value=f*m;
g.gain.setValueAtTime(.0001,now+t);g.gain.exponentialRampToValueAtTime(bad?.09:.18,now+t+.015);g.gain.exponentialRampToValueAtTime(.0001,now+t+d);
o.connect(g);g.connect(ctx.destination);o.start(now+t);o.stop(now+t+d+.02)})}
;

function musicNote(){
if(MUTE||document.hidden||!AC||!MUSIC_GAIN)return;
const now=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
o.type='sine';o.frequency.value=MUSIC_NOTES[MUSIC_STEP++%MUSIC_NOTES.length];
g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.1,now+.03);g.gain.exponentialRampToValueAtTime(.0001,now+.26);
o.connect(g);g.connect(MUSIC_GAIN);o.start(now);o.stop(now+.28)}
;

function startMusic(){
if(MUTE||document.hidden||MUSIC_TIMER!==null)return;
const ctx=audioContext();if(!ctx)return;
if(!MUSIC_GAIN){MUSIC_GAIN=ctx.createGain();MUSIC_GAIN.gain.value=0;MUSIC_GAIN.connect(ctx.destination)}
MUSIC_GAIN.gain.cancelScheduledValues(ctx.currentTime);MUSIC_GAIN.gain.setTargetAtTime(.12,ctx.currentTime,.25);
musicNote();MUSIC_TIMER=setInterval(musicNote,300)}
;

function stopMusic(){
if(MUSIC_TIMER!==null){clearInterval(MUSIC_TIMER);MUSIC_TIMER=null}
if(MUSIC_GAIN&&AC){MUSIC_GAIN.gain.cancelScheduledValues(AC.currentTime);MUSIC_GAIN.gain.setTargetAtTime(0,AC.currentTime,.04)}}
;

function unlockAudio(){AUDIO_UNLOCKED=true;if(!MUTE)startMusic()}
;

document.addEventListener('pointerdown',unlockAudio,{once:true});
;

document.addEventListener('keydown',unlockAudio,{once:true});
;

document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(AUDIO_UNLOCKED&&!MUTE)startMusic()});
;

document.addEventListener('click',()=>{CLICK_SOUND=false},true);
;

document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('button,a,[role="button"]'):null;if(target&&target.id!=='mute'&&!CLICK_SOUND)sfx('tap')});
;

const buzz=p=>{if(!MUTE&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
;

function mkMute(){const b=document.createElement('button');b.id='mute';b.className='mute';
const set=()=>{b.textContent=MUTE?'🔇':'🔊';b.setAttribute('aria-label',MUTE?_t('soundOn'):_t('mute'))};set();
b.onclick=()=>{MUTE=!MUTE;LS.set('mute',MUTE);set();if(MUTE)stopMusic();else{unlockAudio();sfx('ok')}};document.body.appendChild(b)}
;

function askName(done,stay){
const cur=LS.get('name',''),m=document.createElement('div');m.className='modal';
m.innerHTML=`<div class="card nm">${sti('kgafas','peek')}<h2>${_t('nameQ')}</h2><p class="sub" style="margin-bottom:14px">${_t('nameD')}</p><input id="nm" class="inp" maxlength="16" placeholder="${_t('namePh')}" autocomplete="nickname" aria-label="${_t('namePh')}"><div class="acts"><button class="go alt" id="nmok">${_t('save')}</button><button class="go" id="nmsk">${cur?_t('cancel'):_t('skip')}</button></div></div>`;
document.body.appendChild(m);
const inp=m.querySelector('#nm');inp.value=cur;setTimeout(()=>inp.focus(),60);
const fin=save=>{if(save)LS.set('name',inp.value.trim().slice(0,16));LS.set('asked',1);m.remove();if(!stay)home();if(done)done()};
m.querySelector('#nmok').onclick=()=>fin(true);m.querySelector('#nmsk').onclick=()=>fin(false);
inp.onkeydown=e=>{if(e.key==='Enter')fin(true)}}
;

const IGU='https://ig.me/m/nic.labstyle',SUGGEST_URL='';
;

/* Buzón de sugerencias.
   En tu propio dominio: llena SUGG con la URL y la clave pública (anon/publishable) de Supabase
   y crea la tabla con supabase_sugerencias.sql. Las sugerencias llegan solas y solo tú las lees.
   Dentro de Claude se guardan en la base del artifact y las ves en esta misma pantalla. */
const SUGG={url:'https://uqemiaizyfqxjgdrmhpc.supabase.co',key:'sb_publishable_6uBm0HYOqevBuKZQ8Mle-w_DQ4VpFmA',tabla:'sugerencias'};
;

let DBP=null,USP=null;
;

const capUse=n=>(window.claude&&typeof window.claude.use==='function')?window.claude.use(n).catch(()=>null):Promise.resolve(null);
;

const dbCap=()=>DBP||(DBP=capUse('db')),userCap=()=>USP||(USP=capUse('user'));
;

async function saveSugg(rec){
if(SUGG.url&&SUGG.key){try{const res=await fetch(SUGG.url.replace(/\/$/,'')+'/rest/v1/'+SUGG.tabla,{method:'POST',headers:Object.assign({'Content-Type':'application/json',apikey:SUGG.key,Prefer:'return=minimal'},SUGG.key.startsWith('eyJ')?{Authorization:'Bearer '+SUGG.key}:{}),body:JSON.stringify(rec)});if(res.ok)return 'sent'}catch(e){}}
const db=await dbCap(),us=db&&await userCap(),uid=us&&await us.id();
if(db&&uid){try{const ref=db.doc('sugerencias/'+uid),s=await ref.get(),items=((s.exists&&s.data().items)||[]).slice(-49);
items.push({...rec,ts:Date.now()});await ref.set({items,ts:Date.now()});return 'sent'}catch(e){}}
return null}
;

let SGU=null;
;

async function inbox(){
const box=document.getElementById('sgin');if(!box)return;
const db=await dbCap(),us=db&&await userCap();if(!db||!us||!await us.isOwner()||!document.getElementById('sgin'))return;
SGU?.();box.hidden=false;
SGU=db.collection('sugerencias').onSnapshot(q=>{
const all=[];q.docs.forEach(d=>((d.data()||{}).items||[]).forEach((it,i)=>all.push({...it,doc:d.id,i})));all.sort((a,b)=>b.ts-a.ts);
const el=document.getElementById('sgl');if(!el){SGU?.();SGU=null;return}
el.innerHTML=all.length?all.map(s=>`<li><span class="sgk">${esc(_t('c_'+s.tipo)||s.tipo)}</span> <b>${esc(s.nombre||_t('anon'))}</b> <small>${new Date(s.ts).toLocaleString(LANG)}</small><p>${esc(s.mensaje)}</p></li>`).join(''):`<li class="sg0">${_t('sgNone')}</li>`},()=>{})}
;


let SG='idea';
;

const footHtml=()=>{const n=LS.get('name','');return `<div class="foot"><button class="lnk" onclick="sugg()">${_t('suggLink')}</button><button class="lnk" onclick="askName()">${n?_t('changeName'):_t('setName')}</button></div>`};
;

function sugg(){
$.innerHTML=ICON('home()')+`<h2>${_t('suggT')}</h2><p class="sub">${_t('suggSub')}</p><div class="card"><div class="chips" role="group" aria-label="${_t('typeG')}">${['idea','fallo','tema'].map(k=>`<button class="chipb${k===SG?' on':''}" data-k="${k}">${_t('c_'+k)}</button>`).join('')}</div><textarea id="sgt" class="inp ta" maxlength="500" rows="5" placeholder="${_t('ph')}" aria-label="${_t('sugAria')}"></textarea><input id="sghp" class="hp-f" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="go alt" id="sgs">${_t('send')}</button><div id="sgr"></div></div><div class="card sgin" id="sgin" hidden><h3>${_t('sgInbox')}</h3><ul id="sgl" class="sgl"><li class="sg0">…</li></ul></div>`;
inbox();
$.querySelectorAll('.chipb').forEach(b=>b.onclick=()=>{SG=b.dataset.k;$.querySelectorAll('.chipb').forEach(x=>x.classList.toggle('on',x===b))});
document.getElementById('sgs').onclick=sendSugg}
;

async function sendSugg(){
const ta=document.getElementById('sgt'),t=ta.value.trim(),r=document.getElementById('sgr'),bt=document.getElementById('sgs');
if(!t){r.innerHTML=`<p class="fb no">${_t('empty')}</p>`;return}
if(document.getElementById('sghp').value)return;                       /* trampa para bots */
const wait=30000-(Date.now()-LS.get('sgts',0));
if(wait>0){r.innerHTML=`<p class="fb no">${_t('sgWait',Math.ceil(wait/1000))}</p>`;return}
const n=LS.get('name','');
bt.disabled=true;r.innerHTML=`<p class="fb">${_t('sgSending')}</p>`;
const st=await saveSugg({tipo:SG,nombre:n.slice(0,16)||null,mensaje:t.slice(0,500),idioma:LANG,pagina:location.hostname.slice(0,200)||null});
bt.disabled=false;
if(st==='sent'){LS.set('sgts',Date.now());ta.value='';r.innerHTML=`<div class="fb ok">${_t('sgOk')}<small>${_t('sgOkD')}</small></div>`;return}
/* sin buzón disponible: copiar y enviar por Instagram */
const msg=_t('msg',_t('c2_'+SG),n,t),url=SUGGEST_URL||IGU;
const ok=await copyTxt(msg);
r.innerHTML=`<div class="fb ok">${ok?_t('copied'):_t('copyIt')}<small>${_t('paste')}</small></div><textarea class="inp ta" readonly rows="3" onclick="this.select()">${esc(msg)}</textarea><a class="go alt lk" href="${url}" target="_blank" rel="noopener">${SUGGEST_URL?_t('openForm'):_t('openIG')}</a>`}
;

function askExit(){
if(S.i===0&&S.score===0&&S.lives===3){stopMaze();stopDefense();return window[S.back]()}
const m=document.createElement('div');m.className='modal';
m.innerHTML=`<div class="card"><h2>${_t('exitQ')}</h2><p class="sub" style="margin-bottom:14px">${_t('exitD',S.streak)}</p><div class="acts"><button class="go alt" id="exK">${_t('keep')}</button><button class="go" id="exS">${_t('leave')}</button></div></div>`;
document.body.appendChild(m);
const k=m.querySelector('#exK');k.focus();k.onclick=()=>m.remove();
m.querySelector('#exS').onclick=()=>{m.remove();stopMaze();stopDefense();window[S.back]()}}
;

function entryToast(){const o=LS.get('days',{last:'',n:0});if(!o.n)return;
if(o.last===dstr(0))toast(_t('tDay',o.n));
else if(o.last===dstr(-1))toast(_t('tRisk',o.n))}
;

function rr(X,a,b,w,h,r){X.beginPath();X.moveTo(a+r,b);X.arcTo(a+w,b,a+w,b+h,r);X.arcTo(a+w,b+h,a,b+h,r);X.arcTo(a,b+h,a,b,r);X.arcTo(a,b,a+w,b,r);X.closePath()}
;

function shareCanvas(r){
/* formato historia de Instagram (9:16); mismo lenguaje visual que el juego: papel cuadriculado, tinta, sombras sólidas y stickers */
const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;
const X=c.getContext('2d'),F='"Bricolage Grotesque",system-ui,sans-serif',INK='#1B1E4B';
const okI=i=>i&&i.complete&&i.naturalWidth;
const font=(w,s)=>{X.font=`${w} ${s}px ${F}`};
const fit=(t,max,s,w=800)=>{font(w,s);while(X.measureText(t).width>max&&s>22){s-=2;font(w,s)}return s};
const box=(x,y,w,hh,rad,fill,sh=14,lw=8)=>{X.fillStyle=INK;rr(X,x+sh,y+sh,w,hh,rad);X.fill();X.fillStyle=fill;rr(X,x,y,w,hh,rad);X.fill();X.lineWidth=lw;X.strokeStyle=INK;X.stroke()};
const stk=(k,cx,cy,hh,deg)=>{const i=STKI[k];if(!okI(i))return;const w=i.naturalWidth*hh/i.naturalHeight;X.save();X.translate(cx,cy);X.rotate(deg*Math.PI/180);X.shadowColor='rgba(27,30,75,.8)';X.shadowOffsetX=7;X.shadowOffsetY=9;X.drawImage(i,-w/2,-hh/2,w,hh);X.restore()};
X.textBaseline='alphabetic';
X.fillStyle='#EEF2FF';X.fillRect(0,0,W,H);X.fillStyle='#d5dcf5';
for(let i=0;i<W;i+=60)X.fillRect(i,0,2,H);for(let j=0;j<H;j+=60)X.fillRect(0,j,W,2);
/* cabecera */
font(800,118);const A='Labstyle ',B='Arcade',wa=X.measureText(A).width,wb=X.measureText(B).width,x0=(W-wa-wb)/2;
X.save();X.translate(x0+wa+wb/2,214);X.rotate(-.04);X.fillStyle='#FFE45C';rr(X,-wb/2-16,-82,wb+32,116,16);X.fill();X.restore();
X.textAlign='left';X.fillStyle=INK;X.fillText(A,x0,250);X.fillText(B,x0+wa,250);
X.textAlign='center';
let ts=fit(r.title,720,58);const tw=X.measureText(r.title).width;box((W-tw)/2-44,306,tw+88,94,47,'#fff',8,6);X.fillStyle=INK;font(800,ts);X.fillText(r.title,W/2,371);
/* tarjeta principal */
box(80,462,920,1080,56,'#fff',20,10);
X.fillStyle=r.win?['#A8DDFF','#5EE0B5','#CFC7FF','#FFE45C'][r.lv||0]:'#FFB3C1';X.beginPath();X.arc(W/2,720,205,0,Math.PI*2);X.fill();X.lineWidth=8;X.strokeStyle=INK;X.stroke();
const mk=r.win?['gatoLupa','gatoMatraz','kgafas','gatoLibro'][r.lv||0]:'matrazLlora';
if(okI(STKI[mk]))stk(mk,W/2,712,r.win&&r.lv>=2?400:360,-4);
let y=1000;
if(r.name){const ns=fit(r.name,700,64);X.fillStyle='#5b4be0';X.fillText(r.name,W/2,y);y+=30}else y-=36;
/* puntaje */
const num=String(r.score);font(800,250);const nw=X.measureText(num).width;font(800,86);const pw=X.measureText('pts').width,sx=(W-nw-18-pw)/2;
X.textAlign='left';X.fillStyle=INK;font(800,250);X.fillText(num,sx,y+215);font(800,86);X.fillText('pts',sx+nw+18,y+215);X.textAlign='center';
/* récord */
const rt=r.isNew?_t('newRecC'):_t('recC',r.best);font(800,44);const rw=X.measureText(rt).width;
box((W-rw)/2-34,y+252,rw+68,74,37,r.isNew?'#5EE0B5':'#EEF2FF',6,5);X.fillStyle=INK;X.fillText(rt,W/2,y+303);
/* estadísticas */
const st=[[`${r.ok}/${r.n}`,_t('shOkL'),'#FFB3C1'],[`x${r.bs}`,_t('shBsL'),'#FFE45C'],[String(r.days),_t('shDayL',r.days),'#CFC7FF']];
const bw=252,gap=26,bx=(W-3*bw-2*gap)/2,by=y+360;
st.forEach(([v,l,col],i)=>{const x=bx+i*(bw+gap);box(x,by,bw,138,24,col,8,6);X.fillStyle=INK;font(800,64);X.fillText(v,x+bw/2,by+72);fit(l,bw-28,30,700);X.fillText(l,x+bw/2,by+114)});
/* mensaje y reto */
X.fillStyle=INK;fit(r.msg,900,54);X.fillText(r.msg,W/2,1640);
const ct=_t('beat');font(800,62);const cw=X.measureText(ct).width;box((W-cw)/2-48,1690,cw+96,112,56,'#FFE45C',10,7);X.fillStyle=INK;X.fillText(ct,W/2,1768);
font(800,50);X.fillText('@nic.labstyle',W/2+28,1880);const hw=X.measureText('@nic.labstyle').width;stk('monarca',W/2-hw/2-28,1862,62,-14);
/* stickers alrededor */
stk('saturno',150,500,150,-16);stk('molecula',940,500,140,14);stk('morpho',986,1240,96,18);stk('luna',96,1300,90,0);stk('geoda',986,1560,100,10);
return c}
;

/* ---------- COMPARTIR ----------
Orden: 1) hoja nativa del teléfono con la imagen (Web Share API);
2) guardar la imagen (capacidad downloads del visor de Claude o descarga normal);
3) enlaces directos a cada app con el texto y el enlace. Así funciona en el celular,
en escritorio y dentro de iframes donde la hoja nativa no está permitida. */
const IGP='https://www.instagram.com/nic.labstyle/';
;

/* nivel mínimo para que @nic.labstyle reposte la historia (cámbialo aquí): 1 = Lavoisier (70 %) · 2 = Einstein (85 %) · 3 = Marie Curie (100 %).
   Va por nivel y no por puntos para que sea igual de difícil en todos los juegos. */
const REWARD_LV=2;
;

const rwdName=()=>_t(['','lB','lE','l1'][REWARD_LV]);
;

const rwdHtml=lv=>`<p class="rwd${lv>=REWARD_LV?' got':''}">⭐ ${lv>=REWARD_LV?_t('rwGot',rwdName()):_t('rwTry',rwdName())}</p>`;
;

const shareURL=()=>{try{if(window.top===window&&/^https?:$/.test(location.protocol))return location.href.split('#')[0]}catch(e){}return IGP};
;

let DLP=null;
;

const dlCap=()=>DLP||(DLP=(window.claude&&typeof window.claude.use==='function')?window.claude.use('downloads').catch(()=>null):Promise.resolve(null));
;

async function shareBlob(r){try{await document.fonts.load('800 80px "Bricolage Grotesque"')}catch(e){}
await Promise.all(['gatoLibro','kgafas','gatoMatraz','gatoLupa','matrazLlora','saturno','monarca','molecula','morpho','luna','geoda'].map(k=>stkImg(k).decode().catch(()=>{})));
return new Promise(res=>shareCanvas(r).toBlob(res,'image/png'))}
;

async function copyTxt(t){try{await navigator.clipboard.writeText(t);return true}catch(e){}
try{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch(e){return false}}
;

async function saveImg(blob,src){
const dl=await dlCap();
if(dl){try{await dl.save({filename:'labstyle-arcade.png',data:blob});return 'saved'}catch(e){if(e&&e.code==='declined')return 'declined';if(e&&e.code==='rate_limited')return 'busy'}}
try{const a=document.createElement('a');a.href=src;a.download='labstyle-arcade.png';document.body.appendChild(a);a.click();a.remove();return 'dl'}catch(e){return 'manual'}}
;

async function share(){
const r=LASTRES;if(!r)return;
const blob=await shareBlob(r);if(!blob)return;
const file=new File([blob],'labstyle-arcade.png',{type:'image/png'}),url=shareURL(),txt=_t('shareTxt',r.name,r.score,r.title),full=txt+' '+url,enc=encodeURIComponent;
let canFile=false;try{canFile=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[file]}))}catch(e){}
const canSheet=!!navigator.share,src=URL.createObjectURL(blob);
const m=document.createElement('div');m.className='modal';
const ap=(href,c,n)=>`<a class="app" style="--tc:${c}" href="${href}" target="_blank" rel="noopener">${n}</a>`;
m.innerHTML=`<div class="card shr" role="dialog" aria-modal="true" aria-labelledby="shT"><h2 id="shT">${_t('shT')}</h2>
<img class="shimg" alt="${_t('imgAlt')}" src="${src}">${rwdHtml(r.win?r.lv:0)}
<button class="go alt" id="shP">${canFile?'📤 '+_t('shImg'):'⬇️ '+_t('shSave')}</button>
<div class="igp" id="igp" hidden><h3>${_t('igT')}</h3><ol>
<li><span>${_t('ig1')}</span><button type="button" class="app" style="--tc:#FFE45C" id="igC">📋 ${_t('igCopy')}</button></li>
<li><span>${_t(canFile?'ig2s':'ig2d')}</span><button type="button" class="app" style="--tc:#FFB3C1" id="igS">${canFile?'📤 '+_t('igShare'):'⬇️ '+_t('shSave')}</button></li>
<li><span>${_t('ig3')}</span><a class="app" style="--tc:#fff" href="https://www.instagram.com/" target="_blank" rel="noopener">${_t('shOpenIG')}</a></li></ol></div>
<p class="lead">${_t('shApps')}</p>
<div class="apps">
<button class="app" style="--tc:#FFB3C1" id="shIG">Instagram</button>
${ap('https://wa.me/?text='+enc(full),'#8FEBCB','WhatsApp')}
${ap('https://t.me/share/url?url='+enc(url)+'&text='+enc(txt),'#A8DDFF','Telegram')}
${ap('https://x.com/intent/post?text='+enc(txt)+'&url='+enc(url),'#fff','X')}
${ap('https://www.facebook.com/sharer/sharer.php?u='+enc(url)+'&quote='+enc(txt),'#CFC7FF','Facebook')}
<button class="app" style="--tc:#FFE45C" id="shC">📋 ${_t('shCopy')}</button>
${canSheet&&!canFile?`<button class="app wide" style="--tc:#fff" id="shM">${_t('shMore')}</button>`:''}
</div>
<p class="msg" id="shR" aria-live="polite"></p>
<div class="row2"><button class="go" id="shX">${_t('close')}</button></div></div>`;
document.body.appendChild(m);
const R=m.querySelector('#shR'),say=t=>{R.innerHTML=t};
const close=()=>{m.remove();URL.revokeObjectURL(src);document.removeEventListener('keydown',ek)},ek=e=>{if(e.key==='Escape')close()};
document.addEventListener('keydown',ek);m.onclick=e=>{if(e.target===m)close()};
const x=m.querySelector('#shX');x.onclick=close;
const after=s=>say(s==='saved'||s==='dl'?_t('shSaved'):s==='declined'?'':s==='busy'?_t('shBusy'):_t('shManual'));
m.querySelector('#shP').onclick=async()=>{
if(canFile){try{await navigator.share({files:[file],text:full});return}catch(e){if(e&&e.name==='AbortError')return}}
after(await saveImg(blob,src))};
/* Instagram no lee el @ dentro de la imagen: se muestran los pasos para agregar la mención real */
m.querySelector('#shIG').onclick=()=>{const p=m.querySelector('#igp');p.hidden=false;m.querySelector('#shIG').classList.add('on');p.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});m.querySelector('#igC').focus()};
m.querySelector('#igC').onclick=async function(){const ok=await copyTxt('@nic.labstyle');this.textContent=ok?'✅ '+_t('igCopied'):'@nic.labstyle';say(ok?_t('igCopiedD'):_t('igNoCopy'))};
m.querySelector('#igS').onclick=async()=>{
if(canFile){try{await navigator.share({files:[file]});return}catch(e){if(e&&e.name==='AbortError')return}}
after(await saveImg(blob,src))};
m.querySelector('#shC').onclick=async()=>say(await copyTxt(full)?_t('shCopied'):_t('shNoCopy'));
const mb=m.querySelector('#shM');if(mb)mb.onclick=async()=>{try{await navigator.share({text:txt,url})}catch(e){if(e&&e.name!=='AbortError')say(_t('shNoSheet'))}};
m.querySelector('#shP').focus()}
;

const ICON=(b)=>`<button class="back" onclick="${b}">${_t('back')}</button>`;
;


/* ---------- MENÚS ---------- */
/* stickers del fondo: flotan despacio por detrás del contenido y rebotan en los bordes */
let WAND=null,WSTEP=null;
;

/* se mueven solo en el inicio; al entrar a otra sección se quedan quietos donde estaban */
function wander(){
if(RM||WAND)return;
if(WSTEP){WSTEP.reset();WAND=requestAnimationFrame(WSTEP);return}
const L=document.createElement('div');L.className='wand';L.setAttribute('aria-hidden','true');
const big=innerWidth>=900;
const ks=[['saturno',big?110:62],['monarca',big?70:44],['astronauta',big?84:52],['jupiter',big?86:54],['morpho',big?64:40],['geoda',big?70:44]];
const vw=innerWidth,vh=innerHeight;
const it=ks.map(([k,sz],n)=>{const el=document.createElement('img');el.className='stk';el.src=STK[k];el.alt='';el.style.height=sz+'px';L.appendChild(el);
const a=Math.random()*Math.PI*2,v=5+Math.random()*5;   /* px por segundo: lento */
return{el,sz,fly:k==='monarca'||k==='morpho',x:(n%3)/3*vw+Math.random()*vw/3*.8,y:(n<3?.1:.55)*vh+Math.random()*vh*.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:(Math.random()-.5)*24,vr:(Math.random()<.5?-1:1)*(1.5+Math.random()*2),t:Math.random()*9}});
document.body.prepend(L);
let last=performance.now();
const step=now=>{
if(!document.querySelector('.homewrap')){WAND=null;return}
const dt=Math.min(.05,(now-last)/1000);last=now;const W=innerWidth,H=innerHeight;
for(const o of it){const w=o.el.offsetWidth||o.sz;o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.r+=o.vr*dt;
if(o.x<-w*.3){o.x=-w*.3;o.vx=Math.abs(o.vx)}else if(o.x>W-w*.7){o.x=W-w*.7;o.vx=-Math.abs(o.vx)}
if(o.y<-o.sz*.3){o.y=-o.sz*.3;o.vy=Math.abs(o.vy)}else if(o.y>H-o.sz*.7){o.y=H-o.sz*.7;o.vy=-Math.abs(o.vy)}
if(Math.abs(o.r)>16)o.vr=-Math.sign(o.r)*Math.abs(o.vr);
const sx=o.fly?.6+.4*Math.abs(Math.sin(o.t*3)):1;
o.el.style.transform=`translate(${o.x.toFixed(1)}px,${(o.y+Math.sin(o.t*.8)*6).toFixed(1)}px) rotate(${o.r.toFixed(1)}deg) scaleX(${sx.toFixed(2)})`}
WAND=requestAnimationFrame(step)};
step.reset=()=>{last=performance.now()};WSTEP=step;
WAND=requestAnimationFrame(step)}
;

const ZN={gen:['eq','nom','mem','gue'],tab:['sym','name','dat','dnd'],mit:['mito'],org1:['org-alc','org-hal','org-alq','org-est','org-alo','org-ete','sn'],org2:['org-aro','org-cet','org-ami','org-aci']};
;

const zb=z=>{const ids=ZN[z],ls=ids.map(i=>LS.get('lvl:'+i,0)),d=ls.filter(x=>x>0).length;return d?`<span class="zb">${['','🥉','🥈','🥇'][Math.max(...ls)]} ${d}/${ids.length}</span>`:''};
;

const slgHtml=()=>`<p class="slg">${T('<span>Entra.</span> <span>Juega.</span> <span>Aprende.</span>','<span>Step in.</span> <span>Play.</span> <span>Learn.</span>')}</p>`;
;

const WL={gen:['El lab donde todo se equilibra','The lab where everything balances'],tab:['118 casillas, cero excusas','118 tiles, zero excuses'],mit:['¿Verdad o mito? Tú decides','Myth or fact? You decide'],org1:['Moléculas que se rompen y se unen','Molecules that break and bond'],org2:['Anillos, carbonilos y mucho aroma','Rings, carbonyls and lots of aroma']};
;

const wl=z=>`<span class="wl">${T(WL[z][0],WL[z][1])}</span>`;
;

const zp=z=>{const ls=ZN[z].map(i=>LS.get('lvl:'+i,0)),v=Math.round(ls.reduce((a,b)=>a+b,0)/(3*ls.length)*100);return `<span class="zp" role="img" aria-label="${v}%"><i style="width:${v}%"></i></span>`};
;

const gprog=()=>{const ids=Object.values(ZN).flat(),ls=ids.map(i=>LS.get('lvl:'+i,0)),v=Math.round(ls.reduce((a,b)=>a+b,0)/(3*ids.length)*100),f=ls.filter(x=>!x).length;
const m=f?T(`Te faltan <b>${f}</b> actos para tener medalla en todos`,`<b>${f}</b> acts left to earn a medal in all of them`):T('¡Tienes medalla en todos! Ahora sube cada uno a 🥇','You have a medal in every mode! Now push each one to 🥇');
return `<div class="gp"><span>${T('Tu progreso en el circo','Your circus progress')} · ${v}%</span><span class="zp" role="img" aria-label="${v}%"><i style="width:${v}%"></i></span><p>${m}</p></div>`};
;

const aboutHtml=()=>{const q=[[T('¿Es gratis?','Is it free?'),T('Sí. Es gratis y funciona desde tu celular.','Yes. It is free and works on your phone.')],[T('¿Sirve para la universidad?','Is it useful for university?'),T('Orgánica 1 y 2 siguen la nomenclatura y las reacciones del libro de Wade (volúmenes 1 y 2). General y tabla periódica cubren lo básico para empezar.','Organic 1 and 2 follow the nomenclature and reactions of Wade (volumes 1 and 2). General and periodic table cover the basics to get started.')],[T('¿Cómo mantengo mi racha?','How do I keep my streak?'),T('Juega al menos una partida cada día. Toca el 🔥 de arriba para ver tu racha.','Play at least one game every day. Tap the 🔥 at the top to see your streak.')],[T('¿Se guarda mi progreso?','Is my progress saved?'),T('Sí, en este dispositivo. Si cambias de celular o borras los datos del navegador, empiezas de cero.','Yes, on this device. If you switch phones or clear your browser data, you start over.')],[T('¿Falló algo o quieres un tema?','Something broke or want a topic?'),T('Cuéntame por Instagram en @nic.labstyle o con el botón de sugerencias.','Tell me on Instagram at @nic.labstyle or use the suggestions button.')]];
return `<section class="abt" aria-labelledby="abt-t"><h2 id="abt-t">${T('Sobre Labstyle','About Labstyle')}</h2><p>${T('Labstyle Arcade nació para estudiar química sin aburrirte: un circo digital con funciones cortas, medallas y un gato que vigila que nada explote. Hecho por <a href="https://www.instagram.com/nic.labstyle/" target="_blank" rel="noopener">@nic.labstyle</a>.','Labstyle Arcade was made to study chemistry without getting bored: a digital circus with short shows, medals and a cat making sure nothing explodes. Made by <a href="https://www.instagram.com/nic.labstyle/" target="_blank" rel="noopener">@nic.labstyle</a>.')}</p>${q.map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}<p class="clo">${T('Solo has visto la entrada de la carpa. Aún quedan más actos por descubrir.','You have only seen the tent entrance. There are many more acts to discover.')}</p></section>`};
;

const FLM='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2.2C11 8.5 11 5.5 12 3z"/></svg>';
;

const POS=z=>z===1?[1,1]:z===2?[1,18]:z<=4?[2,z-2]:z<=10?[2,z+8]:z<=12?[3,z-10]:z<=18?[3,z]:z<=36?[4,z-18]:z<=54?[5,z-36]:z<=56?[6,z-54]:z<=71?[9,z-54]:z<=86?[6,z-68]:z<=88?[7,z-86]:z<=103?[10,z-86]:[7,z-100];
;

const MROWS=[['gen','Eq','general','genD'],['tab','Z','tabla','tabD'],['mit','Mi',"play('mito')",'mitD'],['org1','C','org1','org1D'],['org2','Ar','org2','org2D']];
;

const RING=(v)=>{const items=MROWS.map(([z,sy,fn])=>({z,fn,dn:ZN[z].filter(i=>LS.get('lvl:'+i,0)>0).length}));items.push({soon:1});
const bt=items.map((x,i)=>x.soon?`<button class="bzb soon" data-i="${i}" disabled>${T('Próximamente','Coming soon')}</button>`:`<button class="bzb${x.dn?' lit':''}" data-i="${i}" data-lit="${x.dn?1:0}" onclick="${x.fn.includes('(')?x.fn:x.fn+'()'}">${_t(x.z)}</button>`).join('');
return `<section class="ringp" aria-label="${T('Materias','Subjects')}"><div class="bz3" id="bz3"><canvas aria-hidden="true"></canvas>${bt}</div><p class="figc"><b>Fig. 1</b> — ${T('Benceno, C₆H₆. Arrástralo para girarlo y toca un átomo para entrar a una materia.','Benzene, C₆H₆. Drag to rotate it and tap an atom to enter a subject.')}</p></section>`};
;

function bzStart(){const el=document.getElementById('bz3');if(!el)return;cancelAnimationFrame(window.BZF);
loadTHREE().then(()=>{if(!el.isConnected)return;const T=THREE,rm=typeof RM!=='undefined'&&RM,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),cv=el.querySelector('canvas');let r;
try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){return}
r.setPixelRatio(Math.min(devicePixelRatio,2));const S=new T.Scene(),C=new T.PerspectiveCamera(36,1,.1,60),V=T.Vector3;C.position.set(0,0,13);
S.add(new T.AmbientLight(0xffffff,.7));const L=(c,i,x,y,z)=>{const l=new T.PointLight(c,i,70);l.position.set(x,y,z);S.add(l)};L(0xff5ab4,.9,-8,6,7);L(0x4fd8ff,.8,8,5,7);L(0xffe08a,1,0,9,9);
const G=new T.Group();S.add(G);const gold=new T.MeshPhongMaterial({color:0xe0a93b,specular:0xfff2b0,shininess:120}),white=new T.MeshPhongMaterial({color:0xf4efe6,specular:0xffffff,shininess:90});
const sph=(q,m)=>new T.Mesh(new T.SphereGeometry(q,32,24),m),cyl=(a,b,q,m)=>{const d=b.clone().sub(a),k=new T.Mesh(new T.CylinderGeometry(q,q,d.length(),12),m);k.position.copy(a).add(b).multiplyScalar(.5);k.quaternion.setFromUnitVectors(new V(0,1,0),d.normalize());return k},
col=(p,u)=>{const k=new T.Mesh(new T.TorusGeometry(.2,.055,8,18),gold);k.position.copy(p);k.quaternion.setFromUnitVectors(new V(0,0,1),u);G.add(k)};
const cols=[0xe0364f,0x1fb5c9,0x9b3fd0,0xe0364f,0x2f6fe0,0xff5c8a],Rr=2.3,P=[],cs=[];
for(let i=0;i<6;i++){const a=Math.PI/2-i*Math.PI/3,p=new V(Rr*Math.cos(a),Rr*Math.sin(a),0);P.push(p);const lit=el.querySelectorAll('.bzb')[i].dataset.lit==='1',soon=i===5;
 const m=new T.MeshPhongMaterial({color:cols[i],specular:0xffffff,shininess:140,emissive:lit?0x5a3a00:0,transparent:soon,opacity:soon?.55:1}),c=sph(lit?.84:.78,m);c.position.copy(p);c.userData.i=i;G.add(c);cs.push(c);
 const o=p.clone().normalize(),q=o.clone().multiplyScalar(Rr+1.6);G.add(cyl(o.clone().multiplyScalar(Rr+.6),q,.1,gold));col(o.clone().multiplyScalar(Rr+.85),o);const h=sph(.4,white);h.position.copy(q);G.add(h)}
for(let i=0;i<6;i++){const a=P[i],b=P[(i+1)%6],d=b.clone().sub(a),u=d.clone().normalize(),n=new V(-u.y,u.x,0).multiplyScalar(.12),s0=a.clone().add(u.clone().multiplyScalar(.75)),e0=b.clone().sub(u.clone().multiplyScalar(.75));
 if(i%2===0){G.add(cyl(s0.clone().add(n),e0.clone().add(n),.075,gold),cyl(s0.clone().sub(n),e0.clone().sub(n),.075,gold))}else G.add(cyl(s0,e0,.11,gold));col(s0,u);col(e0,u)}
const blocks=[],tints=['#ff7aa8','#8ad9ff','#ffd86a','#b69cff','#7ee2b8','#ff9d6a'];
['C','H','O','N','C','N'].forEach((ch,i)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#160a3a';x.fillRect(0,0,128,128);x.shadowColor=tints[i];x.shadowBlur=14;x.strokeStyle=tints[i];x.lineWidth=7;x.strokeRect(10,10,108,108);x.fillStyle='#fff';x.font='800 80px Fraunces,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowBlur=20;x.fillText(ch,64,68);
 const k=new T.Mesh(new T.BoxGeometry(.9,.9,.9),(tx=>new T.MeshPhongMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.9,shininess:80}))(new T.CanvasTexture(c)));k.userData={a:i/6*6.283,r:5+(i%2)*.7,y:(i%3-1)*1.7};blocks.push(k);S.add(k)});
const N=90,pg=new T.BufferGeometry(),pp=new Float32Array(N*3);for(let i=0;i<N*3;i++)pp[i]=(Math.random()-.5)*(i%3==2?8:18);pg.setAttribute('position',new T.BufferAttribute(pp,3));const st=new T.Points(pg,new T.PointsMaterial({color:0xfff0b0,size:.09,transparent:true,opacity:.85}));S.add(st);
/* --- ENTORNO CIRCO: carpa, gradas, pista, focos y luces de feria (todo 3D, gira con la cámara) --- */
const mkc=(w,h,fn)=>{const k=document.createElement('canvas');k.width=w;k.height=h;fn(k.getContext('2d'),w,h);const t=new T.CanvasTexture(k);t.anisotropy=4;return t};
const softT=mkc(64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const tentT=mkc(1024,512,(x,w,h)=>{for(let i=0;i<20;i++){x.fillStyle=i%2?'#b3182f':'#1d2f93';x.fillRect(i*w/20,0,w/20,h);const g=x.createLinearGradient(i*w/20,0,(i+1)*w/20,0);g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(.5,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(i*w/20,0,w/20,h)}
 const v=x.createLinearGradient(0,0,0,h);v.addColorStop(0,'rgba(6,2,20,.9)');v.addColorStop(.5,'rgba(6,2,20,.18)');v.addColorStop(1,'rgba(6,2,20,.82)');x.fillStyle=v;x.fillRect(0,0,w,h);
 x.fillStyle='#ffe27a';for(let i=0;i<60;i++){const X=Math.random()*w,Y=Math.random()*h*.5,q=2+Math.random()*3;x.globalAlpha=.5+Math.random()*.5;x.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?q*.45:q;x.lineTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr)}x.fill()}x.globalAlpha=1});
const tent=new T.Mesh(new T.CylinderGeometry(26,26,44,56,1,true),new T.MeshBasicMaterial({map:tentT,side:T.BackSide,fog:false}));tent.position.y=6;S.add(tent);
const seatT=mkc(1024,128,(x,w,h)=>{x.fillStyle='#120a22';x.fillRect(0,0,w,h);const SC=['#c8283f','#2a47c9','#f0c030','#2a47c9','#c8283f'];for(let r=0;r<4;r++)for(let i=0;i<64;i++){x.fillStyle=SC[(i*7+r*3)%5];x.fillRect(i*16+2,r*30+8,12,18);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(i*16+2,r*30+22,12,4)}x.fillStyle='#d9a233';x.fillRect(0,0,w,5);x.fillRect(0,h-4,w,4)});
const bleach=new T.Mesh(new T.CylinderGeometry(21,21,4.4,64,1,true),new T.MeshBasicMaterial({map:seatT,side:T.BackSide,fog:false}));bleach.position.y=-3.4;S.add(bleach);
const ringT=mkc(1024,1024,(x,w,h)=>{x.translate(w/2,h/2);for(let i=0;i<36;i++){x.fillStyle=i%2?'#ffd24d':'#d9242f';x.beginPath();x.moveTo(0,0);x.arc(0,0,w,i/36*Math.PI*2,(i+1)/36*Math.PI*2);x.fill()}
 const g=x.createRadialGradient(0,0,0,0,0,w/2);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(.5,'rgba(20,4,24,.3)');g.addColorStop(.9,'rgba(10,2,18,.8)');g.addColorStop(1,'rgba(10,2,18,1)');x.fillStyle=g;x.fillRect(-w/2,-h/2,w,h)});
const floor=new T.Mesh(new T.CircleGeometry(19,72),new T.MeshBasicMaterial({map:ringT,fog:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-5.4;S.add(floor);
const pool=new T.Sprite(new T.SpriteMaterial({map:softT,color:0xff7ad8,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:.3}));pool.scale.set(9,9,1);pool.position.set(0,-5.2,0);S.add(pool);
/* focos de colores que barren la pista */
const coneMat=(col,o)=>new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{uC:{value:new T.Color(col)},uO:{value:o}},
 vertexShader:'varying float vY;varying vec3 vN;varying vec3 vW;void main(){vY=uv.y;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
 fragmentShader:'uniform vec3 uC;uniform float uO;varying float vY;varying vec3 vN;varying vec3 vW;void main(){float e=pow(abs(dot(normalize(vN),normalize(cameraPosition-vW))),1.3);gl_FragColor=vec4(uC,pow(vY,1.4)*e*uO);}'});
const beams=[[-12,14,-8,0xff4fd8,.34],[12,14,-8,0xffd24d,.3],[-5,15,-12,0x4fd8ff,.24],[5,15,-12,0xa24bff,.22]].map(a=>{const g=new T.Group();g.position.set(a[0],a[1],a[2]);S.add(g);const m=new T.Mesh(new T.CylinderGeometry(.35,3.6,26,32,1,true),coneMat(a[3],a[4]));m.position.y=-13;g.add(m);
 const lamp=new T.Mesh(new T.SphereGeometry(.7,12,10),new T.MeshBasicMaterial({color:a[3]}));g.add(lamp);g.lookAt(0,-1,0);g.rotateX(-Math.PI/2);g.userData.q=g.quaternion.clone();return g});
/* guirnaldas de bombillas que titilan */
const NB=96,bpa=new Float32Array(NB*3),bca=new Float32Array(NB*3),BC=[[1,.3,.4],[1,.85,.3],[.4,1,.6],[.45,.7,1],[1,.4,.95]],bph=[];
for(let i=0;i<NB;i++){const row=i%3,a=-Math.PI*.9+(i/NB)*Math.PI*1.8,rad=21.5-row*.8,sag=Math.sin(((i*3/NB)%1)*Math.PI)*-1.6;bpa[i*3]=Math.sin(a)*rad;bpa[i*3+1]=4.5+row*3.4+sag;bpa[i*3+2]=-Math.cos(a)*rad;bph.push(Math.random()*6.28)}
const bgm=new T.BufferGeometry();bgm.setAttribute('position',new T.BufferAttribute(bpa,3));bgm.setAttribute('color',new T.BufferAttribute(bca,3));
const bulbs=new T.Points(bgm,new T.PointsMaterial({map:softT,size:1.8,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));S.add(bulbs);
const envF=t=>{tent.rotation.y=rm?0:t*.012;
 for(let i=0;i<NB;i++){const k=.4+.6*Math.max(0,Math.sin(t*2.8+bph[i]*3)),c=BC[(i+(Math.floor(t*1.1)%2?1:0))%5];bca[i*3]=c[0]*k;bca[i*3+1]=c[1]*k;bca[i*3+2]=c[2]*k}bgm.attributes.color.needsUpdate=true;
 beams.forEach((g,i)=>{g.quaternion.copy(g.userData.q);if(!rm){g.rotateZ(Math.sin(t*.45+i*1.7)*.14);g.rotateX(Math.sin(t*.33+i)*.07)}});
 pool.material.opacity=.26+.08*Math.sin(t*1.7)};

const btn=[...el.querySelectorAll('.bzb')],RC=new T.Raycaster(),mv=new T.Vector2();let W=1,H=1,vis=true,ux=-.2,uy=0,vx=0,drag=0,mo=0,lx=0,ly=0,hov=-1;
const fit=()=>{W=el.clientWidth;H=el.clientHeight;r.setSize(W,H,false);C.aspect=W/H;C.position.z=14.4/Math.min(1,Math.max(W/H,.7));C.position.y=2.3;C.lookAt(0,-.3,0);C.updateProjectionMatrix()};new ResizeObserver(fit).observe(el);fit();new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(el);
const pick=e=>{const b=cv.getBoundingClientRect();mv.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);RC.setFromCamera(mv,C);const h=RC.intersectObjects(cs)[0];return h?h.object.userData.i:-1};
cv.addEventListener('pointerdown',e=>{drag=1;mo=0;lx=e.clientX;ly=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!drag){hov=pick(e);cv.style.cursor=hov>=0&&hov<5?'pointer':'grab';return}const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;mo+=Math.abs(dx)+Math.abs(dy);uy+=dx*.012;ux=cl(ux+dy*.01,-1.2,1.2);vx=dx*.012});
cv.addEventListener('pointerup',e=>{drag=0;if(mo<6){const i=pick(e);if(i>=0&&i<5)btn[i].click()}});cv.addEventListener('pointercancel',()=>drag=0);
const tmp=new V();
function f(n){if(!el.isConnected)return;window.BZF=requestAnimationFrame(f);if(!vis)return;const t=n/1000;if(!drag){uy+=vx;vx*=.94}
 G.rotation.x=ux+(rm?0:Math.sin(t*.4)*.12);G.rotation.y=uy+(rm?0:Math.sin(t*.5)*.7);G.rotation.z=rm?0:Math.sin(t*.3)*.06;
 cs.forEach((c,i)=>c.scale.setScalar(i===hov&&i<5?1.12:1));
 blocks.forEach(k=>{const u=k.userData,a=u.a+(rm?0:t*.25);k.position.set(Math.cos(a)*u.r,u.y+(rm?0:Math.sin(t*1.2+u.a)*.3),Math.sin(a)*u.r*.5-1);k.rotation.x=t*.5;k.rotation.y=t*.7});st.rotation.z=t*.01;envF(t);
 r.render(S,C);
 const cx=W/2,cy=H/2;btn.forEach((b,i)=>{G.updateMatrixWorld();cs[i].getWorldPosition(tmp);tmp.project(C);const x=(tmp.x*.5+.5)*W,y=(-tmp.y*.5+.5)*H,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1,k=(W<420?44:62);b.style.transform=`translate(${(x+dx/d*k).toFixed(1)}px,${(y+dy/d*k*.8).toFixed(1)}px) translate(-50%,-50%)`})}
window.BZF=requestAnimationFrame(f)}).catch(()=>{})}
;

function ringStart(){bzStart()}
;

function home(){
const n=LS.get('name',''),ids=Object.values(ZN).flat(),all=ids.map(i=>LS.get('lvl:'+i,0)),v=all.reduce((x,y)=>x+y,0)/(3*ids.length),n118=Math.round(118*v);
const cells=ELS.map((s,i)=>{const[r,c]=POS(i+1);return `<i class="${i<n118?'on':''}" style="grid-area:${r}/${c}">${s}</i>`}).join('');
const rows=MROWS.map(([z,sy,fn,d])=>{const ls=ZN[z].map(i=>LS.get('lvl:'+i,0)),dn=ls.filter(x=>x>0).length,best=Math.max(...ls);
return `<button class="mrow" onclick="${fn.includes('(')?fn:fn+'()'}" title="${esc(T(WL[z][0],WL[z][1]))}"><span class="sy">${sy}</span><span><b>${_t(z)}</b><small>${_t(d)}</small>${zp(z)}</span><span class="mt">${dn}/${ls.length}${best?' · '+['','I','II','III'][best]:''}</span></button>`}).join('');
$.innerHTML=`<div class="homewrap"><div class="mast"><span>Vol. 01</span><span>${T('Edición Circo Digital','Digital Circus Issue')}</span><span>${new Date().toLocaleDateString(LANG,{day:'numeric',month:'short',year:'numeric'})}</span></div><header class="hh"><h1>Labstyle <mark>Arcade</mark></h1><div class="tools"><button class="tbtn" onclick="streakModal()" aria-label="${_t('ariaSt')}">${FLM} <b>${dayStreak()}</b></button><button class="tbtn" onclick="toggleLang()" aria-label="${_t('ariaLang')}"><b>${LANG.toUpperCase()}</b></button></div></header>
<p class="sub">${n?`<b>${_t('hi')}, ${esc(n)}</b> `:''}${_t('tag')}</p>${slgHtml()}
<div class="hgrid">${RING(v)}</div>
<section class="pnl" aria-label="${T('Progreso','Progress')}"><div class="phd"><span>${T('Tabla de progreso','Progress table')}</span><b class="mt">${n118}/118</b></div><div class="pt18" role="img" aria-label="${n118}/118">${cells}</div><p class="pnote">${T('Cada medalla ilumina casillas. 118 = medalla en todos los modos.','Each medal lights up tiles. 118 = a medal in every mode.')}</p></section>
${aboutHtml()}<div class="hfoot"><div class="hdeco"><p class="tag"><a href="https://www.instagram.com/nic.labstyle/" target="_blank" rel="noopener">@nic.labstyle</a></p></div>${footHtml()}</div></div>`;ringStart()}
;

/* ---------- CARGA INICIAL: contador 0 → 118 ---------- */
const ELS='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
;

const elCol=z=>[2,10,18,36,54,86,118].includes(z)?'--c4':[1,6,7,8,9,15,16,17,34,35,53].includes(z)?'--c3':[3,4,11,12,19,20,37,38,55,56,87,88].includes(z)?'--c1':(z>=21&&z<=30)||(z>=39&&z<=48)||(z>=72&&z<=80)||(z>=104&&z<=112)?'--c5':'--c2';
;

let BOOTED=false;
;

function bootLoader(){
if(BOOTED)return;BOOTED=true;
const L=document.createElement('div');L.className='ldr';L.setAttribute('role','status');L.setAttribute('aria-live','polite');
L.innerHTML=`<div class="ldr-in"><p class="ldr-hi">${T('Bienvenido a','Welcome to')}</p><p class="ldr-t">Labstyle <mark>Arcade</mark></p><div class="ldr-el" aria-hidden="true"><i class="z"></i><b class="sy">?</b></div><div class="ldr-n" aria-hidden="true"><span>0</span><small>/118</small></div><div class="ldr-bar" aria-hidden="true"><i></i></div><p class="ldr-s"></p><p class="ldr-slg">${T('Entra. Juega. Aprende.','Step in. Play. Learn.')}</p></div>`;
document.body.appendChild(L);$.inert=true;
const q=c=>L.querySelector(c),el=q('.ldr-el'),zz=q('.z'),sy=q('.sy'),num=q('.ldr-n span'),bar=q('.ldr-bar i'),st=q('.ldr-s');
const MSG=[T('Montando la carpa…','Raising the big top…'),T('Encendiendo los reflectores…','Switching on the spotlights…'),T('¡Función lista!','Show ready!')];
let phase=-1;const say=p=>{if(p!==phase){phase=p;st.textContent=MSG[p]}};
const paint=n=>{num.textContent=n;bar.style.transform=`scaleX(${n/118})`;
if(n>=1){zz.textContent=n;sy.textContent=ELS[n-1];el.style.background=`var(${elCol(n)})`}
if(phase<2)say(n>=70?1:0)};
/* imágenes (precarga existente) + tipografía; si algo falla o tarda, se sigue igual */
const imgs=Promise.all(['gatoMatraz','gatoLupa','molecula','gatoMicro','gatoBata','monarca','kgafas'].map(k=>stkImg(k).decode().catch(()=>{})));
const fonts=(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).catch(()=>{});
const ready=Promise.race([Promise.all([imgs,fonts]),new Promise(r=>setTimeout(r,3500))]);
let cnt=false,rdy=false,fin=false;
const reveal=()=>{L.classList.add(RM?'fade':'up');
setTimeout(()=>{L.remove();$.inert=false;const g=document.getElementById('splgo');if(g)g.focus({preventScroll:true})},RM?280:600)};
const finish=()=>{if(fin||!cnt||!rdy)return;fin=true;paint(118);say(2);el.classList.add('ok');setTimeout(reveal,RM?200:380)};
ready.then(()=>{rdy=true;finish()});
const D=RM?600:1700,t0=performance.now();let last=-1;
const step=now=>{const p=Math.min(1,(now-t0)/D),n=Math.round(118*(1-(1-p)*(1-p)));
if(n!==last){last=n;paint(n)}
if(p<1)requestAnimationFrame(step);else{cnt=true;finish()}};
paint(0);requestAnimationFrame(step);
/* red de seguridad: nunca se queda bloqueada */
setTimeout(()=>{cnt=true;rdy=true;finish()},6000)}
;

/* ---------- CINTA TRANSPORTADORA ---------- */
function cvHtml(){
const N=8,D=12,S=D/N,Z=[1,8,6,26,79,2,11,7],hit=.31*D;
const dl=(((hit-.08*S)%S)+S)%S-S;           /* el gato y la lámpara reaccionan justo cuando una pieza pasa por el arco */
const t=Z.map((z,i)=>`<i class="cv-t" style="--c:var(${elCol(z)});--k:${i};animation-delay:${(-i*S).toFixed(2)}s">${ELS[z-1]}</i>`).join('');
return `<div class="cv" role="img" aria-label="${T('Un gato de laboratorio vigila una cinta transportadora que convierte bloques en elementos de la tabla periódica','A lab cat watches a conveyor belt that turns blocks into periodic table elements')}"><div class="cv-s" aria-hidden="true" style="--S:${S}s;--dl:${dl.toFixed(2)}s"><div class="cv-sh"></div><span class="cv-leg" style="left:30cqw"></span><span class="cv-leg" style="left:60cqw"></span><span class="cv-leg" style="left:90cqw"></span>${sti('gatoBata','cv-cat')}<div class="cv-belt"></div>${t}<div class="cv-arch"><svg viewBox="0 0 60 70"><path d="M3 68V10Q3 3 10 3H50Q57 3 57 10V68H44V20H16V68Z" fill="#cfc9b8" stroke="#1B1E4B" stroke-width="3" stroke-linejoin="round"/></svg></div><b class="cv-lamp"></b><div class="cv-m"></div></div></div>`}
;

/* cada pieza, al volver a salir de la máquina, se convierte en otro elemento al azar (1–118) */
function cvInit(){document.querySelectorAll('.cv-t').forEach(t=>t.addEventListener('animationiteration',()=>{const z=1+Math.random()*118|0;t.textContent=ELS[z-1];t.style.setProperty('--c',`var(${elCol(z)})`)}))}
;

/* ---------- GATO INTERACTIVO ---------- */
const CAT=[
{f:['¡Miau! ¿Sabías que el símbolo del oro es Au? Viene del latín «aurum».','Meow! Did you know gold’s symbol is Au? It comes from Latin “aurum”.']},
{f:['El agua tiene una fórmula muy famosa: H₂O. ¿Ya la sabías? Son 2 hidrógenos y 1 oxígeno.','Water has a famous formula: H₂O. Did you know? It’s 2 hydrogens and 1 oxygen.']},
{f:['El hierro es Fe, del latín «ferrum». ¡No lo confundas con Ir, que es el iridio!','Iron is Fe, from Latin “ferrum”. Don’t mix it up with Ir, which is iridium!']},
{f:['El número atómico es la cantidad de protones de un átomo. ¡Como el contador que acabas de ver!','The atomic number is the number of protons in an atom. Just like the counter you just saw!']},
{f:['La sal de mesa es NaCl: sodio (Na) más cloro (Cl).','Table salt is NaCl: sodium (Na) plus chlorine (Cl).']},
{f:['El mercurio (Hg) es el único metal líquido a temperatura ambiente.','Mercury (Hg) is the only metal that is liquid at room temperature.']},
{f:['¿Listo para poner a prueba tus conocimientos de química? ¡Toca «Jugar ya»!','Ready to test your chemistry skills? Tap “Play now”!']},
{q:[['⚡ ¡Reto relámpago! ¿Cuál es el símbolo químico del sodio?',['Na','S','So'],0,'Na viene del latín «natrium».'],['⚡ Lightning round! What is the chemical symbol for sodium?',['Na','S','So'],0,'Na comes from Latin “natrium”.']]},
{q:[['⚡ ¿Qué elemento tiene el símbolo K?',['Potasio','Calcio','Kriptón'],0,'K viene del latín «kalium».'],['⚡ Which element has the symbol K?',['Potassium','Calcium','Krypton'],0,'K comes from Latin “kalium”.']]},
{q:[['⚡ ¿Cuántos protones tiene el carbono (C)?',['6','12','8'],0,'Su número atómico es 6.'],['⚡ How many protons does carbon (C) have?',['6','12','8'],0,'Its atomic number is 6.']]},
{q:[['⚡ ¿Cuál es la fórmula del dióxido de carbono?',['CO₂','CO','C₂O'],0,'Un carbono y dos oxígenos.'],['⚡ What is the formula of carbon dioxide?',['CO₂','CO','C₂O'],0,'One carbon and two oxygens.']]},
{q:[['⚡ Una sustancia con pH 3 es…',['ácida','neutra','básica'],0,'Por debajo de 7 es ácida.'],['⚡ A substance with pH 3 is…',['acidic','neutral','basic'],0,'Below 7 is acidic.']]},
{q:[['⚡ ¿Cuál es el símbolo de la plata?',['Ag','Pb','Pt'],0,'Ag viene del latín «argentum».'],['⚡ What is the symbol for silver?',['Ag','Pb','Pt'],0,'Ag comes from Latin “argentum”.']]},
{q:[['⚡ ¿Cuál de estos es un gas noble?',['Neón','Sodio','Oxígeno'],0,'El neón (Ne) está en el grupo 18.'],['⚡ Which of these is a noble gas?',['Neon','Sodium','Oxygen'],0,'Neon (Ne) is in group 18.']]}
];
;

let CATQ=[],CATI=0;
;

const catNext=()=>{if(CATI>=CATQ.length){const last=CATQ[CATQ.length-1];CATQ=shuf(CAT.map((_,i)=>i));if(CATQ[0]===last&&CATQ.length>1)CATQ.push(CATQ.shift());CATI=0}return CAT[CATQ[CATI++]]};
;

const catTalk=on=>{const l=document.querySelector('.spl');if(l)l.classList.toggle('talk',on)};
;

const catClose=()=>{const d=document.getElementById('catd');if(d){d.hidden=true;d.innerHTML=''}catTalk(false)};
;

let CATDOC=false;
;

function catInit(){
const cat=document.getElementById('cat'),hint=document.getElementById('catb'),box=document.getElementById('catd');if(!cat||!hint||!box)return;
hint.innerHTML=`<div class="bub" role="button" tabindex="0" style="cursor:pointer"><span>${T('Pregúntale al gato','Ask the cat')}</span></div>`;
const hb=hint.firstElementChild;hb.onclick=()=>cat.click();hb.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cat.click()}};
const say=h=>{box.hidden=false;box.innerHTML=`<div class="bub">${h}</div>`;catTalk(true)};
if(!CATDOC){CATDOC=true;
document.addEventListener('click',e=>{if(!e.target.closest('#catd,#cat,#catb'))catClose()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')catClose()})}
cat.onclick=()=>{
cat.classList.remove('hop');void cat.offsetWidth;cat.classList.add('hop');buzz(12);
const it=catNext(),en=LANG==='en';
if(it.f){say(`<span>${it.f[en?1:0]}</span><small>${T('Toca al gato para otro','Tap the cat for another')}</small>`);return}
const [qq,os,ai,x]=it.q[en?1:0],opts=shuf(os.map((t,i)=>({t,ok:i===ai})));
say(`<span>${qq}</span><span class="cq-o">${opts.map((o,i)=>`<button type="button" class="cq" data-i="${i}">${o.t}</button>`).join('')}</span><span class="cq-f"></span>`);
const bs=[...box.querySelectorAll('.cq')],f=box.querySelector('.cq-f');
bs.forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];
bs.forEach(c=>{c.disabled=true;if(opts[+c.dataset.i].ok){c.classList.add('ok');c.textContent='✓ '+c.textContent}});
if(!o.ok){b.classList.add('no');b.textContent='✗ '+b.textContent}
f.innerHTML=o.ok?`✅ ${T('¡Correcto!','Correct!')} ${x}`:`❌ ${T('Casi: era','Almost: it was')} <b>${os[ai]}</b>. ${x}`;
sfx(o.ok?'ok':'no');cat.focus({preventScroll:true})})}}
;

/* ---------- 3D: cinta y diorama (three.js r128, carga perezosa) ---------- */
const THURL='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
;

let THP=null,JOBS=[],RAF=0;
;

const loadTHREE=()=>window.THREE?Promise.resolve():(THP=THP||new Promise((ok,no)=>{const s=document.createElement('script');s.src=THURL;s.onload=ok;s.onerror=()=>{THP=null;no()};document.head.appendChild(s)}));
;

const tick=t=>{RAF=0;JOBS=JOBS.filter(j=>{if(!j.cv.isConnected){j.r.dispose();return false}if(!document.hidden){const b=j.cv.getBoundingClientRect();if(RM||(b.bottom>0&&b.top<innerHeight))j.f(RM?3:t/1000)}return true});if(JOBS.length&&!RM)RAF=requestAnimationFrame(tick)};
;

const addJob=j=>{JOBS.push(j);if(!RAF)RAF=requestAnimationFrame(tick)};
;

function sc3(cv,fov,pos,look){const Q=THREE,r=new Q.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.outputEncoding=Q.sRGBEncoding;r.shadowMap.enabled=true;r.shadowMap.type=Q.PCFSoftShadowMap;
const s=new Q.Scene(),c=new Q.PerspectiveCamera(fov,1,.1,120);c.position.set(...pos);c.lookAt(...look);
const fit=()=>{const w=cv.clientWidth||1,h=cv.clientHeight||1;r.setSize(w,h,false);c.aspect=w/h;c.updateProjectionMatrix()};
new ResizeObserver(()=>requestAnimationFrame(fit)).observe(cv);fit();
const M=(col,o)=>new Q.MeshStandardMaterial(Object.assign({color:col,roughness:.65},o));
const P=(g,m,x,y,z,par)=>{const o=new Q.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;par&&par.add(o);return o};
const RB=(w,h,d,q)=>{const sh=new Q.Shape(),x=-w/2,y=-h/2;sh.moveTo(x+q,y);sh.lineTo(x+w-q,y);sh.quadraticCurveTo(x+w,y,x+w,y+q);sh.lineTo(x+w,y+h-q);sh.quadraticCurveTo(x+w,y+h,x+w-q,y+h);sh.lineTo(x+q,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-q);sh.lineTo(x,y+q);sh.quadraticCurveTo(x,y,x+q,y);
const g=new Q.ExtrudeGeometry(sh,{depth:d-q,bevelEnabled:true,bevelThickness:q/2,bevelSize:q/2,bevelSegments:3,curveSegments:5});g.center();g.computeBoundingBox();
const p=g.attributes.position,u=g.attributes.uv,b=g.boundingBox;for(let i=0;i<p.count;i++)u.setXY(i,(p.getX(i)-b.min.x)/(b.max.x-b.min.x),(p.getY(i)-b.min.y)/(b.max.y-b.min.y));return g};
const L=(pts,m)=>{const o=new Q.Mesh(new Q.LatheGeometry(pts.map(p=>new Q.Vector2(p[0],p[1])),24),m);return o};
return{Q,r,s,c,M,P,RB,L}}
;

const TX={};
;

const elTx=z=>TX[z]||(TX[z]=(()=>{const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');
x.fillStyle=getComputedStyle(document.documentElement).getPropertyValue(elCol(z)).trim()||'#FFE45C';x.fillRect(0,0,128,128);
x.strokeStyle=x.fillStyle='#1B1E4B';x.lineWidth=10;x.strokeRect(5,5,118,118);x.textBaseline='middle';
x.font='800 24px "Bricolage Grotesque",sans-serif';x.textAlign='left';x.fillText(z,16,28);
x.font='800 58px "Bricolage Grotesque",sans-serif';x.textAlign='center';x.fillText(ELS[z-1],64,76);
const t=new THREE.CanvasTexture(k);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t})());
;

const nz=(a,b,rp)=>{const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');x.fillStyle=a;x.fillRect(0,0,128,128);for(let i=0;i<900;i++){x.fillStyle=b;x.globalAlpha=Math.random()*.35;const z=1+Math.random()*3;x.fillRect(Math.random()*128,Math.random()*128,z,z)}const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rp,rp);t.encoding=THREE.sRGBEncoding;return t};
;

const stn=(base,rp,letter)=>{const k=document.createElement('canvas');k.width=k.height=256;const x=k.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);
for(let i=0;i<2800;i++){x.globalAlpha=Math.random()*.13;x.fillStyle=Math.random()<.5?'#000':'#fff';const z=2+Math.random()*7;x.fillRect(Math.random()*256,Math.random()*256,z,z)}
x.globalAlpha=.55;x.strokeStyle='#14161f';x.lineWidth=2;for(let i=0;i<4;i++){x.beginPath();let px=Math.random()*256,py=Math.random()*256;x.moveTo(px,py);for(let j=0;j<6;j++){px+=(Math.random()-.5)*60;py+=(Math.random()-.2)*40;x.lineTo(px,py)}x.stroke()}
x.globalAlpha=1;if(letter){x.fillStyle='#5EE0B5';x.shadowColor='#5EE0B5';x.shadowBlur=18;x.font='800 150px "Bricolage Grotesque",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(letter,128,140)}
const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rp,rp);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
;

/* gatito con bata y googles */
function kitty(S){const{Q,M,P}=S,g=new Q.Group(),or=M(0xf0a04b,{roughness:.8}),cr=M(0xfff0d6),wh=M(0xffffff,{roughness:.5}),bk=M(0x14151c,{roughness:.3}),mt=M(0x9aa3b5,{metalness:.5,roughness:.3});
P(new Q.CylinderGeometry(.4,.62,1.2,24),wh,0,.95,0,g);
[-.2,.2].forEach(x=>{P(new Q.CylinderGeometry(.11,.11,.4,10),or,x,.2,.05,g);P(new Q.SphereGeometry(.15,12,10),cr,x,.06,.14,g)});
[-1,1].forEach(k=>{const a=new Q.Group();a.position.set(k*.5,1.4,0);a.rotation.z=k*.35;g.add(a);P(new Q.CylinderGeometry(.12,.1,.6,10),wh,0,-.3,0,a);P(new Q.SphereGeometry(.12,10,10),or,0,-.65,0,a)});
const h=new Q.Group();h.position.y=2.1;g.add(h);
P(new Q.SphereGeometry(.62,28,22),or,0,0,0,h).scale.set(1.1,.95,1);
P(new Q.SphereGeometry(.27,16,14),cr,0,-.2,.46,h).scale.set(1.3,.85,.8);
P(new Q.SphereGeometry(.07,10,8),M(0xff8fa3),0,-.08,.7,h);
[-1,1].forEach(k=>{P(new Q.ConeGeometry(.22,.46,4),or,k*.4,.56,0,h).rotation.z=-k*.3;P(new Q.ConeGeometry(.12,.3,4),M(0xffb3b3),k*.4,.54,.07,h).rotation.z=-k*.3;
P(new Q.SphereGeometry(.1,12,12),bk,k*.25,.08,.52,h);P(new Q.SphereGeometry(.03,8,8),wh,k*.22,.12,.62,h);
P(new Q.TorusGeometry(.19,.045,8,20),mt,k*.25,.08,.56,h);P(new Q.CircleGeometry(.17,16),M(0xcfeaff,{transparent:true,opacity:.35}),k*.25,.08,.58,h)});
P(new Q.TorusGeometry(.62,.04,6,28),mt,0,.08,0,h).rotation.x=Math.PI/2;
const tl=new Q.Group();tl.position.set(0,.6,-.45);g.add(tl);
P(new Q.TubeGeometry(new Q.CatmullRomCurve3([new Q.Vector3(0,0,0),new Q.Vector3(0,-.1,-.5),new Q.Vector3(.1,.4,-.8),new Q.Vector3(.35,.9,-.7)]),16,.09,8),or,0,0,0,tl);
return{g,h,tl}}
;

/* cinta transportadora 3D */
function cvBuild(cv){const S=sc3(cv,32,[.6,4.2,12.5],[0,1.8,0]),{Q,r,s,c,M,P,RB}=S,G=new Q.Group();s.add(G);
s.add(new Q.HemisphereLight(0xffffff,0x9aa6d8,.7));
const d=new Q.DirectionalLight(0xffffff,.7);d.position.set(-4,9,7);d.castShadow=true;d.shadow.mapSize.set(1024,1024);Object.assign(d.shadow.camera,{left:-9,right:9,top:7,bottom:-7,near:1,far:30});d.shadow.radius=4;s.add(d);
const gr=new Q.Mesh(new Q.PlaneGeometry(40,40),new Q.ShadowMaterial({opacity:.22}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;G.add(gr);
const dk=M(0x15161c),st=M(0xa89f8a,{roughness:.95}),wh=M(0xf4f2ee,{roughness:.35});
const mc=new Q.Group();mc.position.set(-5.2,0,0);G.add(mc);
P(RB(2,2.1,1.9,.4),wh,0,1.55,0,mc);[-.6,.6].forEach(x=>P(new Q.CylinderGeometry(.14,.14,.2,12),dk,x,.1,.6,mc));
P(new Q.BoxGeometry(1.1,.4,.1),dk,-.2,2.05,.95,mc);P(new Q.SphereGeometry(.09,12,12),M(0x5EE0B5,{emissive:0x5EE0B5,emissiveIntensity:1}),-.45,2.05,1.02,mc);P(new Q.BoxGeometry(.1,.95,.85),dk,1.0,1.35,0,mc);
P(new Q.BoxGeometry(9.2,.3,1.4),dk,.4,1,0,G);
const bc=document.createElement('canvas');bc.width=64;bc.height=16;const bx=bc.getContext('2d');bx.fillStyle='#5b574a';bx.fillRect(0,0,64,16);bx.fillStyle='#b3ad98';bx.fillRect(0,0,32,16);
const bt=new Q.CanvasTexture(bc);bt.wrapS=bt.wrapT=Q.RepeatWrapping;bt.encoding=Q.sRGBEncoding;bt.repeat.set(22,1);
const tp=new Q.Mesh(new Q.PlaneGeometry(9.2,1.2),new Q.MeshStandardMaterial({map:bt,roughness:.9}));tp.rotation.x=-Math.PI/2;tp.position.set(.4,1.151,0);tp.receiveShadow=true;G.add(tp);
[-3.6,.4,4.4].forEach(x=>[-.5,.5].forEach(z=>P(new Q.BoxGeometry(.16,1,.16),dk,x,.5,z,G)));
[-.68,.68].forEach(z=>P(new Q.BoxGeometry(9.2,.14,.1),dk,.4,1.22,z,G));
[-.95,.95].forEach(z=>P(RB(.55,3.2,.6,.14),st,0,1.6,z,G));P(RB(.6,.55,2.6,.14),st,0,3.2,0,G);
const lm=M(0xFFE45C,{emissive:0xFFE45C,emissiveIntensity:.2});P(new Q.SphereGeometry(.17,16,16),lm,0,3.65,0,G);
const N=6,GAP=1.5,SP=N*GAP,V=1.1,X0=-4,bl=[];
for(let i=0;i<N;i++){const m=M(0xb9b29d,{roughness:.8});bl.push({o:P(RB(.8,.8,.8,.16),m,0,1.55,0,G),m,i,px:9,done:false})}
const K=kitty(S);K.g.position.set(3.1,0,-1.4);K.g.scale.setScalar(1.5);G.add(K.g);
let hop=-9,glow=-9,px=0;cv.addEventListener('pointermove',e=>{px=(e.offsetX/cv.clientWidth-.5)*2});
const f=t=>{bt.offset.x=-t*V*22/9.2;let near=9,nx=1;
bl.forEach(b=>{const x=X0+((t*V+b.i*GAP)%SP);if(x<b.px){b.done=false;b.m.map=null;b.m.color.set(0xb9b29d);b.m.needsUpdate=true}
if(!b.done&&x>=0){b.done=true;b.m.map=elTx(1+Math.random()*118|0);b.m.color.set(0xffffff);b.m.needsUpdate=true;hop=glow=t}
b.px=x;const sc=Math.max(.01,Math.min(1,(x-X0)/.8))*(x>=0?1+.28*Math.exp(-x*5):1);
b.o.position.set(x,1.15+.4*sc,0);b.o.scale.setScalar(sc);b.o.rotation.y=Math.sin(t*2+b.i)*.05;if(Math.abs(x-1)<near){near=Math.abs(x-1);nx=x}});
const q=t-hop;K.g.position.y=q<.6?Math.abs(Math.sin(q*Math.PI/.6))*.4*(1-q/.6):0;
K.h.rotation.y+=(Math.max(-.6,Math.min(.6,(nx-3.1)*.16))-K.h.rotation.y)*.1;K.tl.rotation.y=Math.sin(t*2.2)*.35;K.tl.rotation.x=Math.sin(t*1.7)*.1;
lm.emissiveIntensity=.2+Math.max(0,1-(t-glow)*1.6)*1.6;G.rotation.y=-.28+px*.1;r.render(s,c)};
return{cv,r,f}}
;

/* diorama del laboratorio (izquierda) */
function dioBuild(cv,bub){const S=sc3(cv,36,[8.2,5.4,9.6],[0,.4,0]),{Q,r,s,c,M,P,L,RB}=S,I=new Q.Group();s.add(I);
s.add(new Q.HemisphereLight(0x7f95d8,0x10142a,.5));
const mo=new Q.DirectionalLight(0xaec4ff,1.2);mo.position.set(-6,9,5);mo.castShadow=true;mo.shadow.mapSize.set(1024,1024);Object.assign(mo.shadow.camera,{left:-7,right:7,top:7,bottom:-7});s.add(mo);
const wl=new Q.PointLight(0xffc27a,1.2,7);wl.position.set(-1.9,2.2,.8);I.add(wl);
const cvT=(w,h,fn)=>{const k=document.createElement('canvas');k.width=w;k.height=h;fn(k.getContext('2d'),w,h);const t=new Q.CanvasTexture(k);t.encoding=Q.sRGBEncoding;t.wrapS=t.wrapT=Q.RepeatWrapping;t.anisotropy=4;return t},rn=Math.random;
/* tierra: estratos que oscurecen hacia abajo, granos, piedritas con sombra y raíces */
const SOT=cvT(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#6b4a35');g.addColorStop(.45,'#4d3326');g.addColorStop(1,'#241510');x.fillStyle=g;x.fillRect(0,0,w,h);
for(let i=0;i<5200;i++){x.globalAlpha=.08+rn()*.3;x.fillStyle=['#8a6446','#2a1b14','#5e4230','#a07a56'][rn()*4|0];const z=1+rn()*3;x.fillRect(rn()*w,rn()*h,z,z*(.6+rn()))}x.globalAlpha=1;
for(let i=0;i<70;i++){const px=rn()*w,py=rn()*h,rx=2+rn()*6,a=rn()*3;x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(px+1,py+1.5,rx*.95,rx*.62,a,0,6.283);x.fill();x.fillStyle=`hsl(${25+rn()*20},${8+rn()*10}%,${35+rn()*25}%)`;x.beginPath();x.ellipse(px,py,rx,rx*.7,a,0,6.283);x.fill()}
x.strokeStyle='rgba(190,160,120,.5)';x.lineWidth=1.5;for(let i=0;i<10;i++){let px=rn()*w,py=0;x.beginPath();x.moveTo(px,py);for(let k=0;k<6;k++){px+=(rn()-.5)*30;py+=h/7*(.6+rn()*.6);x.lineTo(px,py)}x.stroke()}}),
so=M(0xffffff,{map:SOT,bumpMap:SOT,bumpScale:.9,roughness:1});
/* césped: manchas y miles de hojitas */
const GTT=cvT(256,256,(x,w,h)=>{x.fillStyle='#2f6b2c';x.fillRect(0,0,w,h);
for(let i=0;i<46;i++){x.globalAlpha=.3;x.fillStyle=rn()<.5?'#3d8a34':'#25581f';x.beginPath();x.ellipse(rn()*w,rn()*h,10+rn()*26,8+rn()*18,rn()*3,0,6.283);x.fill()}x.globalAlpha=.65;x.lineWidth=1;
for(let i=0;i<4800;i++){const px=rn()*w,py=rn()*h,a=-1.57+(rn()-.5)*1.2,l=4+rn()*7;x.strokeStyle=`hsl(${85+rn()*45},${50+rn()*20}%,${18+rn()*28}%)`;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}x.globalAlpha=1}),
GET=cvT(256,64,(x,w,h)=>{x.fillStyle='#5a3d2c';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.globalAlpha=.3;x.fillStyle=['#7a5a40','#2a1b14'][rn()*2|0];x.fillRect(rn()*w,rn()*h,2,2)}x.globalAlpha=1;
x.fillStyle='#2f7a2c';x.beginPath();x.moveTo(0,0);x.lineTo(w,0);for(let px=w;px>=0;px-=4)x.lineTo(px,16+rn()*22);x.closePath();x.fill();
x.globalAlpha=.5;for(let i=0;i<220;i++){x.strokeStyle=`hsl(${90+rn()*40},60%,${22+rn()*26}%)`;const px=rn()*w;x.beginPath();x.moveTo(px,rn()*14);x.lineTo(px+(rn()-.5)*3,22+rn()*14);x.stroke()}x.globalAlpha=1});
GTT.repeat.set(3,3);GET.repeat.set(4,1);
const gsT=M(0xffffff,{map:GTT,bumpMap:GTT,bumpScale:.6,roughness:.92}),gsE=M(0xffffff,{map:GET,bumpMap:GET,bumpScale:.4,roughness:.95}),gs=[gsE,gsE,gsT,gsE,gsE,gsE],gm=M(0xdfeeff,{transparent:true,opacity:.3,roughness:.1,side:Q.DoubleSide,depthWrite:false});
P(new Q.BoxGeometry(4.4,2.3,4.8),so,-1.8,-1.05,0,I);P(new Q.BoxGeometry(4.4,.18,4.8),gs,-1.8,.19,0,I);P(new Q.BoxGeometry(3,1.3,4.8),so,1.9,-1.55,0,I);
/* estanque: fondo de arena, destellos de luz (cáusticas), agua con degradado de profundidad y superficie con olitas */
const bed=new Q.Mesh(new Q.PlaneGeometry(2.9,4.7),M(0xffffff,{map:nz('#b5a174','#5d4e30',4),roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.set(1.9,-.895,0);bed.receiveShadow=true;I.add(bed);
const cs=cvT(128,128,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.globalCompositeOperation='lighter';x.lineWidth=1.6;
for(let i=0;i<46;i++){const px=rn()*w,py=rn()*h,r=6+rn()*16,a0=rn()*6,a1=a0+1.5+rn()*2.5;x.strokeStyle=`rgba(170,235,255,${.25+rn()*.3})`;for(const o of[[0,0],[w,0],[-w,0],[0,h],[0,-h]]){x.beginPath();x.arc(px+o[0],py+o[1],r,a0,a1);x.stroke()}}});
cs.repeat.set(3,5);
const cau=new Q.Mesh(new Q.PlaneGeometry(2.9,4.7),new Q.MeshBasicMaterial({map:cs,transparent:true,opacity:.7,blending:Q.AdditiveBlending,depthWrite:false}));cau.rotation.x=-Math.PI/2;cau.position.set(1.9,-.885,0);I.add(cau);
const WGT=cvT(8,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#8fdcff');g.addColorStop(.5,'#2f8fd0');g.addColorStop(1,'#0a3f7a');x.fillStyle=g;x.fillRect(0,0,w,h)});
P(new Q.BoxGeometry(3,.85,4.8),M(0xffffff,{map:WGT,transparent:true,opacity:.62,roughness:.15,depthWrite:false}),1.9,-.475,0,I).castShadow=false;
[[.3,-1.9,.11],[.22,-1.3,.08],[.34,-.6,.13],[.26,.1,.09],[.32,.8,.12],[.2,1.4,.08],[.3,1.95,.1],[.24,-2.2,.07]].forEach(a=>{const o=P(new Q.DodecahedronGeometry(a[2],0),M(new Q.Color().setHSL(.6,.05,.3+rn()*.2),{roughness:.9}),a[0],.28+a[2]*.4,a[1],I);o.rotation.set(rn()*3,rn()*3,rn()*3);o.scale.y=.7});
const wv=new Q.Mesh(new Q.PlaneGeometry(3,4.8,36,60),M(0x9fdcff,{transparent:true,opacity:.5,roughness:.04,metalness:.2,depthWrite:false}));wv.rotation.x=-Math.PI/2;wv.position.set(1.9,-.04,0);I.add(wv);
[[-3.5,1.7,.22],[-.6,-1.9,.16]].forEach(a=>P(new Q.DodecahedronGeometry(a[2]),M(0x55586d),a[0],.28+a[2]*.6,a[1],I));
[[-1.0,-1.7,-.2,'H'],[.3,-1.8,-.24,'O']].forEach(a=>{const T2=stn('#5d6580',1,a[3]);const o=P(new Q.BoxGeometry(1.25,2.7,.42),M(0xffffff,{map:T2,bumpMap:T2,bumpScale:.5,roughness:.95}),a[0],1.58,a[1],I);o.rotation.z=a[2]});
const wd=M(0x9a6a42);P(new Q.BoxGeometry(1.9,.12,.9),wd,-2.3,1.12,-.6,I);[[-1.3,-.2],[-.7,.2]].forEach(a=>0);
[-1,1].forEach(a=>[-1,1].forEach(b=>P(new Q.BoxGeometry(.1,.84,.1),wd,-2.3+a*.8,.7,-.6+b*.35,I)));
const fp=[[0,0],[.34,0],[.38,.06],[.14,.62],[.14,.88],[.19,.92]],fl=L(fp,gm);fl.position.set(-2.7,1.18,-.6);fl.castShadow=false;I.add(fl);
const lq=M(0xA99CFF,{emissive:0x6b5cff,emissiveIntensity:.5}),lf=L([[0,.01],[.32,.01],[.36,.07],[.22,.34],[0,.34]],lq);lf.position.copy(fl.position);I.add(lf);
const bk=L([[0,0],[.28,0],[.28,.6],[.3,.64]],gm);bk.position.set(-1.9,1.18,-.5);I.add(bk);const lb=L([[0,.01],[.26,.01],[.26,.3],[0,.3]],M(0xff7da0,{emissive:0xff3d7f,emissiveIntensity:.4}));lb.position.copy(bk.position);I.add(lb);
const bb=[0,1,2,3,4].map(i=>P(new Q.SphereGeometry(.05,8,8),M(0xffffff,{transparent:true,opacity:.7}),0,0,0,I));
/* flores */
[[-3.4,.7,0xffe45c],[-3.0,1.1,0xff5c7a],[-.2,1.9,0xffe45c]].forEach(a=>{P(new Q.CylinderGeometry(.02,.02,.4,6),M(0x2a6b3a),a[0],.48,a[1],I);P(new Q.SphereGeometry(.09,10,8),M(a[2],{emissive:a[2],emissiveIntensity:.3}),a[0],.7,a[1],I)});
/* pasto 3D */
/* pasto en macollas: hojas largas, finas y curvas que salen en abanico, de verde oscuro en la base a amarillo seco en la punta */
const BH=.62,bgp=[],bgc=[],bgi=[];{const SG=6;for(let k=0;k<=SG;k++){const u=k/SG,w=.02*Math.pow(1-u,.7)+.0015,y=BH*u,z=.3*BH*u*u,c0=[.34,.4,.22],c1=[1,1,.7];
for(const sx of[-1,1]){bgp.push(sx*w,y,z);const q=Math.pow(u,1.3);bgc.push(c0[0]+(c1[0]-c0[0])*q,c0[1]+(c1[1]-c0[1])*q,c0[2]+(c1[2]-c0[2])*q)}}
for(let k=0;k<SG;k++){const a=k*2;bgi.push(a,a+1,a+2,a+1,a+3,a+2)}}
const bg=new Q.BufferGeometry();bg.setAttribute('position',new Q.Float32BufferAttribute(bgp,3));bg.setAttribute('color',new Q.Float32BufferAttribute(bgc,3));bg.setIndex(bgi);bg.computeVertexNormals();
const gm2=M(0xffffff,{roughness:.8,vertexColors:true,side:Q.DoubleSide});
/* el viento mece las hojas; se mueve más la punta */
gm2.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};gm2.userData.sh=sh;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hk=clamp(position.y/.62,0.,1.);float ph=instanceMatrix[3].x*2.3+instanceMatrix[3].z*1.7;transformed.x+=sin(uT*1.5+ph)*.09*hk*hk;transformed.z+=cos(uT*1.2+ph*1.3)*.06*hk*hk;')};
const NT=95,NB=NT*17,gb=new Q.InstancedMesh(bg,gm2,NB),dm=new Q.Object3D(),gc=new Q.Color();dm.rotation.order='YXZ';let nb=0;
for(let t0=0;t0<NT;t0++){let cx,cz;do{cx=-3.7+rn()*3.85;cz=-2.15+rn()*4.3}while(Math.abs(cx+2.3)<1.3&&Math.abs(cz+.6)<.9);const sz=.6+rn()*.5,dry=rn()<.18;
for(let b=0;b<17;b++){const ph=rn()*6.283,r0=Math.sqrt(rn())*.1*sz;dm.position.set(cx+Math.cos(ph)*r0,.28,cz+Math.sin(ph)*r0);
dm.rotation.set(.08+rn()*.55,Math.PI/2-ph+(rn()-.5)*.7,0);const tall=rn()<.08?1.5:1,h=(.45+rn()*.55)*sz*tall;dm.scale.set(.8+rn()*.7,h,.8+rn()*.7);dm.updateMatrix();gb.setMatrixAt(nb,dm.matrix);
if(dry||rn()<.08)gc.setHSL(.12+rn()*.05,.5,.36+rn()*.1);else gc.setHSL(.22+rn()*.1,.55+rn()*.15,.27+rn()*.14);gb.setColorAt(nb++,gc)}}
gb.receiveShadow=true;I.add(gb);
/* muñequito: cabeza de piedra, traje negro, bufanda roja */
const C=new Q.Group();C.position.set(-3.2,.28,-1.6);C.rotation.y=.7;C.scale.setScalar(1.3);I.add(C); /* detrás a la izquierda de la mesa: ya no tapa los matraces y mira hacia la cámara */
/* muñequito con materiales más reales: piedra con vetas y grietas, tela tejida, bufanda de punto, cuero brillante y metal que refleja */
let ENV=null;try{const et=cvT(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b0c24');g.addColorStop(.45,'#2b3a8a');g.addColorStop(.55,'#5b6cc0');g.addColorStop(1,'#14163A');x.fillStyle=g;x.fillRect(0,0,w,h);
for(let i=0;i<120;i++){x.globalAlpha=.4+rn()*.6;x.fillStyle='#fff';x.fillRect(rn()*w,rn()*h*.5,1.5,1.5)}x.globalAlpha=1;
const sp=(px,py,r,c)=>{const g2=x.createRadialGradient(px,py,0,px,py,r);g2.addColorStop(0,c);g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(px-r,py-r,2*r,2*r)};
sp(w*.3,h*.25,34,'#fffbe0');sp(w*.55,h*.52,46,'rgba(255,194,122,.9)');x.fillStyle='#cfe0ff';x.fillRect(w*.72,h*.34,70,26);x.fillStyle='#9fb8ff';x.fillRect(w*.08,h*.4,46,18)});
et.mapping=Q.EquirectangularReflectionMapping;const pm=new Q.PMREMGenerator(r);ENV=pm.fromEquirectangular(et).texture;pm.dispose();et.dispose()}catch(e){ENV=null}
const stT=cvT(512,512,(x,w,h)=>{x.fillStyle='#8a8273';x.fillRect(0,0,w,h);
for(let i=0;i<60;i++){x.globalAlpha=.22;x.fillStyle=['#9c9484','#766f61','#8f877a','#6d675b'][rn()*4|0];x.beginPath();x.ellipse(rn()*w,rn()*h,20+rn()*60,16+rn()*44,rn()*3,0,6.283);x.fill()}
x.globalAlpha=1;for(let i=0;i<14000;i++){x.globalAlpha=.1+rn()*.35;x.fillStyle=rn()<.5?'#3e3a32':'#b8b09f';const z=.8+rn()*2.4;x.fillRect(rn()*w,rn()*h,z,z)}
x.lineCap='round';for(let i=0;i<9;i++){let px=rn()*w,py=rn()*h,a=rn()*6.28;x.beginPath();x.moveTo(px,py);for(let k=0;k<14;k++){a+=(rn()-.5)*.9;px+=Math.cos(a)*14;py+=Math.sin(a)*14;x.lineTo(px,py)}x.globalAlpha=.35;x.lineWidth=2.5;x.strokeStyle='#cfc8b6';x.stroke();x.globalAlpha=.55;x.lineWidth=1;x.strokeStyle='#2d2a24';x.stroke()}
for(let i=0;i<5;i++){let px=rn()*w,py=rn()*h,a=rn()*6.28;x.beginPath();x.moveTo(px,py);for(let k=0;k<10;k++){a+=(rn()-.5)*1.1;px+=Math.cos(a)*9;py+=Math.sin(a)*9;x.lineTo(px,py)}x.globalAlpha=.7;x.lineWidth=1.4;x.strokeStyle='#1d1b17';x.stroke()}
for(let i=0;i<110;i++){const px=rn()*w,py=rn()*h,r2=1.5+rn()*4;x.globalAlpha=.55;x.fillStyle='#2a2721';x.beginPath();x.ellipse(px,py,r2,r2*.8,0,0,6.283);x.fill();x.globalAlpha=.35;x.fillStyle='#d7d0be';x.beginPath();x.ellipse(px-.8,py-1,r2*.7,r2*.5,0,0,6.283);x.fill()}
for(let i=0;i<14;i++){const px=rn()*w,py=rn()*h;for(let k=0;k<26;k++){x.globalAlpha=.3;x.fillStyle='#7d8a6a';x.beginPath();x.arc(px+(rn()-.5)*26,py+(rn()-.5)*26,1+rn()*2.2,0,6.283);x.fill()}}x.globalAlpha=1}),
fabT=cvT(128,128,(x,w,h)=>{x.fillStyle='#232a78';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){x.fillStyle='rgba(255,255,255,.08)';x.fillRect(0,i,w,1);x.fillStyle='rgba(0,0,10,.28)';x.fillRect(i,0,1,h)}
for(let i=0;i<500;i++){x.fillStyle=`rgba(${rn()<.5?'255,255,255':'0,0,0'},${rn()*.08})`;x.fillRect(rn()*w,rn()*h,1,1)}}),
knT=cvT(128,128,(x,w,h)=>{x.fillStyle='#b81e15';x.fillRect(0,0,w,h);for(let r0=0;r0<h;r0+=8)for(let c0=0;c0<w;c0+=8){x.lineWidth=2.4;x.lineCap='round';x.strokeStyle='#e2483a';x.beginPath();x.moveTo(c0+1,r0+1);x.lineTo(c0+4,r0+7);x.stroke();x.strokeStyle='#7e120c';x.beginPath();x.moveTo(c0+7,r0+1);x.lineTo(c0+4,r0+7);x.stroke()}});
fabT.repeat.set(5,5);knT.repeat.set(20,3);const knT2=knT.clone();knT2.needsUpdate=true;knT2.repeat.set(2,6);
const sn1=M(0xffffff,{map:stT,bumpMap:stT,bumpScale:1.4,roughness:.92}),fb=M(0xffffff,{map:fabT,bumpMap:fabT,bumpScale:.7,roughness:.93}),rd=M(0xffffff,{map:knT,bumpMap:knT,bumpScale:1.6,roughness:1}),rdT=M(0xffffff,{map:knT2,bumpMap:knT2,bumpScale:1.6,roughness:1}),
mt=M(0xc9d1e0,{metalness:1,roughness:.22,envMap:ENV,envMapIntensity:1.1}),gg=new Q.MeshPhysicalMaterial({color:0xbfe6ff,transparent:true,opacity:.35,roughness:.03,clearcoat:1,clearcoatRoughness:.05,envMap:ENV,envMapIntensity:1.3,depthWrite:false}),
wy=new Q.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.25,roughness:.12,clearcoat:1,clearcoatRoughness:.08,envMap:ENV}),
gv=new Q.MeshPhysicalMaterial({color:0x4fb6ff,roughness:.38,clearcoat:.6,clearcoatRoughness:.3,envMap:ENV,envMapIntensity:.8}),
sh2=new Q.MeshPhysicalMaterial({color:0x1a1f5c,roughness:.4,clearcoat:.7,clearcoatRoughness:.25,envMap:ENV,envMapIntensity:.9});
[-.1,.1].forEach(x=>{P(new Q.CylinderGeometry(.032,.032,.95,16),fb,x,.5,0,C);P(RB(.16,.08,.3,.03),sh2,x,.04,.06,C)});
P(RB(.52,.62,.36,.12),fb,0,1.2,0,C);
P(new Q.TorusGeometry(.25,.065,16,48),rd,0,1.55,0,C).rotation.x=Math.PI/2;P(RB(.13,.55,.05,.02),rdT,.14,1.28,.2,C).rotation.z=.12;
const H=new Q.Group();H.position.y=2.12;C.add(H);
P(new Q.BoxGeometry(.98,.98,.98),sn1,0,0,0,H);
[-1,1].forEach(k=>{P(new Q.SphereGeometry(.1,14,12),wy,k*.2,0,.5,H).scale.set(.9,1.25,.35);P(new Q.SphereGeometry(.035,12,10),sh2,k*.2,-.02,.53,H);
P(new Q.TorusGeometry(.13,.03,8,18),mt,k*.2,.32,.5,H);P(new Q.CircleGeometry(.11,16),gg,k*.2,.32,.505,H)});
P(new Q.BoxGeometry(1.02,.06,1.02),fb,0,.32,0,H);
const arm=k=>{const a=new Q.Group();a.position.set(k*.32,1.42,0);C.add(a);P(new Q.CylinderGeometry(.045,.04,.55,16),fb,0,-.28,0,a);P(new Q.SphereGeometry(.07,10,8),gv,0,-.58,0,a);return a},aL=arm(1),aR=arm(-1);
const sq=M(0xA99CFF,{emissive:0x6b5cff,emissiveIntensity:.8}),mf=L(fp,gm),ml=L([[0,.01],[.32,.01],[.36,.07],[.22,.34],[0,.34]],sq);[mf,ml].forEach(o=>{o.scale.setScalar(.4);o.position.set(0,-.78,.06);o.rotation.x=1.2;aR.add(o)});
const RX=[[['Ácido + base → sal + agua 💧','Acid + base → salt + water 💧'],0x5EE0B5,0x12a373],[['¡Reacción con cambio de color! 🌈','Color-change reaction! 🌈'],0xff5c7a,0xc01a3c],[['Bicarbonato + vinagre → CO₂ 🫧','Baking soda + vinegar → CO₂ 🫧'],0xffe45c,0xd4a800],[['El indicador cambió de pH 🔬','The indicator changed pH 🔬'],0xA99CFF,0x6b5cff]];
const pt=Array.from({length:26},()=>{const m=P(new Q.SphereGeometry(.1,10,8),M(0xffffff,{transparent:true,opacity:0,emissive:0xffffff,emissiveIntensity:.5}),0,0,0,I);m.castShadow=false;m.userData.v=[(Math.random()-.5)*1.7,1.8+Math.random()*1.7,(Math.random()-.5)*1.3];return m});
const COL=[[0xA99CFF,0x6b5cff],[0x5EE0B5,0x12a373],[0xff5c7a,0xc01a3c],[0xffe45c,0xd4a800]],MSG=[['¡Eureka! 🧪','Eureka! 🧪'],['H₂O: 2 hidrógenos + 1 oxígeno','H₂O: 2 hydrogens + 1 oxygen'],['¡Mira cómo burbujea!','Look at it bubble!'],['El pH 7 es neutro','pH 7 is neutral'],['¿Y si lo mezclamos?','What if we mix it?']];
/* peces y luciérnagas */
/* peces con cuerpo degradado, aletas, ojos y cola que se mueve */
const mkFish=(col,belly)=>{const g=new Q.Group(),bgm=new Q.SphereGeometry(.2,20,14),pa=bgm.attributes.position,cl=new Float32Array(pa.count*3),c1=new Q.Color(col),c2=new Q.Color(belly),cc=new Q.Color();
for(let i=0;i<pa.count;i++){const k=Math.max(0,Math.min(1,(pa.getY(i)/.2+1)/2));cc.copy(c2).lerp(c1,Math.pow(k,.6));cl[i*3]=cc.r;cl[i*3+1]=cc.g;cl[i*3+2]=cc.b}
bgm.setAttribute('color',new Q.BufferAttribute(cl,3));
P(bgm,M(0xffffff,{vertexColors:true,roughness:.3,metalness:.25,emissive:col,emissiveIntensity:.08}),0,0,0,g).scale.set(1.9,.82,.5);
const fm=M(col,{side:Q.DoubleSide,roughness:.5,transparent:true,opacity:.9}),fin=(sh,x,y,z)=>{const o=new Q.Mesh(new Q.ShapeGeometry(sh),fm);o.position.set(x,y,z);o.castShadow=false;return o};
const tp=new Q.Group();tp.position.x=-.36;g.add(tp);
const ts=new Q.Shape();ts.moveTo(0,0);ts.lineTo(-.26,.2);ts.quadraticCurveTo(-.17,0,-.26,-.2);ts.lineTo(0,0);tp.add(fin(ts,0,0,0));
const ds=new Q.Shape();ds.moveTo(-.16,0);ds.quadraticCurveTo(-.02,.26,.18,0);ds.lineTo(-.16,0);g.add(fin(ds,-.02,.13,0));
const ps=new Q.Shape();ps.moveTo(0,0);ps.lineTo(-.14,-.05);ps.lineTo(-.04,-.12);ps.lineTo(0,0);[-1,1].forEach(k=>{const o=fin(ps,.1,-.07,k*.07);o.rotation.x=k*.9;g.add(o)});
[-1,1].forEach(k=>{P(new Q.SphereGeometry(.04,10,8),M(0xffffff,{roughness:.2}),.27,.05,k*.07,g).castShadow=false;P(new Q.SphereGeometry(.022,8,8),M(0x0d0d12,{roughness:.2}),.303,.05,k*.075,g).castShadow=false});
g.userData.tail=tp;return g};
const fs=[[0xff8a2a,0xffe3c0],[0x4fc3e8,0xe8fbff],[0xff8fb8,0xfff0f6],[0xf2c230,0xfff4c4]].map(a=>{const g=mkFish(a[0],a[1]);g.scale.setScalar(.85);I.add(g);return g});
const fa=new Float32Array(48);for(let i=0;i<16;i++){fa[i*3]=Math.random()*8-4;fa[i*3+1]=.6+Math.random()*3;fa[i*3+2]=Math.random()*6-3}
const fg=new Q.BufferGeometry();fg.setAttribute('position',new Q.BufferAttribute(fa,3));const ff=new Q.Points(fg,new Q.PointsMaterial({color:0xffe45c,size:.14,transparent:true,blending:Q.AdditiveBlending,depthWrite:false}));I.add(ff);
const adj=()=>{const a=cv.clientWidth/cv.clientHeight;c.fov=2*Math.atan(Math.max(.36/a,.28))*180/Math.PI;c.updateProjectionMatrix()};new ResizeObserver(()=>requestAnimationFrame(adj)).observe(cv);adj();
/* interacción: arrastrar gira la isla, tocar al muñequito lo hace saltar */
const rc=new Q.Raycaster();let hop=-9,dr=0,dn=false,sx=0,mv=0,pxv=0,ci=0,tt=0;
cv.addEventListener('pointerdown',e=>{dn=true;sx=e.clientX;mv=0;cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{pxv=(e.offsetX/cv.clientWidth-.5)*2;if(dn){const d=e.clientX-sx;sx=e.clientX;mv+=Math.abs(d);dr=Math.max(-1,Math.min(1,dr+d*.008))}});
cv.addEventListener('pointerup',e=>{dn=false;if(mv>5)return;const b=cv.getBoundingClientRect();rc.setFromCamera(new Q.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),c);
if(rc.intersectObject(C,true).length)exp()});
let fo=-9,pc=0xffffff,bt2=0;const hb=bub&&bub.textContent;
function exp(){ci=(ci+1)%RX.length;const x=RX[ci];hop=tt;fo=tt;pc=x[1];[sq,lq].forEach(m=>{m.color.set(x[1]);m.emissive.set(x[2])});lb.material.color.set(x[1]);lb.material.emissive.set(x[2]);if(bub){bub.textContent=T(x[0][0],x[0][1]);clearTimeout(bt2);bt2=setTimeout(()=>{bub.textContent=hb},3800)}try{sfx('ok');buzz(12)}catch(e){}}
if(bub)bub.onclick=exp;
const f=t=>{tt=t;I.rotation.y=Math.sin(t*.25)*.18+dr;if(!dn)dr*=.97;
const u=t-fo;wl.intensity=1.2+(u>=0&&u<.5?(1-u*2)*3:0);pt.forEach(m=>{if(u>=0&&u<1.6){const v=m.userData.v;m.position.set(-1.9+v[0]*u,1.85+v[1]*u-2.2*u*u,-.5+v[2]*u);m.material.opacity=.9*(1-u/1.6);m.material.color.set(pc);m.material.emissive.set(pc)}else m.material.opacity=0});
const q=t-hop;C.position.y=.28+(q<.6?Math.abs(Math.sin(q*Math.PI/.6))*.5*(1-q/.6):0);C.scale.y=1.3*(1+.015*Math.sin(t*2));
H.rotation.y+=(pxv*.5-H.rotation.y)*.08;aL.rotation.z=2.4+Math.sin(t*5)*.3;aR.rotation.x=-1.2;
bb.forEach((b,i)=>{const u=(t*.5+i*.2)%1;b.position.set(-2.7+Math.sin(t*3+i)*.08,1.18+.9+u*1,-.6);b.scale.setScalar(1-u*.6);b.material.opacity=.7*(1-u)});
const p=wv.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*2.3+t*1.4)*.02+Math.cos(p.getY(i)*2.1+t*1.1)*.018+Math.sin((p.getX(i)+p.getY(i))*5+t*2.6)*.006);p.needsUpdate=true;wv.geometry.computeVertexNormals();cs.offset.set(t*.03,t*.02);if(gm2.userData.sh)gm2.userData.sh.uniforms.uT.value=t;
fs.forEach((g,i)=>{const a=t*(.5+i*.12)+i*1.7,dx=-.85*Math.sin(a),dz=1.8*Math.cos(a);g.position.set(2.1+.85*Math.cos(a),-.5+.12*Math.sin(a*2+i),1.8*Math.sin(a));g.rotation.y=Math.atan2(-dz,dx);g.userData.tail.rotation.y=Math.sin(t*7+i*2)*.5});
for(let i=0;i<16;i++){fa[i*3+1]+=Math.sin(t*1.3+i)*.004;fa[i*3]+=Math.cos(t*.9+i*2)*.004}fg.attributes.position.needsUpdate=true;r.render(s,c)};
return{cv,r,f}}
;

const cv3Fb=()=>{const w=document.querySelector('.spl .cv3');if(w){w.outerHTML=cvHtml();cvInit()}};
;

const cv3Html=()=>`<div class="cv3" role="img" aria-label="${T('Un gatito de laboratorio vigila una cinta transportadora 3D que convierte bloques en elementos de la tabla periódica','A lab kitten watches a 3D conveyor belt that turns blocks into periodic table elements')}"><canvas></canvas></div>`;
;

const dioHtml=()=>{const d=new Date(),hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');return `<aside class="dio"><canvas aria-hidden="true"></canvas><span class="chip">🌙 ${hh} · ${T('Noche en la carpa','Night at the big top')}</span><button type="button" class="dbub" id="dbub">🧪 ${T('Experimentar','Experiment')}</button></aside>`};
;

function cv3Init(){const A=document.querySelector('.spl .cv3 canvas'),B=document.querySelector('.spl .dio canvas');
loadTHREE().then(()=>{try{if(A)addJob(cvBuild(A));if(B&&B.clientWidth>0)addJob(dioBuild(B,document.getElementById('dbub')))}catch(e){cv3Fb()}}).catch(cv3Fb)}
;

/* ---------- PANTALLA DE BIENVENIDA ---------- */
/* estrellas del fondo: se juntan alrededor del mouse y lo siguen; sin mouse vuelven a su lugar */
function mkStars(root){const L=document.createElement('div');L.className='stars';L.setAttribute('aria-hidden','true');
const cv=document.createElement('canvas');cv.style.cssText='display:block;width:100%;height:100%';L.appendChild(cv);root.prepend(L);
const X=cv.getContext('2d'),cols=['#fff','#ffe9a8','#cfe0ff'];let W=0,H=0;
const fit=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;X.setTransform(d,0,0,d,0,0)};fit();
const sm=W<700,S=Array.from({length:sm?90:150},()=>{const hx=Math.random(),hy=Math.random();
return{hx,hy,x:hx*W,y:hy*H,r:.8+Math.random()*1.9,c:cols[Math.random()*3|0],ph:Math.random()*6.28,sp:.8+Math.random()*1.6,a:Math.random()*6.28,d:Math.sqrt(Math.random())*(sm?50:70)+6,w:(Math.random()<.5?-1:1)*(.4+Math.random()*.9),e:.012+Math.random()*.05,f:Math.random()<.25}});
let px=0,py=0,on=false,raf=0;
const mv=e=>{px=e.clientX;py=e.clientY;on=true},off=()=>{on=false},up=e=>{if(e.pointerType==='touch')off()},ml=()=>off();
const kill=()=>{cancelAnimationFrame(raf);removeEventListener('pointermove',mv);removeEventListener('pointerdown',mv);removeEventListener('pointerup',up);removeEventListener('blur',off);removeEventListener('resize',fit);document.removeEventListener('mouseleave',ml)};
const draw=t=>{X.clearRect(0,0,W,H);
for(const s of S){let tx=s.hx*W,ty=s.hy*H;if(on&&s.f){const a=s.a+t*s.w;tx=px+Math.cos(a)*s.d;ty=py+Math.sin(a)*s.d}
s.x+=(tx-s.x)*s.e;s.y+=(ty-s.y)*s.e;X.globalAlpha=RM?.8:.55+.45*Math.sin(t*s.sp+s.ph);X.fillStyle=s.c;X.beginPath();X.arc(s.x,s.y,s.r,0,6.283);X.fill()}
X.globalAlpha=1};
if(RM){draw(0);addEventListener('resize',()=>{fit();draw(0)});return}
addEventListener('pointermove',mv,{passive:true});addEventListener('pointerdown',mv,{passive:true});addEventListener('pointerup',up);addEventListener('blur',off);addEventListener('resize',fit);document.addEventListener('mouseleave',ml);
const loop=ms=>{if(!L.isConnected){kill();return}draw(ms/1000);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
;

function splash(){
$.innerHTML=`<div class="spl"><button class="tbtn spl-lang" type="button" onclick="splashLang()" aria-label="${_t('ariaLang')}"><b>${LANG.toUpperCase()}</b></button>
<section class="pg pg1"><div class="pgi">${dioHtml()}<div class="pgc">
<div class="catb" id="catb"></div>
<div class="catw"><div class="hero">${sti('gatoLupa','sa')}<button type="button" class="cat" id="cat" aria-label="${T('Gato de laboratorio: toca para preguntarle algo','Lab cat: tap to ask it something')}">${sti('gatoMatraz','sb')}</button>${sti('molecula','sc')}</div><div class="catd" id="catd" role="status" aria-live="polite" hidden></div></div>
<h1>Labstyle <mark>Arcade</mark></h1>
${slgHtml()}
<button class="go gg1 splbtn" id="splgo1" type="button">▶ ${T('¡A la pista!','To the ring!')}</button>
<p class="spd">${T('¿Química aburrida? Ya no. Balancea ecuaciones, caza elementos y mezcla cosas raras en el circo','Boring chemistry? Not anymore. Balance equations, hunt elements and mix wild stuff in the circus')}</p>
</div></div><button class="nx" type="button" onclick="document.querySelector('.spl .pg2').scrollIntoView({behavior:RM?'auto':'smooth'})">↓ ${T('Cómo funciona','How it works')}</button></section>
<section class="pg pg2"><div class="pgi"><h2 class="pg2t">${T('¡Entran bloques, salen elementos!','Blocks in, elements out!')}</h2>${cv3Html()}<p class="pg2d">${T('Mira esta máquina loca: cada bloque cruza el arco y sale convertido en un elemento distinto de la tabla periódica, mientras el gatito vigila que nada explote ¿Te animas a descubrirlos todos?','Check out this crazy machine: every block crosses the arch and comes out as a different periodic table element, while the kitty makes sure nothing explodes Think you can discover them all?')}</p>
<button class="go gg1 splbtn" id="splgo2" type="button">▶ ${T('¡A la pista!','To the ring!')}</button>
<p class="spf">${T('Hecho por','Made by')} <a href="https://www.instagram.com/nic.labstyle/" target="_blank" rel="noopener">@nic.labstyle</a></p></div></section><nav class="dots" aria-label="páginas"><button class="dt on" type="button" aria-label="1"></button><button class="dt" type="button" aria-label="2"></button></nav></div>`;
const go=document.getElementById('splgo2');
const gofn=()=>{sfx('ok');track('start',{});$.firstElementChild.classList.add('out');setTimeout(()=>{scrollTo({top:0,behavior:'instant'});home()},RM?0:260)};go.onclick=gofn;document.getElementById('splgo1').onclick=gofn;
const pgs=[...$.querySelectorAll('.spl .pg')],dts=[...$.querySelectorAll('.spl .dt')];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)dts.forEach((d,i)=>d.classList.toggle('on',pgs[i]===e.target))}),{threshold:.55});pgs.forEach(q=>io.observe(q));
dts.forEach((d,i)=>d.onclick=()=>pgs[i].scrollIntoView({behavior:RM?'auto':'smooth'}));
mkStars($.firstElementChild);catInit();cv3Init()}
;

function splashLang(){LANG=LANG==='es'?'en':'es';LS.set('lang',LANG);applyLang();splash()}
;

function toggleLang(){LANG=LANG==='es'?'en':'es';LS.set('lang',LANG);applyLang();home()}
;

function streakModal(){
const o=LS.get('days',{last:'',n:0,b:0}),cur=dayStreak(),diff=o.last?Math.round((Date.parse(dstr(0))-Date.parse(o.last))/864e5):99;
const cells=[-6,-5,-4,-3,-2,-1,0].map(off=>{const d=new Date();d.setDate(d.getDate()+off);const on=cur>0&&off<=-diff&&off>=-diff-(cur-1);
return `<div class="dy${on?' on':''}${off===0?' td':''}"><span>${on?FLM:'·'}</span><small>${d.toLocaleDateString(LANG,{weekday:'narrow'})}</small></div>`}).join('');
const msg=cur===0?_t('st0'):diff===0?_t('stDone'):_t('stRisk');
const m=document.createElement('div');m.className='modal';
m.innerHTML=`<div class="card"><h2>${_t('stT')}</h2><div class="sbig">${FLM} ${cur}</div><p class="q" style="margin:0 0 12px">${_t('stDays',cur)}</p><div class="week">${cells}</div><p class="rec">${_t('stBest',Math.max(o.b||0,cur))}</p><p class="sub" style="margin:0 0 6px">${msg}</p><button class="go alt" id="stx">${_t('close')}</button></div>`;
document.body.appendChild(m);const x=m.querySelector('#stx');x.focus();x.onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove()}}
;

function general(){
$.innerHTML=ICON('home()')+`<h2>${_t('gen')}</h2><div class="grid">
<button class="btn" style="background:var(--c1)" onclick="play('eq','general')"><span class="ico">⚖️</span><b>${_t('eqT')}</b><span>${_t('eqD')}</span></button>
<button class="btn" style="background:var(--c2)" onclick="play('nom','general')"><span class="ico">🏷️</span><b>${_t('nomT')}</b><span>${_t('nomD')}</span></button>${mbt('mol','general','var(--c3)','🧪',T('Constructor de moléculas','Molecule builder'),T('Forma fórmulas con los átomos correctos','Build formulas with the right atoms'))}${mbt('maze','general','var(--c1)','🧭',T('Laberinto del laboratorio','Lab maze'),T('Recoge los átomos y encuentra la salida','Collect the atoms and find the exit'))}${mbt('mem','general','var(--c3)','🃏',T('Parejas','Pairs'),T('Memoria: une fórmulas y nombres','Memory: match formulas and names'))}${mbt('gue','general','var(--c4)','🕵️',T('Adivina el elemento','Guess the element'),T('Menos pistas, más puntos','Fewer clues, more points'))}</div>`}
;

function tabla(){
$.innerHTML=ICON('home()')+`<h2>${_t('tab')}</h2><p class="sub">${_t('tabSub')}</p><div class="grid">
<button class="btn" style="background:var(--c2)" onclick="play('sym','tabla')"><span class="ico">🔤</span><b>${_t('symT')}</b><span>${_t('symD')}</span></button>
<button class="btn" style="background:var(--c3)" onclick="play('name','tabla')"><span class="ico">🔍</span><b>${_t('nameT')}</b><span>${_t('nameD')}</span></button>
<button class="btn" style="background:var(--c4)" onclick="play('dat','tabla')"><span class="ico">🧮</span><b>${_t('datT')}</b><span>${_t('datD')}</span></button>${mbt('dnd','tabla','var(--c1)','🧩',T('Tabla vacía','Empty table'),T('Arrastra cada elemento a su casilla','Drag each element to its tile'))}</div>`}
;

document.addEventListener('click',e=>{const b=e.target.closest('.b3d');if(b){const f=b.closest('.fig');if(f)open3D(f)}});
;

function walkTr(o,m){const f=(v,set)=>typeof v==='string'?(m[v]&&set(m[v])):walkTr(v,m);
if(Array.isArray(o))o.forEach((v,i)=>f(v,x=>o[i]=x));else if(o&&typeof o==='object')for(const k in o)f(o[k],x=>o[k]=x)}
;

const I18N={es:{
back:'← Volver',hi:'Holii',tag:'Bienvenido al circo digital. Elige tu acto.',ariaSt:'Ver mi racha',ariaLang:'Cambiar idioma',
gen:'Química general',genD:'Balancear ecuaciones y nomenclatura',tab:'Tabla periódica',tabD:'Símbolos y nombres de elementos',mit:'Mito o realidad',mitD:'Química de la vida diaria',org2:'Orgánica 2.0',org2D:'Aromáticos, carbonilos, aminas y ácidos',org1:'Orgánica 1.0',org1D:'Alcanos, haluros, alquenos, estereoquímica, alcoholes y éteres',org1Sub:'Nomenclatura y reacciones, basado en el volumen 1 de Wade.',od_alc:'Nombres, conformaciones y halogenación',od_hal:'SN1, SN2, E1 y E2',od_alq:'Adiciones, Markovnikov, ozonólisis, alquinos',od_est:'Quiralidad, R/S, enantiómeros y meso',od_alo:'Nombres, oxidación, tosilatos y haluros',od_ete:'Williamson, ruptura con HBr y epóxidos',
eqT:'Balancear ecuaciones',eqD:'Ajusta los coeficientes hasta que todo cuadre',nomT:'Nomenclatura',nomD:'Fórmula → nombre del compuesto',tabSub:'Cada intento trae elementos distintos.',
symT:'Nombre → casilla',symD:'Elige la casilla con el símbolo correcto',nameT:'Casilla → nombre',nameD:'Mira la casilla y di qué elemento es',datT:'Datos del elemento',datD:'Número atómico y familia',
org2Sub:'Nomenclatura y reacciones, basado en el volumen 2 de Wade.',od_aro:'Sustitución aromática y orientadores',od_cet:'Nombres, reducciones, iminas y acetales',od_ami:'Basicidad, acilación, Hofmann, diazonio',od_aci:'Acidez, ésteres, saponificación',
ti_eq:'Balancear',ti_nom:'Nomenclatura',ti_sym:'Nombre → casilla',ti_name:'Casilla → nombre',ti_mito:'Mito o realidad',ti_dat:'Datos del elemento',ti_dnd:'Tabla vacía',ti_mem:'Parejas',ti_gue:'Adivina el elemento',ti_sn:'Laboratorio SN / E',
lives:'VIDAS',streak:'RACHA',ariaLives:n=>`${n} vidas`,
qNom:n=>`¿Cómo se llama <b>${n}</b>?`,qSym:n=>`¿Qué símbolo tiene el <b>${n}</b>?`,qName:'¿Qué elemento es este?',qZ:n=>`¿Cuál es el número atómico del <b>${n}</b>?`,eZ:(n,s,z)=>`${n} (${s}) tiene Z = ${z}.`,qFam:'¿A qué familia pertenece este elemento?',myth:'Mito',fact:'Realidad',
ok:'¡Correcto! 👏',no:'Casi… se te cayó un malabar. Revisa la respuesta.',seeRes:'Ver resultado',next:'Siguiente acto',
bal:'Balancea la ecuación',shOkL:'aciertos',shBsL:'mejor racha',shDayL:n=>n===1?'día jugando':'días seguidos',v3d:'Ver en 3D',v3load:'Cargando visor 3D…',v3fail:'No se pudo cargar el visor 3D. Revisa tu conexión e inténtalo de nuevo.',v3mol:'Molécula',v3view:'Vista',v3bs:'Bolas y barras',v3st:'Barras',v3sp:'Esferas',v3h:'Hidrógenos',v3spin:'Girar',v3reset:'Vista inicial',v3hint:'Arrastra el modelo para girarlo (el giro automático se detiene al tocarlo) · pellizca o usa la rueda para acercar',v3area:'Modelo 3D: arrastra para girar, flechas del teclado para girar, + y - para acercar',v3ctl:'Controles del modelo',v3l:'Girar a la izquierda',v3r2:'Girar a la derecha',v3u:'Girar hacia arriba',v3d2:'Girar hacia abajo',v3zi:'Acercar',v3zo:'Alejar',eqDiff:(el,l,r)=>`${el}: ${l} a la izquierda, ${r} a la derecha`,eqMin:'Está balanceada, pero no con los enteros más pequeños.<br>',review:'Para repasar',h2s:' (como gas se llama sulfuro de hidrógeno; en agua, ácido sulfhídrico)',figS:'Estructuras químicas',figR:'Reacción química',smallest:'Usa los números enteros más pequeños.',chk:'Comprobar',eqAns:'Esta es la ecuación balanceada.',add:'Sumar',subt:'Restar',
l1:'Nivel Marie Curie 🥇',lE:'Nivel Einstein 🥈',lB:'Nivel Lavoisier 🥉',l2:'Buen número, sigue así',l3:'Otra función y se te pega',lose:'Se acabaron tus vidas 💀 cae el telón, pero así se aprende',newRec:'🏆 ¡Nuevo récord! ¡Ovación!',rec:b=>`Tu récord: ${b} pts`,share:'Compartir resultado',again:'Otra función',other:'Elegir otro acto',
newRecC:'¡Nuevo récord!',recC:b=>`Récord: ${b} pts`,beat:'¿Puedes superarme?',shareTxt:(n,s,t)=>`${n?n+' sacó':'Saqué'} ${s} pts en ${t} en el circo digital de Labstyle Arcade 🎪 ¿Me superas? @nic.labstyle`,saveImg:'Guarda la imagen (mantén presionada o clic derecho) y súbela a tus historias.',shT:'Comparte tu logro',rwTry:n=>`Llega al ${n} o más, etiqueta a @nic.labstyle en tu historia y te comparto en las mías`,rwGot:n=>`¡Lograste el ${n}! Súbelo a tu historia con la mención a @nic.labstyle y te comparto en las mías`,igT:'Para que la mención funcione',ig1:'Copia la mención:',igCopy:'Copiar @nic.labstyle',igCopied:'Copiado',igCopiedD:'Listo: @nic.labstyle está copiado.',igNoCopy:'No pude copiarlo; escríbelo a mano: @nic.labstyle',ig2s:'Comparte la imagen y elige Instagram → Historia:',ig2d:'Guarda la imagen y súbela a tu historia:',igShare:'Compartir imagen',ig3:'En la historia toca el sticker «@ Mención» (o «Aa»), pega y elige @nic.labstyle de la lista. El @ que trae la imagen no cuenta como etiqueta.',shImg:'Compartir imagen',shSave:'Guardar imagen',shApps:'O compártelo en:',shCopy:'Copiar texto',shMore:'Más apps…',shSaved:'Imagen guardada.',shBusy:'Ya hay una ventana abierta; termina esa primero.',shManual:'Mantén presionada la imagen para guardarla.',shIG:ok=>`Súbela a tus historias y etiqueta a @nic.labstyle${ok?' (el texto ya está copiado)':''}.`,shOpenIG:'Abrir Instagram',shCopied:'Texto copiado. Pégalo donde quieras.',shNoCopy:'No pude copiar. Mantén presionado el texto para copiarlo.',shNoSheet:'Este navegador no permite compartir directo; usa los botones de arriba.',imgAlt:'Tu resultado en Labstyle Arcade',
nameQ:'¿Cómo te llamas?',nameD:'Tu nombre saldrá en la imagen cuando compartas tu resultado.',namePh:'Tu nombre',save:'Guardar',cancel:'Cancelar',skip:'Omitir',changeName:'cambiar nombre',setName:'+ Poner mi nombre',
exitQ:'¿Abandonar la función?',exitD:s=>`Perderás tu progreso${s>=2?' y tu racha de '+s:''}.`,keep:'Seguir en pista',leave:'Salir',
suggLink:'Dejar una nota en el buzón del circo',sgSending:'Enviando…',sgOk:'¡Recibido! Gracias por ayudar a mejorar el show 💌',sgOkD:'Tu sugerencia llegó directo al buzón de @nic.labstyle.',sgWait:s=>`Espera ${s} s antes de enviar otra.`,sgInbox:'Sugerencias recibidas',sgNone:'Todavía no hay sugerencias.',anon:'Anónimo',suggT:'Sugerencias',suggSub:'Cuéntame qué mejorarías, qué tema quieres ver o si algo falló.',typeG:'Tipo de mensaje',c_idea:'💡 Idea',c_fallo:'🐞 Algo falló',c_tema:'📚 Quiero un tema',c2_idea:'Idea',c2_fallo:'Algo falló',c2_tema:'Quiero un tema',ph:'Escribe aquí tu sugerencia…',sugAria:'Tu sugerencia',send:'Enviar',empty:'Escribe algo primero 🙂',msg:(tp,n,t)=>`Sugerencia Labstyle Arcade (${tp})${n?' de '+n:''}: ${t}`,copied:'Copié tu mensaje.',copyIt:'Copia tu mensaje.',paste:'Pégalo en el chat y envíalo. ¡Gracias por ayudar a mejorar el juego! 💌',openIG:'Abrir Instagram',openForm:'Abrir formulario',
tDay:n=>`🔥 ${n} ${n>1?'días seguidos':'día'} jugando`,tRisk:n=>`🔥 Llevas ${n} ${n>1?'días':'día'}. ¡Juega hoy y no la pierdas!`,firstT:d=>d>1?`🔥 ¡${d} días seguidos jugando!`:'🔥 ¡Día 1! Empezó tu racha',
stT:'Tu racha',stDays:n=>n===1?'día seguido':'días seguidos',stBest:b=>`Mejor racha: ${b}`,st0:'Juega una partida hoy para empezar tu racha.',stDone:'¡Hoy ya actuaste! Vuelve mañana para la próxima función.',stRisk:'¡Juega hoy para no perder tu racha!',close:'Cerrar',soundOn:'Activar sonido y música',mute:'Silenciar sonido y música'},
en:{
back:'← Back',hi:'Hiii',tag:'Welcome to the digital circus. Pick your act.',ariaSt:'See my streak',ariaLang:'Change language',
gen:'General chemistry',genD:'Balancing equations and naming compounds',tab:'Periodic table',tabD:'Element symbols and names',mit:'Myth or fact',mitD:'Everyday chemistry',org2:'Organic 2.0',org2D:'Aromatics, carbonyls, amines and acids',org1:'Organic 1.0',org1D:'Alkanes, halides, alkenes, stereochemistry, alcohols and ethers',org1Sub:'Nomenclature and reactions, based on Wade volume 1.',od_alc:'Names, conformations and halogenation',od_hal:'SN1, SN2, E1 and E2',od_alq:'Additions, Markovnikov, ozonolysis, alkynes',od_est:'Chirality, R/S, enantiomers and meso',od_alo:'Names, oxidation, tosylates and halides',od_ete:'Williamson, HBr cleavage and epoxides',
eqT:'Balance equations',eqD:'Adjust the coefficients until everything adds up',nomT:'Naming compounds',nomD:'Formula → compound name',tabSub:'Every try brings different elements.',
symT:'Name → tile',symD:'Pick the tile with the right symbol',nameT:'Tile → name',nameD:'Look at the tile and name the element',datT:'Element facts',datD:'Atomic number and family',
org2Sub:'Nomenclature and reactions, based on Wade volume 2.',od_aro:'Aromatic substitution and directing groups',od_cet:'Names, reductions, imines and acetals',od_ami:'Basicity, acylation, Hofmann, diazonium',od_aci:'Acidity, esters, saponification',
ti_eq:'Balancing',ti_nom:'Naming',ti_sym:'Name → tile',ti_name:'Tile → name',ti_mito:'Myth or fact',ti_dat:'Element facts',ti_dnd:'Empty table',ti_mem:'Pairs',ti_gue:'Guess the element',ti_sn:'SN / E lab',
lives:'LIVES',streak:'STREAK',ariaLives:n=>`${n} lives`,
qNom:n=>`What is <b>${n}</b> called?`,qSym:n=>`What is the symbol for <b>${n}</b>?`,qName:'Which element is this?',qZ:n=>`What is the atomic number of <b>${n}</b>?`,eZ:(n,s,z)=>`${n} (${s}) has Z = ${z}.`,qFam:'Which family does this element belong to?',myth:'Myth',fact:'Fact',
ok:'Correct! 👏',no:'Almost… you dropped a juggling pin. Check the answer.',seeRes:'See result',next:'Next act',
bal:'Balance the equation',shOkL:'correct',shBsL:'best streak',shDayL:n=>n===1?'day playing':'days in a row',v3d:'View in 3D',v3load:'Loading 3D viewer…',v3fail:'Could not load the 3D viewer. Check your connection and try again.',v3mol:'Molecule',v3view:'View',v3bs:'Ball and stick',v3st:'Sticks',v3sp:'Space-filling',v3h:'Hydrogens',v3spin:'Spin',v3reset:'Reset view',v3hint:'Drag the model to rotate it (auto-spin stops when you touch it) · pinch or scroll to zoom',v3area:'3D model: drag to rotate, arrow keys to rotate, + and - to zoom',v3ctl:'Model controls',v3l:'Rotate left',v3r2:'Rotate right',v3u:'Rotate up',v3d2:'Rotate down',v3zi:'Zoom in',v3zo:'Zoom out',eqDiff:(el,l,r)=>`${el}: ${l} on the left, ${r} on the right`,eqMin:'It is balanced, but not with the smallest whole numbers.<br>',review:'To review',h2s:' (dissolved in water it is called hydrosulfuric acid)',figS:'Chemical structures',figR:'Chemical reaction',smallest:'Use the smallest whole numbers.',chk:'Check',eqAns:'Here is the balanced equation.',add:'Add',subt:'Subtract',
l1:'Marie Curie level 🥇',lE:'Einstein level 🥈',lB:'Lavoisier level 🥉',l2:'Great act, keep going',l3:'Another show and it will stick',lose:'You ran out of lives 💀 curtain down, but that is how you learn',newRec:'🏆 New record! Standing ovation!',rec:b=>`Your record: ${b} pts`,share:'Share result',again:'Another show',other:'Pick another act',
newRecC:'New record!',recC:b=>`Record: ${b} pts`,beat:'Can you beat me?',shareTxt:(n,s,t)=>`${n?n+' scored':'I scored'} ${s} pts in ${t} in the digital circus of Labstyle Arcade 🎪 Can you beat me? @nic.labstyle`,saveImg:'Save the image (long-press or right-click) and post it to your stories.',shT:'Share your result',rwTry:n=>`Reach ${n} or higher, tag @nic.labstyle in your story and I will share you in mine`,rwGot:n=>`You got ${n}! Post it to your story mentioning @nic.labstyle and I will share you in mine`,igT:'So the mention really works',ig1:'Copy the mention:',igCopy:'Copy @nic.labstyle',igCopied:'Copied',igCopiedD:'Done: @nic.labstyle is copied.',igNoCopy:'Could not copy it; type it: @nic.labstyle',ig2s:'Share the image and choose Instagram → Story:',ig2d:'Save the image and post it to your story:',igShare:'Share image',ig3:'In the story tap the «@ Mention» sticker (or «Aa»), paste and pick @nic.labstyle from the list. The @ inside the image does not count as a tag.',shImg:'Share image',shSave:'Save image',shApps:'Or share it on:',shCopy:'Copy text',shMore:'More apps…',shSaved:'Image saved.',shBusy:'A dialog is already open; finish that one first.',shManual:'Long-press the image to save it.',shIG:ok=>`Post it to your stories and tag @nic.labstyle${ok?' (the text is already copied)':''}.`,shOpenIG:'Open Instagram',shCopied:'Text copied. Paste it anywhere.',shNoCopy:'Could not copy. Long-press the text to copy it.',shNoSheet:'This browser cannot share directly; use the buttons above.',imgAlt:'Your Labstyle Arcade result',
nameQ:'What is your name?',nameD:'Your name will appear on the image when you share your result.',namePh:'Your name',save:'Save',cancel:'Cancel',skip:'Skip',changeName:'change name',setName:'+ Add my name',
exitQ:'Leave the show?',exitD:s=>`You will lose your progress${s>=2?' and your streak of '+s:''}.`,keep:'Stay in the ring',leave:'Leave',
suggLink:'Drop a note in the circus mailbox',sgSending:'Sending…',sgOk:'Received! Thanks for helping improve the show 💌',sgOkD:'Your suggestion went straight to @nic.labstyle.',sgWait:s=>`Wait ${s} s before sending another one.`,sgInbox:'Suggestions received',sgNone:'No suggestions yet.',anon:'Anonymous',suggT:'Suggestions',suggSub:'Tell me what you would improve, what topic you want, or if something broke.',typeG:'Message type',c_idea:'💡 Idea',c_fallo:'🐞 Something broke',c_tema:'📚 I want a topic',c2_idea:'Idea',c2_fallo:'Something broke',c2_tema:'I want a topic',ph:'Write your suggestion here…',sugAria:'Your suggestion',send:'Send',empty:'Write something first 🙂',msg:(tp,n,t)=>`Labstyle Arcade suggestion (${tp})${n?' from '+n:''}: ${t}`,copied:'I copied your message.',copyIt:'Copy your message.',paste:'Paste it into the chat and send it. Thanks for helping improve the game! 💌',openIG:'Open Instagram',openForm:'Open form',
tDay:n=>`🔥 ${n}-day streak`,tRisk:n=>`🔥 You are on a ${n}-day streak. Play today to keep it!`,firstT:d=>d>1?`🔥 ${d} days in a row!`:'🔥 Day 1! Your streak has started',
stT:'Your streak',stDays:n=>n===1?'day in a row':'days in a row',stBest:b=>`Best streak: ${b}`,st0:'Play a game today to start your streak.',stDone:'You performed today! Come back tomorrow for the next show.',stRisk:'Play today to keep your streak alive!',close:'Close',soundOn:'Turn sound and music on',mute:'Mute sound and music'}};
;

let LANG=LS.get('lang','es');
;

const _t=(k,...a)=>{const v=I18N[LANG][k]??I18N.es[k];return typeof v==='function'?v(...a):v};
;

function applyLang(){const en=LANG==='en',P=en?ENX:ES0,F=ES0;
/* lo que no tenga traducción se queda en español en vez de romper la página */
EL.forEach((x,i)=>x[1]=P.el[i]??F.el[i]);NOM.forEach((x,i)=>x[1]=P.nom[i]??F.nom[i]);
MITO.forEach((x,i)=>{const m=P.mito[i]??F.mito[i];x[0]=m[0];x[2]=m[1]});
for(const k in ORG)ORG[k].forEach((q,i)=>{const s=P.org[k]?.[i]??F.org[k][i];for(let j=0;j<4;j++)q[j]=s[j]});
Object.assign(CATN,F.catn,P.catn);Object.assign(ORGT,F.orgt,P.orgt);
walkTr(FIG,en?FM:FR);document.documentElement.lang=LANG;
const mb=document.getElementById('mute');if(mb)mb.setAttribute('aria-label',MUTE?_t('soundOn'):_t('mute'))}
;


function landing(){const f=document.createElement('iframe');f.id='ldf';f.title='Labstyle Arcade';const cs=getComputedStyle(document.documentElement),tv=['bg','ink','card','c1','c2','c3','c4','c5'].map(n=>'--'+n+':'+cs.getPropertyValue('--'+n).trim()).join(';');
f.addEventListener('load',()=>{try{const d=f.contentDocument,st=d.createElement('style');st.textContent=':root:root:root{'+tv+';--stripe:color-mix(in srgb,var(--c1) 16%,var(--bg))}';d.head.appendChild(st)}catch(e){}});
f.src='landing.html';
f.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:50;background:var(--bg)';document.body.appendChild(f);
const h=e=>{const k=e.data&&e.data.ld;if(e.source!==f.contentWindow||!k)return;removeEventListener('message',h);f.remove();sfx('ok');track('start',{});scrollTo({top:0,behavior:'instant'});
({home:home,eq:()=>play('eq','general'),tabla:tabla,name:()=>play('name','tabla'),lab:org1}[k]||home)()};addEventListener('message',h)}

;

mkMute();
;
applyLang();
;
LANG==='en'?splash():landing();
;
bootLoader();
;
/* ---------- Pasillo 3D ---------- */
/* Carga bajo demanda de modelos .glb (assets/models/) con indicador sutil */
const LabModels=(()=>{const cache={},names={pomni:'Pomni',ragatha:'Ragatha',jax:'Jax',caine:'Caine',gangle:'Gangle'};let n=0,el=null,t1=0,t2=0;
 const txt=k=>((typeof LANG!=='undefined'&&LANG==='en')?'Loading ':'Cargando a ')+(names[k]||'modelo')+'…';
 const show=k=>{n++;if(n>1&&el){el.lastChild.textContent=txt(k);return}clearTimeout(t2);t1=setTimeout(()=>{if(!el){el=document.createElement('div');el.className='lab-load';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.innerHTML='<i></i><span></span>';document.body.appendChild(el)}el.lastChild.textContent=txt(k);void el.offsetWidth;el.classList.add('on')},160)};
 const hide=()=>{n=Math.max(0,n-1);if(n)return;clearTimeout(t1);if(el){el.classList.remove('on');const e=el;el=null;t2=setTimeout(()=>e.remove(),400)}};
 return{get(k){if(!cache[k]){show(k);cache[k]=fetch('assets/models/'+k+'.glb').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status+' '+k+'.glb');return r.arrayBuffer()}).then(b=>{hide();return b},e=>{hide();delete cache[k];throw e})}return cache[k]}}})();
(function(){
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,BAY=3.5,ZO=.4,W=6,H=4.3,hw=W/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PAL=['#F4A12A','#3DB4E8','#4CD08B','#9A5BFF','#FF5C8A','#FFD84D','#E0243F','#2A2A6E'],rnd=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.floor(Math.random()*a.length)];
let busy=0;window.LVL_LIVES=3;
const kindOf=go=>{const m=/play\('([a-z]+)'/.exec(go||'');return m?m[1]:''};
function countdown(o,lives,go,en){
 o.className='dr-ovl dr-go';o.style.placeItems='center';o.style.paddingBottom='';o.innerHTML='<div class="dr-cd"><b></b></div>'+Array.from({length:28},()=>'<i class="cf" style="left:'+rnd(0,100).toFixed(1)+'%;animation-delay:'+rnd(0,.5).toFixed(2)+'s;background:'+pk(PAL)+'"></i>').join('');
 const seq=['3','2','1',en?'GO!':'¡JUEGA!'],b=o.querySelector('b');let k=0;
 const step=()=>{b.textContent=seq[k];b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');if(typeof sfx==='function')try{sfx('ok')}catch(e){}
  k++;if(k<seq.length)setTimeout(step,rm?0:650);else setTimeout(()=>{o.remove();busy=0;window.LVL_LIVES=lives;try{Function(go)()}finally{window.LVL_LIVES=3}},rm?0:500)};
 step()}
function sheet(ic,tt,sp,go,onClose){
 const en=typeof LANG!=='undefined'&&LANG==='en',Lv=en?'Level':'Nivel',o=document.createElement('div');o.className='dr-ovl';
 o.innerHTML='<div class="dr-sheet" role="dialog" aria-modal="true"><button class="dr-x" type="button" aria-label="'+(en?'Close door':'Cerrar puerta')+'">×</button><div class="dr-ic"></div><h3></h3><p></p><div class="dr-lv">'+[[3,'♥♥♥'],[2,'♥♥'],[1,'♥']].map((x,i)=>'<button type="button" data-l="'+x[0]+'"><b>'+Lv+' '+(i+1)+'</b><span>'+x[1]+'</span></button>').join('')+'</div></div>';
 document.body.appendChild(o);o.querySelector('.dr-ic').textContent=ic;o.querySelector('h3').textContent=tt;o.querySelector('p').textContent=sp;
 let live=true;const close=()=>{if(!live)return;live=false;removeEventListener('keydown',kd);o.remove();onClose&&onClose()};
 const kd=e=>{if(e.key==='Escape')close()};addEventListener('keydown',kd);
 o.addEventListener('click',e=>{const l=e.target.closest('[data-l]');if(l&&live){live=false;removeEventListener('keydown',kd);countdown(o,+l.dataset.l,go,en);return}if(e.target===o||e.target.closest('.dr-x'))close()});
 o.querySelector('[data-l]').focus()}
function pomni(kind,done,vi){
 const en=typeof LANG!=='undefined'&&LANG==='en';
 const cast={
  eq:{id:'pomni',name:'Pomni',es:'¡Vamos a equilibrar esta reacción!',en:'Let’s balance this reaction!'},
  nom:{id:'ragatha',name:'Ragatha',es:'¡Vamos a poner cada nombre en su lugar!',en:'Let’s put every name in its place!'},
  mol:{id:'jax',name:'Jax',es:'A ver si puedes construir la molécula correcta.',en:'Let’s see if you can build the right molecule.'},
  maze:{id:'gangle',name:'Gangle',es:'¡Te acompaño a encontrar la salida!',en:'I’ll help you find the way out!'},
  mem:{id:'ragatha',name:'Ragatha',es:'¡Concentración! Vamos a encontrar las parejas.',en:'Focus! Let’s find the matching pairs.'},
  gue:{id:'jax',name:'Jax',es:'Adivina el elemento. No será tan fácil…',en:'Guess the element. It won’t be that easy…'},
  sym:{id:'pomni',name:'Pomni',es:'¡Reconozcamos los símbolos!',en:'Let’s identify the symbols!'},
  name:{id:'ragatha',name:'Ragatha',es:'¡Vamos a descubrir los nombres!',en:'Let’s discover the names!'},
  dat:{id:'jax',name:'Jax',es:'Pon a prueba lo que sabes de la tabla.',en:'Test what you know about the table.'},
  dnd:{id:'gangle',name:'Gangle',es:'¡Arrastremos cada elemento a su casilla!',en:'Let’s drag each element to its place!'},
  org:{id:'gangle',name:'Gangle',es:'¡Entremos al laboratorio de orgánica!',en:'Let’s enter the organic chemistry lab!'},
  defense:{id:'jax',name:'Jax',es:'¡Defiende el laboratorio con la respuesta correcta!',en:'Defend the lab with the correct answer!'}
 };
 const c=cast[kind]||{id:'pomni',name:'Pomni',es:'¡El reto está por comenzar!',en:'The challenge is about to begin!'};
 const o=document.createElement('div');o.className='dr-ovl dr-pm';
 const title=document.createElement('p');title.className='dr-pm-title';title.textContent=en?'YOUR GUIDE IS HERE':'¡TU GUÍA HA LLEGADO!';
 const name=document.createElement('div');name.className='dr-pm-name';name.textContent=c.name;
 const talk=document.createElement('div');talk.className='dr-pm-talk';talk.textContent=en?c.en:c.es;
 const hint=document.createElement('div');hint.className='dr-pm-hint';hint.textContent=en?'TAP TO CONTINUE':'TOCA PARA CONTINUAR';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label',c.name+' en una escena 3D');
 o.append(canvas,title,name,talk,hint);document.body.appendChild(o);
 let renderer=null,raf=0,tm=0,finished=false,group=null,arms=[];
 const finish=()=>{if(finished)return;finished=true;clearTimeout(tm);if(raf)cancelAnimationFrame(raf);if(renderer){renderer.dispose();renderer.forceContextLoss()}o.remove();done()};
 o.addEventListener('click',finish,{once:true});
 try{
  if(!window.THREE)throw new Error('Three.js no disponible');
  const T=THREE,scene=new T.Scene();
  const camera=new T.PerspectiveCamera(34,1,.1,50);camera.position.set(0,1.55,7.2);camera.lookAt(0,1.45,0);
  renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
  scene.add(new T.HemisphereLight(0xffe8ff,0x29143b,1.35));
  const key=new T.DirectionalLight(0xffe5bf,2.2);key.position.set(-3,5,5);scene.add(key);
  const rim=new T.PointLight(0xb65cff,1.8,12);rim.position.set(3,2,1);scene.add(rim);
  const gold=new T.PointLight(0xffc96b,1.1,10);gold.position.set(-3,1,2);scene.add(gold);
  const mat=(color,rough)=>new T.MeshStandardMaterial({color:color,roughness:rough==null?0.72:rough,metalness:0});
  const mats={cream:mat(0xf2e7d6),white:mat(0xfff7ed),red:mat(0xc8324b),blue:mat(0x3159c9),yellow:mat(0xf5c747),purple:mat(0x8b58bc),pink:mat(0xeaa1c7),dark:mat(0x171321),skin:mat(0xe9c6ad),hair:mat(0xb52f43),ribbon:mat(0xc92843),black:mat(0x111018),eye:mat(0xfffaf2)};
  const add=(parent,geo,material,x,y,z,sx,sy,sz)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);if(sx!=null)m.scale.set(sx,sy,sz);parent.add(m);return m};
  const ball=(p,x,y,z,sx,sy,sz,m)=>add(p,new T.SphereGeometry(1,24,18),m,x,y,z,sx,sy,sz);
  const segment=(p,a,b,r,m)=>{const A=new T.Vector3(a[0],a[1],a[2]),B=new T.Vector3(b[0],b[1],b[2]),v=B.clone().sub(A),mesh=add(p,new T.CylinderGeometry(r*.82,r,v.length(),14),m,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return mesh};
  const curve=(p,pts,r,m)=>{const v=pts.map(q=>new T.Vector3(q[0],q[1],q[2]));return add(p,new T.TubeGeometry(new T.CatmullRomCurve3(v),32,r,8,false),m,0,0,0)};
  group=new T.Group();scene.add(group);
  const bodyMat=c.id==='jax'?mats.purple:c.id==='ragatha'?mats.blue:c.id==='gangle'?mats.ribbon:mats.red;
  const torso=add(group,new T.CylinderGeometry(.39,.48,.88,24),bodyMat,0,1.03,0,1,1,1);
  const neck=add(group,new T.CylinderGeometry(.13,.16,.18,16),mats.cream,0,1.52,0);
  const head= new T.Group();head.position.set(0,2.03,0);group.add(head);
  ball(head,0,0,0,c.id==='jax'?.48:.53,c.id==='gangle'?.48:.5,.38,c.id==='ragatha'?mats.skin:(c.id==='jax'?mats.purple:(c.id==='pomni'?mats.cream:mats.white)));
  // Eyes and expression, built as actual meshes rather than a video/poster.
  if(c.id==='gangle'){
   ball(head,-.19,.06,.33,.085,.13,.035,mats.black);ball(head,.19,.06,.33,.085,.13,.035,mats.black);
   curve(head,[[-.13,-.2,.34],[0,-.25,.37],[.13,-.2,.34]],.025,mats.black);
  }else{
   ball(head,-.19,.06,.34,.075,.105,.045,mats.dark);ball(head,.19,.06,.34,.075,.105,.045,mats.dark);
   ball(head,-.17,.09,.385,.025,.035,.018,mats.eye);ball(head,.21,.09,.385,.025,.035,.018,mats.eye);
   curve(head,[[-.1,-.18,.35],[0,-.22,.38],[.1,-.18,.35]],.018,mats.dark);
  }
  // Shared arms and legs; pivots are animated in the render loop.
  const legL=new T.Group(),legR=new T.Group();legL.position.set(-.2,.68,0);legR.position.set(.2,.68,0);group.add(legL,legR);
  segment(legL,[0,0,0],[-.02,-.48,.02],.105,c.id==='jax'?mats.purple:(c.id==='gangle'?mats.ribbon:mats.blue));
  segment(legR,[0,0,0],[.02,-.48,.02],.105,c.id==='jax'?mats.purple:(c.id==='gangle'?mats.ribbon:mats.red));
  ball(legL,-.02,-.49,.11,.16,.09,.22,c.id==='jax'?mats.yellow:mats.dark);ball(legR,.02,-.49,.11,.16,.09,.22,c.id==='jax'?mats.yellow:mats.dark);
  [-1,1].forEach(side=>{const pivot=new T.Group();pivot.position.set(side*.42,1.35,0);group.add(pivot);segment(pivot,[0,0,0],[side*.08,-.5,.04],.105,bodyMat);ball(pivot,side*.08,-.53,.05,.13,.13,.13,c.id==='gangle'?mats.white:mats.cream);arms.push(pivot)});
  if(c.id==='pomni'){
   // Harlequin cap: two contrasting points and golden pom-poms.
   const cap=add(head,new T.TorusGeometry(.39,.09,10,28),mats.yellow,0,.43,0);cap.rotation.x=Math.PI/2;
   const h1=add(head,new T.ConeGeometry(.19,.78,18),mats.red,-.25,.78,0);h1.rotation.z=.35;
   const h2=add(head,new T.ConeGeometry(.19,.78,18),mats.blue,.25,.78,0);h2.rotation.z=-.35;
   ball(head,-.39,1.18,0,.12,.12,.12,mats.yellow);ball(head,.39,1.18,0,.12,.12,.12,mats.yellow);
   add(group,new T.TorusGeometry(.37,.06,10,28),mats.yellow,0,1.52,0).rotation.x=Math.PI/2;
  }else if(c.id==='ragatha'){
   // Red yarn hair, side locks, and the familiar button details.
   for(let i=0;i<7;i++){const x=-.42+i*.14;ball(head,x,.34+Math.sin(i*1.2)*.045,-.02,.12,.19,.14,mats.hair)}
   ball(head,-.48,-.08,.02,.14,.48,.17,mats.hair);ball(head,.48,-.08,.02,.14,.48,.17,mats.hair);
   ball(group,-.12,1.15,.43,.09,.09,.06,mats.yellow);ball(group,.12,1.0,.43,.09,.09,.06,mats.yellow);
   ball(head,-.19,.06,.385,.07,.07,.04,mats.dark);
  }else if(c.id==='jax'){
   const ear1=ball(head,-.25,.72,0,.13,.52,.12,mats.purple);ear1.rotation.z=.12;
   const ear2=ball(head,.25,.72,0,.13,.52,.12,mats.purple);ear2.rotation.z=-.12;
   ball(head,-.25,.75,.105,.055,.32,.035,mats.pink);ball(head,.25,.75,.105,.055,.32,.035,mats.pink);
   ball(head,-.18,.08,.37,.08,.1,.04,mats.eye);ball(head,.18,.08,.37,.08,.1,.04,mats.eye);
   ball(head,-.18,.08,.41,.035,.055,.02,mats.dark);ball(head,.18,.08,.41,.035,.055,.02,mats.dark);
  }else if(c.id==='gangle'){
   // Mask frame and loose ribbon-like body strands.
   ball(head,0,-.31,.05,.31,.1,.12,mats.ribbon);
   curve(group,[[-.28,1.25,.05],[-.48,.95,.1],[-.2,.72,.18],[.28,.5,.12],[.42,.22,.08]],.055,mats.ribbon);
   curve(group,[[.25,1.22,-.02],[.48,.96,.05],[.18,.74,.2],[-.3,.48,.12],[-.4,.2,.08]],.05,mats.ribbon);
   curve(group,[[-.2,.65,.12],[-.36,.42,.22],[-.12,.18,.25],[.18,.08,.2]],.045,mats.ribbon);
  }
  // A small lit platform anchors the character in the game's world.
  const ring=add(scene,new T.TorusGeometry(.9,.035,10,48),mat(0xe6b65e,.35),0,.05,0);ring.rotation.x=Math.PI/2;
  const disc=add(scene,new T.CylinderGeometry(.78,.9,.09,48),mat(0x26152f),0,-.02,0);
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;ball(scene,Math.cos(a)*1.02,.1,Math.sin(a)*1.02,.025,.025,.025,mat(i%2?0xffd47a:0xb46cff))}
  const resize=()=>{const w=o.clientWidth||innerWidth,h=o.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
  resize();const ro=new ResizeObserver(resize);ro.observe(o);
  const start=performance.now();
  const render=now=>{if(finished)return;raf=requestAnimationFrame(render);const t=(now-start)/1000;group.position.y=.08+Math.sin(t*2.3)*.045;group.rotation.y=Math.sin(t*.75)*.13;head.rotation.z=Math.sin(t*1.2)*.035;arms[0].rotation.z=.12+Math.sin(t*2.2)*.08;arms[1].rotation.z=-.12-Math.sin(t*2.2+.8)*.08;renderer.render(scene,camera)};
  raf=requestAnimationFrame(render);
  const oldFinish=finish;const cleanFinish=()=>{ro.disconnect();oldFinish()};o.removeEventListener('click',oldFinish);o.addEventListener('click',cleanFinish,{once:true});
  tm=setTimeout(cleanFinish,3600);
 }catch(err){
  // If WebGL is unavailable, keep the character intro readable and let the game continue.
  canvas.style.display='none';
  const fallback=document.createElement('div');fallback.textContent=c.name;fallback.style.cssText='position:absolute;top:42%;left:50%;transform:translate(-50%,-50%);font:900 clamp(42px,10vw,90px) Fraunces,serif;color:#ffe7a1;text-shadow:0 8px 28px #000';o.appendChild(fallback);
  tm=setTimeout(finish,2600);
 }
}
function scr(c,kind,t){const x=c.getContext('2d'),w=c.width,h=c.height,en=c.dataset.en==='1',S=Math.sin,fl=Math.floor;
 x.fillStyle='#10163a';x.fillRect(0,0,w,h);x.textAlign='center';x.textBaseline='middle';
 const bar=s=>{x.fillStyle='#E0243F';x.fillRect(0,0,w,30);x.fillStyle='#fff';x.font='800 17px sans-serif';x.fillText(s,w/2,16)},tx=(s,a,b,f,col)=>{x.fillStyle=col||'#FFD84D';x.font='800 '+f+'px sans-serif';x.fillText(s,a,b)};
 if(kind==='eq'){bar(en?'Balance it!':'¡Balancea la ecuación!');const st=fl(t*.9)%4,co=[[1,1,1],[1,1,2],[2,1,2],[2,1,2]][st],hl=co[0]*2,hr=co[2]*2,ol=co[1]*2,or=co[2];
  tx(co[0]+'H₂ + '+co[1]+'O₂ → '+co[2]+'H₂O',w/2,100,30);tx('H: '+hl+' | '+hr,w/2,150,24,hl===hr?'#5EE0B5':'#FF7D93');tx('O: '+ol+' | '+or,w/2,185,24,ol===or?'#5EE0B5':'#FF7D93');if(st>2)tx('✓',w/2,222,26,'#5EE0B5')}
 else if(kind==='gue'){bar(en?'Guess the element':'Adivina el elemento');const n=Math.min(fl(t*1.1)+1,4),cl=en?['Soft metal','Reacts with water','Z = 11','It is Na!']:['Metal blando','Reacciona con agua','Z = 11','¡Es Na!'];for(let i=0;i<n;i++)tx(cl[i],w/2,70+i*38,i===3?34:20,i===3?'#5EE0B5':'#fff')}
 else if(kind==='mem'){bar(en?'Pairs':'Parejas');const L=['H₂O','agua','NaCl','sal','CO₂','gas'];for(let i=0;i<6;i++){const a=22+(i%3)*98,b=50+fl(i/3)*84,up=(fl(t*1.4)+i)%4!==0;x.fillStyle=up?'#FFD84D':'#A99CFF';x.fillRect(a,b,84,72);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(a,b,84,72);if(up)tx(L[i],a+42,b+36,22,'#10163a');else tx('?',a+42,b+36,30,'#fff')}}
 else if(kind==='maze'){bar(en?'Lab maze':'Laberinto');const cs=30,ox=25,oy=45;x.strokeStyle='#5EE0B5';x.lineWidth=3;for(let i=0;i<10;i++)for(let j=0;j<6;j++){if((i*7+j*13)%5===0){x.beginPath();x.moveTo(ox+i*cs,oy+j*cs);x.lineTo(ox+i*cs+cs,oy+j*cs);x.stroke()}if((i*11+j*3)%6===0){x.beginPath();x.moveTo(ox+i*cs,oy+j*cs);x.lineTo(ox+i*cs,oy+j*cs+cs);x.stroke()}}
  [[2,1],[6,3],[8,0]].forEach(a=>tx('●',ox+a[0]*cs+15,oy+a[1]*cs+15,14,'#FF7D93'));const p=(t*3)%10;x.fillStyle='#FFD84D';x.beginPath();x.arc(ox+p*cs,oy+75+S(t)*0+15,9,0,7);x.fill()}
 else if(kind==='mol'){bar(en?'Build molecules':'Constructor de moléculas');const a=t*2;x.fillStyle='#FF5C7A';x.beginPath();x.arc(w/2,125,26,0,7);x.fill();tx('O',w/2,126,22,'#fff');for(let k=0;k<2;k++){const r=60-Math.min(t*20,22),an=a*(t<1.2?1:0)+k*2.1+.5,hx=w/2+Math.cos(an)*r,hy=125+Math.sin(an)*r*.8;x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.moveTo(w/2,125);x.lineTo(hx,hy);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(hx,hy,14,0,7);x.fill();tx('H',hx,hy+1,16,'#10163a')}tx('H₂O',w/2,205,30)}
 else if(kind==='sym'||kind==='name'||kind==='dat'||kind==='dnd'||kind==='nom'){bar(en?'Periodic table':'Tabla periódica');const E=['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'],cur=fl(t*2)%20;for(let i=0;i<20;i++){const a=8+(i%5)*61,b=40+fl(i/5)*48,on=i===cur,dn=i<cur;x.fillStyle=on?'#FFD84D':dn?'#5EE0B5':'#2b3470';x.fillRect(a,b,56,42);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(a,b,56,42);tx(on||dn?E[i]:'?',a+28,b+22,20,on||dn?'#10163a':'#fff')}}
 else{bar(en?'Lab':'Laboratorio');const hh=Math.min(t*30,70),co=['#A99CFF','#5EE0B5','#FF5C7A'][fl(t/1.2)%3];x.strokeStyle='#fff';x.lineWidth=4;x.fillStyle=co;x.beginPath();x.moveTo(120,70);x.lineTo(120,120);x.lineTo(70,215);x.lineTo(250,215);x.lineTo(200,120);x.lineTo(200,70);x.stroke();x.save();x.beginPath();x.moveTo(120,70);x.lineTo(120,120);x.lineTo(70,215);x.lineTo(250,215);x.lineTo(200,120);x.lineTo(200,70);x.clip();x.fillRect(60,215-hh-5,200,hh+10);x.restore();for(let i=0;i<5;i++)tx('○',140+S(t*3+i)*30,200-((t*60+i*25)%90),12,'#fff')}
 x.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<h;y+=3)x.fillRect(0,y,w,1)}
function circ(c,k,t){const x=c.getContext('2d'),w=c.width,h=c.height,S=Math.sin,en=typeof LANG!=='undefined'&&LANG==='en';
 const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3a0a22');g.addColorStop(1,'#c2208f');x.fillStyle=g;x.fillRect(0,0,w,h);
 for(let i=0;i<8;i++){x.fillStyle=i%2?'rgba(255,60,90,.35)':'rgba(120,0,40,.35)';x.fillRect(i*w/8,0,w/8,h)}
 const sp=x.createRadialGradient(w/2,h*.55,4,w/2,h*.55,w*.7);sp.addColorStop(0,'rgba(255,240,170,.9)');sp.addColorStop(1,'rgba(255,240,170,0)');x.fillStyle=sp;x.fillRect(0,0,w,h);
 const bx=w/2,by=h*.5+S(t*3)*4;x.lineWidth=3;x.strokeStyle='#3A140E';[[-1,'#E0243F'],[1,'#3DB4E8']].forEach(a=>{const ex=bx+a[0]*46,ey=by+10+S(t*4)*5;x.fillStyle=a[1];x.beginPath();x.moveTo(bx,by-22);x.quadraticCurveTo(bx+a[0]*30,by-50,ex,ey);x.lineTo(bx+a[0]*8,by+6);x.closePath();x.fill();x.stroke();x.fillStyle='#FFD84D';x.beginPath();x.arc(ex,ey,6,0,7);x.fill();x.stroke()});
 x.fillStyle='#FFF1E0';x.beginPath();x.arc(bx,by+12,17,0,7);x.fill();x.stroke();x.fillStyle='#fff';[-7,7].forEach(d=>{x.beginPath();x.arc(bx+d,by+10,6,0,7);x.fill();x.stroke();x.fillStyle='#E0243F';x.fillRect(bx+d-1,by+9,2,2);x.fillStyle='#fff'});
 const j=Math.floor(t*10)%7===0?4:1.5,tt=en?['WELCOME TO','THE DIGITAL','CIRCUS']:['BIENVENIDO','AL CIRCO','DIGITAL'];x.textAlign='center';x.font='800 16px Fraunces,serif';
 [['#3DE0FF',-j],['#FF2D6F',j],['#FFE45C',0]].forEach(a=>tt.forEach((s,i)=>{x.fillStyle=a[0];x.fillText(s,w/2+a[2]===undefined?w/2+a[1]:w/2+a[1],h*.14+i*18)}));
 for(let i=0;i<4;i++){const r=Math.sin(Math.floor(t*8)*(i+3.3))*.5+.5;x.fillStyle=['#3DE0FF','#FF2D6F','#FFE45C','#fff'][i];x.globalAlpha=.55;x.fillRect(r*w*.8,h*.7+((r*97)%1)*h*.25,12+r*30,3+i);x.globalAlpha=1}}
function drawPrev(c,kind,t){const x=c.getContext('2d'),w=c.width,h=c.height;
 const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FFF6D8');g.addColorStop(1,'#FFB347');x.fillStyle=g;x.fillRect(0,0,w,h);
 x.textAlign='center';x.textBaseline='middle';x.fillStyle='#3A140E';
 if(kind==='eq'){const st=Math.floor(t*1.1)%4,S=['H₂ + O₂ → H₂O','H₂ + O₂ → 2H₂O','2H₂ + O₂ → 2H₂O','✓ ¡Balanceada!'];
  x.font='800 13px Fraunces,serif';x.fillText(S[st],w/2,h*.36);x.font='700 34px sans-serif';x.fillText(st===3?'✅':'⚖️',w/2,h*.6);
  x.font='700 11px sans-serif';x.fillText(en_(c)?'Balance the atoms':'Iguala los átomos',w/2,h*.85)}
 else if(kind==='tabla'||kind==='nom'||kind==='name'||kind==='gue'||kind==='mem'||kind==='dnd'){const L=['H','O','Na','Cl','C','N'],cw=w*.36,ch=h*.22;
  for(let i=0;i<6;i++){const col=i%2,row=Math.floor(i/2),cx=w*.2+col*w*.42,cy=h*.16+row*ch*1.15,sc=Math.abs(Math.cos(t*2+i*.7));
   x.save();x.translate(cx+cw/2,cy+ch/2);x.scale(Math.max(.08,sc),1);x.fillStyle=i%3===0?'#FF5C8A':i%3===1?'#FFD84D':'#3DB4E8';x.fillRect(-cw/2,-ch/2,cw,ch);x.strokeStyle='#3A140E';x.lineWidth=2;x.strokeRect(-cw/2,-ch/2,cw,ch);
   x.fillStyle='#3A140E';x.font='800 '+Math.round(ch*.5)+'px Fraunces,serif';x.fillText(sc>.4?L[i]:'?',0,2);x.restore()}}
 else{const cx=w/2,cy=h*.42;x.fillStyle='#E0243F';x.beginPath();x.arc(cx,cy,16,0,7);x.fill();
  for(let k=0;k<3;k++){const a=t*2+k*2.094,rr=44;x.fillStyle='#3DB4E8';x.beginPath();x.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.45,7,0,7);x.fill();x.strokeStyle='rgba(58,20,14,.35)';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy,rr,rr*.45,0,0,7);x.stroke()}
  x.font='800 13px Fraunces,serif';x.fillText(en_(c)?'Watch, then play':'Observa y juega',w/2,h*.85)}}
const en_=c=>c.dataset&&c.dataset.en==='1';
const cvs=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t};
const rep=(t,a,b)=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(a,b);return t};
const art=()=>cvs(256,340,(x,w,h)=>{x.fillStyle=pk(PAL);x.fillRect(0,0,w,h);
 for(let i=0;i<10;i++){x.globalAlpha=rnd(.5,.95);x.fillStyle=pk(PAL);x.beginPath();const t=Math.random();
  if(t<.4)x.arc(rnd(0,w),rnd(0,h),rnd(20,70),0,7);else if(t<.7)x.rect(rnd(0,w-60),rnd(0,h-60),rnd(30,110),rnd(30,110));else{const a=rnd(0,w),b=rnd(0,h);x.moveTo(a,b);x.lineTo(a+rnd(-90,90),b+rnd(30,100));x.lineTo(a+rnd(-90,90),b+rnd(-100,-20))}x.fill()}
 x.globalAlpha=1;if(Math.random()<.6){const cx=w/2,cy=h*.45;x.fillStyle=pk(['#F4A12A','#4CD08B','#9A5BFF']);x.beginPath();x.ellipse(cx,cy,80,96,0,0,7);x.fill();
  [-30,30].forEach(d=>{x.fillStyle='#fff';x.beginPath();x.ellipse(cx+d,cy-14,20,28,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx+d+4,cy-8,9,0,7);x.fill()})}
 const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(.5,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const plate=t=>cvs(256,72,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FFF3CC');g.addColorStop(1,'#E9C77A');x.fillStyle=g;x.fillRect(0,0,w,h);x.strokeStyle='#7A3322';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#3A140E';x.textAlign='center';x.textBaseline='middle';let f=34;do{x.font='800 '+f+'px Fraunces,Georgia,serif';f-=2}while(x.measureText(t).width>w-24&&f>12);x.fillText(t,w/2,h/2+2)});
const sign=ic=>cvs(128,128,(x)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.fillStyle='#FF7BB8';x.beginPath();x.arc(64,64,52,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(64,64,40,0,7);x.fill();x.font='44px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ic,64,68)});
const pool=()=>cvs(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,232,170,.9)');g.addColorStop(1,'rgba(255,232,170,0)');x.fillStyle=g;x.fillRect(0,0,128,128)});
const wood=()=>cvs(256,512,(x,w,h)=>{x.fillStyle='#3A1710';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){x.strokeStyle='rgba('+(Math.random()<.5?'255,200,150':'0,0,0')+','+rnd(.03,.1).toFixed(3)+')';x.lineWidth=rnd(.8,2.5);x.beginPath();const y0=rnd(0,h);x.moveTo(0,y0);x.bezierCurveTo(w*.3,y0+rnd(-14,14),w*.6,y0+rnd(-14,14),w,y0+rnd(-8,8));x.stroke()}});
const carpet=()=>cvs(256,256,(x,w,h)=>{x.fillStyle='#C8102E';x.fillRect(0,0,w,h);for(let i=-1;i<=w/64;i++)for(let j=-1;j<=h/64;j++){x.save();x.translate(i*64+(j%2)*32,j*64);x.rotate(Math.PI/4);x.fillStyle='rgba(255,90,100,.22)';x.fillRect(-12,-12,24,24);x.restore()}
 for(let i=0;i<2500;i++){x.fillStyle='rgba(0,0,0,'+rnd(.03,.09).toFixed(3)+')';x.fillRect(rnd(0,w),rnd(0,h),2,2)}});
const wall=()=>cvs(512,512,(x,w,h)=>{x.fillStyle='#D8489F';x.fillRect(0,0,w,h);for(let i=0;i<w/16;i++){x.fillStyle=i%2?'rgba(255,190,220,.14)':'rgba(110,0,60,.08)';x.fillRect(i*16,0,8,h)}
 const g=x.createLinearGradient(0,h*.72,0,h);g.addColorStop(0,'rgba(60,0,30,0)');g.addColorStop(1,'rgba(60,0,30,.45)');x.fillStyle=g;x.fillRect(0,h*.72,w,h*.28);
 x.fillStyle='rgba(120,0,50,.5)';x.fillRect(0,h*.7,w,4);
 for(let i=0;i<2000;i++){x.fillStyle='rgba(0,0,0,'+rnd(.02,.05).toFixed(3)+')';x.fillRect(rnd(0,w),rnd(0,h),1.5,1.5)}});
const ceil=()=>cvs(256,4,(x,w,h)=>{[['#E86AB0',0],['#E0243F',.14],['#EDB46A',.26],['#E0243F',.74],['#E86AB0',.86]].forEach((s,i,a)=>{x.fillStyle=s[0];x.fillRect(s[1]*w,0,((a[i+1]?a[i+1][1]:1)-s[1])*w+1,h)})});
function build(g,bs,w,span){
 const n=bs.length,K=n+4,L=K*BAY,zS=5.5,zEnd=-(n+.5)*BAY+ZO,len=L+8,zc0=(8-L)/2;
 const cv=document.createElement('canvas');cv.className='hall-cv';g.insertBefore(cv,g.firstChild);
 let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true})}catch(e){cv.remove();return null}
 R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
 const S=new THREE.Scene(),FOG=0xA82A5E,cam=new THREE.PerspectiveCamera(64,1,.1,80);S.background=new THREE.Color(FOG);S.fog=new THREE.Fog(FOG,5,26);
 S.add(new THREE.HemisphereLight(0xffeaf3,0x7a1530,.7));
 const L1=new THREE.PointLight(0xffe2b0,1.6,14,1.5),L2=new THREE.PointLight(0xffd9a0,1.1,18,1.5);S.add(L1,L2);
 const M=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.7,metalness:0},o||{})),BA=o=>new THREE.MeshBasicMaterial(o);
 const add=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);(p||S).add(m);return m};
 const ct=rep(carpet(),W/1.2,len/1.2),wt=wall(),wd=wood();
 add(new THREE.PlaneGeometry(W,len),M({map:ct,roughness:.95}),0,0,zc0).rotation.x=-Math.PI/2;
 [-1,1].forEach(s=>add(new THREE.PlaneGeometry(.6,len),M({color:0xE3A55A,metalness:.4,roughness:.35}),s*(hw-.3),.004,zc0).rotation.x=-Math.PI/2);
 const cl=add(new THREE.PlaneGeometry(W,len),M({map:ceil(),roughness:.85}),0,H,zc0);cl.rotation.x=Math.PI/2;
 [-1,1].forEach(s=>{const wl=add(new THREE.PlaneGeometry(len,H),M({map:rep(wt.clone(),len/2.6,1),roughness:.9}),s*hw,H/2,zc0);wl.rotation.y=-s*Math.PI/2;wl.material.map.needsUpdate=true;
  add(new THREE.BoxGeometry(.16,.26,len),M({color:0xE3A55A,metalness:.5,roughness:.3}),s*(hw-.08),.13,zc0);add(new THREE.BoxGeometry(.2,.3,len),M({color:0xB3162E,roughness:.5}),s*(hw-.1),H-.15,zc0)});
 const pil=new THREE.BoxGeometry(.22,H,.5),str=new THREE.BoxGeometry(.04,H,.16),pm=M({color:0xD81F32,roughness:.45}),sm=M({color:0xE9B04F,metalness:.5,roughness:.3});
 for(let k=0;k<=K;k++){[-1,1].forEach(s=>{add(pil,pm,s*(hw-.11),H/2,-k*BAY);if(k<K){const zc=-(k+.5)*BAY;add(str,sm,s*(hw-.02),H/2,zc-1.05);add(str,sm,s*(hw-.02),H/2,zc+1.05)}})}
 const lampG=new THREE.SphereGeometry(.42,28,14,0,Math.PI*2,Math.PI/2,Math.PI/2),rimG=new THREE.TorusGeometry(.42,.06,10,28),brass=M({color:0xD9A520,metalness:.9,roughness:.25}),glass=M({color:0xFFF1D6,emissive:0xFFD9A0,emissiveIntensity:1.3,roughness:.15,transparent:true,opacity:.95}),pt=pool(),pmat=BA({map:pt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.55}),poolG=new THREE.CircleGeometry(1.7,32);
 const doors=[],hit=[],woodM=M({map:wd,roughness:.55}),frameM=M({color:0xB3162E,roughness:.5});
 function mkDoor(i,s,zc,b){const dw=1.35,dh=2.75,grp=new THREE.Group(),pv=new THREE.Group();
  grp.position.set(s*(hw-.01),0,zc+(s<0?dw/2:-dw/2));grp.rotation.y=s<0?Math.PI/2:-Math.PI/2;S.add(grp);grp.add(pv);
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(dw,0);sh.lineTo(dw,dh-.55);sh.quadraticCurveTo(dw,dh,dw-.55,dh);sh.lineTo(.55,dh);sh.quadraticCurveTo(0,dh,0,dh-.55);sh.lineTo(0,0);
  const lg=new THREE.ExtrudeGeometry(sh,{depth:.07,bevelEnabled:false});
  const o2=new THREE.Shape(),e=.16,a=dw+e,hh=dh+e;o2.moveTo(-e,0);o2.lineTo(a,0);o2.lineTo(a,dh-.4);o2.quadraticCurveTo(a,hh,dw-.4,hh);o2.lineTo(.4,hh);o2.quadraticCurveTo(-e,hh,-e,dh-.4);o2.lineTo(-e,0);o2.holes.push(new THREE.Path(sh.getPoints(12)));
  add(new THREE.ExtrudeGeometry(o2,{depth:.22,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:2}),frameM,0,0,-.02,grp);
  const pc=document.createElement('canvas');pc.width=128;pc.height=256;const ptx=new THREE.CanvasTexture(pc);ptx.encoding=THREE.sRGBEncoding;
  const portal=add(new THREE.ShapeGeometry(sh),BA({map:ptx,transparent:true,opacity:.12,depthWrite:false}),0,0,.032,grp);
  portal.material.transparent=true;portal.material.opacity=.12;portal.material.depthWrite=false;
  const d={i,pv,s,z:zc,open:0,lockV:0,pc,ptx,portal,grp,kind:kindOf(b.go)},leaf=add(lg,woodM,0,0,0,pv);
  const parts=[leaf,add(new THREE.PlaneGeometry(dw*.7,dh*.3),M({color:0x2E120D,roughness:.6}),dw/2,dh*.2,.073,pv),add(new THREE.CircleGeometry(.3,32),BA({map:sign(b.ic)}),dw/2,dh*.66,.076,pv),add(new THREE.PlaneGeometry(.95,.27),BA({map:plate(b.tt)}),dw/2,dh*.47,.076,pv),add(new THREE.SphereGeometry(.06,16,16),brass,dw-.17,dh*.42,.12,pv)];
  parts.forEach(m=>{m.userData.d=d;hit.push(m)});doors.push(d);return d}

 function buildDoorRoom(d,who,npc){
  const room=new THREE.Group();room.name=who+'_interior_room';d.grp.add(room);
  const mat=(c,r=.65,m=0)=>M({color:c,roughness:r,metalness:m});
  const palette={
   Pomni:{wall:0x202338,accent:0x9b344c,glow:0x9bc9ff},
   Ragatha:{wall:0x29243a,accent:0xb45a76,glow:0xffc2c9},
   Jax:{wall:0x201b31,accent:0x7041a0,glow:0xc7a0ff},
   Gangle:{wall:0x252333,accent:0xb33b58,glow:0xffa9c8},
   Caine:{wall:0x24172b,accent:0xb78a3b,glow:0xffd88a}
  }[who]||{wall:0x211c30,accent:0x8d5b9a,glow:0xb8dfff};
  const wall=mat(palette.wall),side=mat(0x171522),floor=mat(0x332b3b,.48),trim=mat(0x9a7446,.3,.72);
  const wood=mat(0x6c5144,.42),wood2=mat(0x98765a,.36),ivory=mat(0xc2b49c,.55),dark=mat(0x10151d,.28),screen=mat(palette.glow,.24),metal=mat(0x625b68,.32,.65);
  const W=3.65,H=2.9,D=4.4;
  const box=(x,y,z,w,h,dep,m)=>add(new THREE.BoxGeometry(w,h,dep),m,x,y,z,room);
  // Deep room shell: back wall, side walls and floor all sit behind the door plane.
  box(.675,-.09,-2.05,W,.14,D,floor);
  box(.675,1.43,-4.24,W,H,.12,wall);
  box(-1.18,1.43,-2.05,.12,H,D,side);
  box(2.53,1.43,-2.05,.12,H,D,side);
  box(.675,2.88,-2.05,W,.09,D,trim);
  box(.675,.02,-2.05,W,.07,D,trim);
  // Architectural depth: ceiling beams, skirting and warm wall panels.
  for(let x=-.95;x<2.5;x+=.72){
   box(x,2.66,-4.16,.035,.32,.035,trim);
   box(x,.55,-4.15,.48,.82,.035,mat(palette.accent,.78));
  }
  box(.675,2.30,-4.15,3.25,.035,.04,trim);
  // Desk against the back of the room, facing the entrance.
  box(.82,.98,-3.48,1.65,.12,.78,wood);
  box(.82,1.045,-3.48,1.69,.045,.82,wood2);
  for(const x of [.13,1.51]) for(const z of [-3.18,-3.78]) box(x,.48,z,.075,.92,.075,metal);
  // A detailed beige CRT, keyboard, mouse and a little stack of disks.
  box(.82,1.43,-3.66,.76,.62,.52,ivory);
  box(.82,1.44,-3.385,.61,.43,.035,dark);
  box(.82,1.44,-3.36,.55,.36,.012,screen);
  box(.82,1.105,-3.63,.19,.10,.17,ivory);
  box(.63,1.10,-3.03,.48,.035,.17,mat(0xb6aa98,.5));
  box(1.28,1.10,-3.03,.18,.035,.13,mat(0xd0c4b2,.5));
  // Chair and subtle character-specific wall art.
  box(.82,.58,-2.35,.58,.12,.55,mat(0x494054));
  box(.82,.96,-2.62,.55,.72,.14,mat(0x494054));
  box(1.98,1.88,-4.15,.46,.68,.045,mat(palette.accent));
  box(1.98,1.88,-4.115,.36,.56,.012,mat(0xeee0c9,.8));
  // Ceiling practicals and light from the CRT illuminate the model.
  const lamp=new THREE.PointLight(palette.glow,.75,5);lamp.position.set(.82,2.25,-3.15);room.add(lamp);
  const warm=new THREE.PointLight(0xffc27a,.32,4);warm.position.set(-.55,2.25,-2.1);room.add(warm);
  // Put the original character inside the room, facing the computer and the doorway.
  npc.position.set(.15,0,-2.30);npc.scale.setScalar(.66);
  npc.rotation.y=0;
  // Keep the room's visual scale and placement independent of the corridor.
  npc.userData.roomIdle=true;
  room.add(npc);
  d.room=room;
 }
 const guideMap={eq:'Pomni',nom:'Ragatha',mol:'Jax',maze:'Gangle',mem:'Ragatha',gue:'Jax',sym:'Pomni',name:'Ragatha',dat:'Jax',dnd:'Gangle',org:'Gangle',defense:'Jax'};
 const guides=[],npcHit=[];
 const npcLines={
  Pomni:['¡Oh! Hola… ¿lista para intentarlo?','Respira. Podemos resolverlo juntas.'],
  Ragatha:['¡Qué alegría verte! Vamos paso a paso.','No te preocupes, lo estás haciendo muy bien.'],
  Jax:['¿En serio necesitas ayuda con eso?','A ver, sorpréndeme.'],
  Gangle:['¡H-hola! Espero que este reto te guste.','¡Podemos hacerlo! Creo…'],
  Caine:['¡BIENVENIDA AL ESPECTÁCULO, HUMANA!','¡Un desafío químico extraordinariamente espectacular!']
 };
 function makeGuide(kind){
  const who=guideMap[kind]||kind||'Pomni',g=new THREE.Group();g.userData.npcName=who;
  const mat=(c,r=.48,m=0)=>M({color:c,roughness:r,metalness:m});
  const cream=mat(0xf6e9d9),skin=mat(0xf0c6ad),white=mat(0xfff8ed),black=mat(0x17121b,.24),shine=mat(0xffffff,.15),red=mat(0xc92742),blue=mat(0x3156bf),gold=mat(0xf5c34c,.28,.58),purple=mat(0x873db3),pink=mat(0xf0a5c5),hair=mat(0xb72c42),ribbon=mat(0xd52e4a),yellow=mat(0xf1c84b),teal=mat(0x48b8bd);
  const ell=(par,x,y,z,sx,sy,sz,ma,seg=24)=>{const o=add(new THREE.SphereGeometry(1,seg,Math.max(12,seg>>1)),ma,x,y,z,par);o.scale.set(sx,sy,sz);return o};
  const box=(par,x,y,z,sx,sy,sz,ma,bevel=0)=>{const o=add(new THREE.BoxGeometry(sx,sy,sz),ma,x,y,z,par);return o};
  const between=(par,a,b,r1,r2,ma,rad=14)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(B,A),o=add(new THREE.CylinderGeometry(r2,r1,d.length(),rad),ma,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,par);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o};
  const tube=(par,pts,r,ma)=>{const c=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v)));const o=new THREE.Mesh(new THREE.TubeGeometry(c,36,r,10,false),ma);par.add(o);return o};
  const head=new THREE.Group();head.position.y=2.05;g.add(head);
  const arms=[],legs=[];
  let torsoMat=red,faceMat=cream,bodyH=1.03,headW=.48,headH=.48;
  if(who==='Pomni'){
   torsoMat=mat(0xf3eee4);faceMat=cream;
   ell(g,0,1.05,0,.34,.55,.25,red);ell(g,-.17,1.05,.018,.18,.49,.255,red);ell(g,.17,1.05,.018,.18,.49,.255,blue);
   // cuello de volantes y cuello blanco
   for(let i=0;i<12;i++){let a=i*Math.PI*2/12;ell(g,Math.cos(a)*.27,1.48,Math.sin(a)*.19,.095,.12,.09,white,16)}
   ell(head,0,0,0,.43,.48,.35,cream);
   // capucha y gorro bicolor de bufón
   ell(head,0,.31,-.015,.47,.22,.37,red);
   const hL=add(new THREE.ConeGeometry(.22,.86,20),red,-.28,.73,0,head);hL.rotation.z=.30;
   const hR=add(new THREE.ConeGeometry(.22,.86,20),blue,.28,.73,0,head);hR.rotation.z=-.30;
   ell(head,-.53,1.14,0,.105,.105,.105,gold,16);ell(head,.53,1.14,0,.105,.105,.105,gold,16);
   // ojos grandes, pupilas y mejillas
   [-1,1].forEach((q)=>{ell(head,q*.17,.055,.315,.105,.17,.055,white);ell(head,q*.17,.04,.365,.047,.085,.025,black);ell(head,q*.155,.085,.389,.018,.025,.012,shine,12);ell(head,q*.29,-.17,.30,.075,.035,.02,pink,16)});
   tube(head,[[-.08,-.25,.325],[0,-.28,.34],[.08,-.25,.325]],.018,mat(0x8d3545));
   for(let i=0;i<2;i++)ell(g,0,1.3-i*.22,.27,.06,.06,.04,gold,16);
  }else if(who==='Ragatha'){
   torsoMat=blue;faceMat=skin;
   ell(g,0,1.05,0,.36,.53,.25,blue);
   // vestido acampanado
   const skirt=add(new THREE.CylinderGeometry(.29,.62,.62,32),mat(0x3156bf),0,.67,0,g);skirt.scale.z=.68;
   ell(g,0,1.42,.02,.35,.13,.27,white);
   ell(head,0,0,0,.43,.47,.34,skin);
   // cabello de estambre y mechones laterales
   ell(head,0,.31,-.025,.48,.24,.37,hair);
   for(let i=0;i<9;i++){const x=-.38+i*.095;ell(head,x,.22+Math.sin(i*.8)*.045,.28,.09,.20,.12,hair,16)}
   [-1,1].forEach(q=>{ell(head,q*.42,-.12,.02,.13,.37,.14,hair);for(let j=0;j<3;j++)ell(head,q*(.43+j*.025),-.28-j*.11,.035,.12,.13,.13,hair,16)});
   // ojos: uno de botón y otro normal
   ell(head,-.17,.035,.31,.09,.13,.04,white);ell(head,-.17,.035,.35,.045,.07,.02,black);
   ell(head,.17,.035,.31,.09,.13,.04,white);ell(head,.17,.035,.35,.045,.07,.02,black);
   ell(head,.17,.035,.372,.016,.02,.01,shine,12);
   // botón cosido en la mejilla y boca cosida
   ell(head,-.31,-.18,.29,.07,.07,.035,gold,16);for(let j=0;j<4;j++)ell(head,-.31+(j%2)*.04,-.18+Math.floor(j/2)*.04,.325,.009,.009,.008,black,8);
   for(let j=0;j<5;j++)between(head,[-.10+j*.05,-.25,.32],[-.07+j*.05,-.22,.325],.009,.009,red,6);
   ell(g,0,1.47,.20,.18,.11,.08,white);
  }else if(who==='Jax'){
   torsoMat=purple;faceMat=purple;
   ell(g,0,1.06,0,.29,.66,.24,purple);
   ell(head,0,0,0,.39,.45,.31,purple);
   // orejas largas, ligeramente curvadas
   const earL=ell(head,-.22,.69,-.015,.115,.62,.10,purple);earL.rotation.z=.10;
   const earR=ell(head,.22,.69,-.015,.115,.62,.10,purple);earR.rotation.z=-.10;
   ell(head,-.22,.68,.078,.055,.45,.025,pink);ell(head,.22,.68,.078,.055,.45,.025,pink);
   // ojos medio entornados y sonrisa burlona
   ell(head,-.15,.06,.285,.12,.105,.045,white);ell(head,.15,.06,.285,.12,.105,.045,white);
   ell(head,-.13,.04,.326,.045,.075,.022,mat(0xffd84c));ell(head,.17,.04,.326,.045,.075,.022,mat(0xffd84c));
   ell(head,-.13,.045,.345,.018,.035,.012,black);ell(head,.17,.045,.345,.018,.035,.012,black);
   tube(head,[[-.20,-.19,.27],[-.08,-.25,.32],[.08,-.25,.32],[.20,-.18,.27]],.022,black);
   // incisivos
   box(head,-.045,-.25,.326,.055,.09,.025,white);box(head,.045,-.25,.326,.055,.09,.025,white);
  }else if(who==='Gangle'){
   torsoMat=ribbon;faceMat=white;
   // cuerpo formado por cintas flexibles
   tube(g,[[0,1.55,0],[-.18,1.3,.02],[.12,1.05,.06],[-.12,.78,.08],[.04,.5,.08]],.085,ribbon);
   ell(head,0,0,0,.36,.39,.12,white);
   // máscara de comedia, con contorno y expresión
   ell(head,0,0,.09,.37,.40,.07,red);
   ell(head,0,0,.16,.32,.35,.06,white);
   [-1,1].forEach(q=>{ell(head,q*.13,.09,.215,.035,.055,.018,black,12);ell(head,q*.13,.105,.233,.012,.016,.008,shine,8)});
   tube(head,[[-.16,-.10,.21],[-.08,-.17,.23],[0,-.18,.23],[.08,-.17,.23],[.16,-.10,.21]],.018,black);
   // lazos y extremos de cinta
   tube(g,[[0,1.35,.02],[-.42,1.14,.10],[-.26,.91,.13],[.34,.72,.08]],.055,ribbon);
   tube(g,[[0,1.28,.02],[.42,1.10,.08],[.22,.86,.13],[-.35,.62,.09]],.055,ribbon);
   tube(g,[[-.02,.62,.08],[-.35,.42,.14],[-.15,.18,.16],[.25,.12,.13]],.05,ribbon);
   tube(g,[[.02,.62,.08],[.36,.43,.13],[.18,.2,.16],[-.22,.08,.13]],.05,ribbon);
   // manos pequeñas y puntas de cinta
   ell(g,-.35,.42,.14,.075,.07,.07,white,14);ell(g,.36,.43,.13,.075,.07,.07,white,14);
  }else if(who==='Caine'){
   torsoMat=red;faceMat=white;
   // frac rojo y pajarita
   ell(g,0,1.0,0,.36,.62,.25,red);ell(g,0,1.42,.05,.22,.16,.12,white);
   ell(g,-.10,1.48,.18,.12,.09,.08,red);ell(g,.10,1.48,.18,.12,.09,.08,red);ell(g,0,1.48,.23,.06,.06,.05,gold);
   // cabeza de dentadura flotante
   ell(head,0,0,0,.48,.43,.35,white);
   const jaw=ell(head,0,-.18,.22,.39,.20,.15,white);jaw.rotation.x=-.10;
   for(let i=0;i<8;i++){const x=-.30+i*.085;box(head,x,-.04,.32,.07,.14,.055,white);box(head,x,-.23,.34,.065,.10,.05,white)}
   [-1,1].forEach(q=>{ell(head,q*.17,.16,.27,.09,.11,.05,black);ell(head,q*.17,.17,.315,.025,.035,.015,shine,10)});
   // bastón / cilindro de director
   const cane=between(g,[.58,1.4,.02],[.78,.20,.04],.035,.035,gold,12);ell(g,.78,.16,.04,.07,.07,.07,red,16);
   // colas del frac
   const tail1=add(new THREE.ConeGeometry(.18,.68,16),red,-.22,.45,-.08,g);tail1.rotation.z=.25;
   const tail2=add(new THREE.ConeGeometry(.18,.68,16),red,.22,.45,-.08,g);tail2.rotation.z=-.25;
  }
  // extremidades con articulaciones separadas para animación
  if(who!=='Gangle'){
   const armMat=who==='Pomni'?red:who==='Ragatha'?skin:who==='Jax'?purple:red;
   const legMat=who==='Pomni'?blue:who==='Ragatha'?mat(0xe8d4c7):who==='Jax'?purple:red;
   [-1,1].forEach(side=>{
    const shoulder=new THREE.Group();shoulder.position.set(side*.34,1.35,0);g.add(shoulder);
    between(shoulder,[0,0,0],[side*.12,-.36,.02],.085,.075,armMat);
    ell(shoulder,side*.12,-.39,.02,.09,.10,.09,who==='Pomni'?white:armMat,16);
    between(shoulder,[side*.12,-.39,.02],[side*.17,-.72,.08],.075,.065,armMat);
    ell(shoulder,side*.17,-.76,.10,.11,.10,.09,who==='Pomni'?white:who==='Ragatha'?skin:armMat,16);
    arms.push(shoulder);
    const hip=new THREE.Group();hip.position.set(side*.16,.42,0);g.add(hip);
    between(hip,[0,0,0],[side*.02,-.30,.02],.095,.085,legMat);
    between(hip,[side*.02,-.30,.02],[side*.02,-.65,.08],.085,.075,legMat);
    ell(hip,side*.02,-.69,.17,.15,.09,.23,who==='Pomni'?black:who==='Jax'?purple:black,16);
    legs.push(hip);
   });
  }
  // nombre legible y aro de presencia discreto
  const label=document.createElement('canvas');label.width=320;label.height=80;const cx=label.getContext('2d');cx.fillStyle='rgba(16,7,27,.88)';cx.fillRect(5,5,310,70);cx.strokeStyle='#e7bd66';cx.lineWidth=3;cx.strokeRect(5,5,310,70);cx.fillStyle='#ffe7a8';cx.font='bold 32px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(who.toUpperCase(),160,41);
  const tex=new THREE.CanvasTexture(label);tex.encoding=THREE.sRGBEncoding;const tag=new THREE.Mesh(new THREE.PlaneGeometry(1.35,.34),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));tag.position.set(0,3.25,.04);g.add(tag);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.52,.018,8,36),M({color:0xe7bd66,metalness:.65,roughness:.28}));halo.rotation.x=Math.PI/2;halo.position.y=.035;g.add(halo);
  g.userData.anim={head,arms,legs,tag,halo,phase:Math.random()*6.28};
  // áreas invisibles de selección para hablar con cada personaje
  const target=add(new THREE.SphereGeometry(1.08,14,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,1.35,.05,g);target.userData.npcName=who;target.userData.kind=kind;npcHit.push(target);
  g.userData.anim={head,arms,legs,tag,halo,phase:Math.random()*6.28};
  // Sustituye el personaje geométrico de respaldo por el modelo original descargado.
  // Pomni/Ragatha son modelos estáticos; Jax/Caine conservan su esqueleto; Gangle usa el modelo estático estable.
  const modelKey={Pomni:'pomni',Ragatha:'ragatha',Jax:'jax',Gangle:'gangle',Caine:'caine'}[who];
  if(modelKey && window.THREE.GLTFLoader){
   const loader=new THREE.GLTFLoader();
   const attachModel=(gltf)=>{
    const keep=new Set([tag,halo,target]);
    [...g.children].forEach(ch=>{if(!keep.has(ch)){g.remove(ch);ch.traverse?.(o=>{if(o.geometry)o.geometry.dispose?.()})}});
    const holder=new THREE.Group();holder.name=who+'_original_model';holder.add(gltf.scene);g.add(holder);
    gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m.map){m.map.encoding=THREE.sRGBEncoding;m.map.needsUpdate=true}})}}});
    const bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const desiredHeight=who==='Caine'?2.72:2.58;
    const factor=desiredHeight/Math.max(size.y,0.001);holder.scale.setScalar(factor);
    holder.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
    // Mantiene una altura de etiqueta proporcionada al modelo real.
    tag.position.y=3.05;
    const bones=[];gltf.scene.traverse(o=>{if(o.isBone)bones.push({bone:o,base:o.rotation.clone(),name:(o.name||'').toLowerCase()})});
    g.userData.anim={tag,halo,phase:Math.random()*6.28,modelRoot:holder,bones,mixer:gltf.animations?.length?new THREE.AnimationMixer(gltf.scene):null};
    g.userData.modelLoaded=true;g.userData.modelKey=modelKey;
   };
   const fail=err=>{console.warn('Labstyle: no se pudo cargar el modelo '+modelKey,err)};
   // Descarga bajo demanda: solo cuando el usuario enfoca/abre la puerta de esta habitación.
   g.userData.loadModel=()=>{if(g.userData.modelLoaded||g.userData.modelLoading)return;g.userData.modelLoading=true;LabModels.get(modelKey).then(buf=>new Promise((ok,ko)=>loader.parse(buf.slice(0),'',ok,ko))).then(attachModel).catch(fail).then(()=>{g.userData.modelLoading=false})};
  }
  return g;
 }
 for(let k=0;k<K;k++){const zc=-(k+.5)*BAY;
  add(lampG,glass,0,H-.25,zc);add(rimG,brass,0,H-.25,zc).rotation.x=Math.PI/2;add(poolG,pmat,0,.006,zc).rotation.x=-Math.PI/2;
  [-1,1].forEach(s=>{const i=k-1,isDoor=i>=0&&i<n&&((i%2===0)===(s<0));
   if(isDoor){const door=mkDoor(i,s,zc,bs[i]);const npc=makeGuide(kindOf(bs[i].go));door.npc=npc;buildDoorRoom(door,npc.userData.npcName,npc);guides.push(npc)}
   else{const gr=new THREE.Group(),sc=rnd(.85,1.15);gr.position.set(s*(hw-.02),2.2,zc);gr.rotation.y=s<0?Math.PI/2:-Math.PI/2;S.add(gr);
    add(new THREE.BoxGeometry(1.7*sc,2.3*sc,.1),brass,0,0,.05,gr);add(new THREE.PlaneGeometry(1.5*sc,2.1*sc),M({map:art(),roughness:.2,metalness:0}),0,0,.103,gr)}})}
 {const bp=[],bc=[],cc=new THREE.Color();for(let k=0;k<=K;k++)for(let j=0;j<10;j++){const x=-hw+.35+j*(W-.7)/9,y=H-.5-.5*(1-Math.pow(x/(hw-.35),2));cc.set(pk(PAL));[[x-.16,y],[x+.16,y],[x,y-.34]].forEach(q=>{bp.push(q[0],q[1],-k*BAY+.3);bc.push(cc.r,cc.g,cc.b)})}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));S.add(new THREE.Mesh(bg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})))}
 add(new THREE.PlaneGeometry(W,H),M({color:0xC9238F,roughness:.9}),0,H/2,-L);
 add(new THREE.PlaneGeometry(2.2,3),BA({map:cvs(64,128,(x,w,h)=>{const q=x.createRadialGradient(32,80,4,32,80,80);q.addColorStop(0,'#FFF6C8');q.addColorStop(.55,'#FFB347');q.addColorStop(1,'#C2208F');x.fillStyle=q;x.fillRect(0,0,w,h)})}),0,1.5,-L+.02);
 add(new THREE.TorusGeometry(1.1,.16,12,32,Math.PI),frameM,0,3,-L+.05);[-1.1,1.1].forEach(x=>add(new THREE.BoxGeometry(.32,3,.32),frameM,x,1.5,-L+.05));
 /* --- remate escénico: terciopelo, marquesina y luces cálidas --- */
 const velvet=M({color:0x74112d,roughness:.92,side:THREE.DoubleSide});
 const velvetShade=M({color:0x3e071b,roughness:1,side:THREE.DoubleSide});
 const goldLine=M({color:0xf0bd55,metalness:.78,roughness:.28});
 const curtain=(x0,x1,shade)=>{
  const nx=28,ny=16,pos=[],uv=[],idx=[];
  for(let j=0;j<=ny;j++){
   const v=j/ny;
   for(let i=0;i<=nx;i++){
    const u=i/nx,fold=Math.sin(u*Math.PI*12);
    pos.push(x0+(x1-x0)*u,.08+v*2.92,-L+.035+fold*(.035+.035*v));
    uv.push(u,v);
   }
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;
   idx.push(a,c,b,b,c,d);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(idx);geo.computeVertexNormals();
  S.add(new THREE.Mesh(geo,shade?velvetShade:velvet));
 };
 curtain(-1.78,-.98,false);curtain(.98,1.78,false);
 /* pliegues dorados finos sobre el terciopelo */
 for(let side of [-1,1])for(let k=0;k<5;k++){
  const x=side*(1.02+k*.145),pts=[];
  for(let j=0;j<=12;j++){
   const v=j/12;pts.push(new THREE.Vector3(x+Math.sin(v*2.4)*.018,.12+v*2.82,-L+.085));
  }
  S.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),18,.009,5,false),goldLine));
 }
 /* bombillas de la marquesina */
 const bulbMat=M({color:0xffe5a0,emissive:0xffb52e,emissiveIntensity:2.1,roughness:.2});
 for(let i=0;i<=16;i++){
  const a=Math.PI*i/16,x=1.1*Math.cos(a),y=3+1.1*Math.sin(a);
  const b=add(new THREE.SphereGeometry(.047,12,8),bulbMat,x,y,-L+.12);
  b.scale.setScalar(i%2===0?1.08:.82);
 }
 /* placa central del escenario */
 const signTex=cvs(512,112,(x,w,h)=>{
  x.clearRect(0,0,w,h);x.fillStyle='#210719';x.fillRect(0,0,w,h);
  x.strokeStyle='#e8b84c';x.lineWidth=8;x.strokeRect(5,5,w-10,h-10);
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffe7a5';
  x.font='900 54px Georgia,serif';x.fillText('LABSTYLE ARCADE',w/2,h/2+2);
  x.shadowColor='#ffb52e';x.shadowBlur=18;x.fillText('LABSTYLE ARCADE',w/2,h/2+2);
 });
 signTex.colorSpace=THREE.SRGBColorSpace||signTex.colorSpace;
 add(new THREE.PlaneGeometry(1.9,.42),BA({map:signTex,transparent:true}),0,3.72,-L+.10);
 const stageGlow=new THREE.PointLight(0xffb34f,1.15,8,2);
 stageGlow.position.set(0,2.7,-L+1.3);S.add(stageGlow);

 // Caine recibe al jugador al final del pasillo; Bubble flota a su lado.
 const caine=makeGuide('Caine');caine.position.set(0,0,-L+1.25);caine.scale.setScalar(.82);S.add(caine);guides.push(caine);
 const bubble=new THREE.Group();bubble.position.set(.95,2.1,-L+1.45);S.add(bubble);
 const bubMat=M({color:0xf7f4ff,roughness:.12,metalness:.05,transparent:true,opacity:.82});
 const bub=add(new THREE.SphereGeometry(.23,24,16),bubMat,0,0,0,bubble);bub.scale.set(1,1.12,.9);
 const bubEye=M({color:0x20142a,roughness:.25});[-1,1].forEach(q=>add(new THREE.SphereGeometry(.025,10,8),bubEye,q*.075,.035,.205,bubble));
 const bubMouth=add(new THREE.TorusGeometry(.055,.012,6,16,Math.PI),bubEye,0,-.055,.205,bubble);bubMouth.rotation.z=Math.PI;
 /* Fin del elenco principal */
 const _dT=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
 const _dp=new Float32Array(480);for(let i=0;i<160;i++){_dp[i*3]=(Math.random()-.5)*(W-1);_dp[i*3+1]=.3+Math.random()*(H-.6);_dp[i*3+2]=-Math.random()*len}
 const _dg=new THREE.BufferGeometry();_dg.setAttribute('position',new THREE.BufferAttribute(_dp,3));const _dust=new THREE.Points(_dg,new THREE.PointsMaterial({size:.15,map:_dT,color:0xFFE6B0,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));S.add(_dust);
 const ray=new THREE.Raycaster(),pm2=new THREE.Vector2();let mx=0,my=0,hov=null,curZ=zS,id=0,pCur=0,lastS=performance.now()+1000,fd=null,fb=0,lastT=0,curI=0,sx=0,sy=0,pe=null,ln=0;
 const pick=e=>{const r=cv.getBoundingClientRect();pm2.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(pm2,cam);const h=ray.intersectObjects(hit,false);return h.length?h[0].object.userData.d:null};
 cv.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=-(e.clientY/innerHeight-.5)*2;pe=e});
 cv.addEventListener('click',e=>{const d=pick(e);if(d){bs[d.i].act();return}ray.setFromCamera(pm2,cam);const nh=ray.intersectObjects(npcHit,false);if(nh.length){const who=nh[0].object.userData.npcName,lines=npcLines[who]||['¡Hola!'];hint.textContent=lines[Math.floor(Math.random()*lines.length)];hint.style.opacity=1;lastS=performance.now();}});
 const doorP=i=>{const z=-(i+1.5)*BAY+ZO;return clamp((zS-z)/(zS-zEnd),0,1)};
 const hint=document.createElement('span');hint.className='hint';const HT=(a,b)=>(typeof LANG!=='undefined'&&LANG==='en')?a:b;
 hint.textContent=HT('Scroll to walk the hallway ↓','Desliza para recorrer el pasillo ↓');g.appendChild(hint);
 bs.forEach((b,i)=>{const d=doors[i];
  b.act=()=>{if(busy)return;
   if(d.npc&&d.npc.userData.loadModel)d.npc.userData.loadModel();
   if(fd!==d){fd=d;d.lockV=.55;hint.textContent=HT('Click again to enter','Toca otra vez para entrar');return}
   busy=1;d.lockV=1;hint.style.opacity=0;(rm?(f=>f()):(f=>pomni(d.kind,f,d.i)))(()=>sheet(b.ic,b.tt,b.sp,b.go,()=>{d.lockV=0;fd=null;busy=0;hint.textContent=HT('Scroll to walk the hallway ↓','Desliza para recorrer el pasillo ↓')}))};
  b.el.addEventListener('focus',()=>{hov=d;const top=scrollY+w.getBoundingClientRect().top;scrollTo({top:top+doorP(i)*span,behavior:rm?'auto':'smooth'});setTimeout(()=>{if(hov===d)hov=null},1600)});
  b.el.addEventListener('click',e=>{e.preventDefault();b.act()})});
 addEventListener('scroll',()=>lastS=performance.now(),{passive:true});
 addEventListener('keydown',e=>{const k={ArrowDown:1,PageDown:1,ArrowUp:-1,PageUp:-1}[e.key];if(!k||busy||!w.isConnected||document.querySelector('.dr-ovl,.modal'))return;e.preventDefault();const pr=clamp(-w.getBoundingClientRect().top/span,0,1);scrollTo({top:scrollY+(doorP(clamp(curI+k,0,n-1))-pr)*span,behavior:rm?'auto':'smooth'})});
 const fit=()=>{const a=innerWidth/innerHeight;R.setSize(innerWidth,innerHeight,false);cam.aspect=a;cam.fov=a<1?80:64;cam.updateProjectionMatrix()};fit();addEventListener('resize',fit);
 const t0=performance.now();
 function loop(now){if(!w.isConnected){cancelAnimationFrame(id);removeEventListener('resize',fit);R.dispose();return}id=requestAnimationFrame(loop);
  const T=(now-t0)/1000,_dz=(_dust.position.y=Math.sin(now/2400)*.1,_dust.rotation.y=Math.sin(now/9000)*.03),praw=clamp(-w.getBoundingClientRect().top/span,0,1);
  /* Sin scroll, la cámara se alinea sola con la puerta más cercana */
  if(now-lastS>180&&!fd){let best=0,bd=9;for(let i=0;i<n;i++){const dd=Math.abs(doorP(i)-praw);if(dd<bd){bd=dd;best=i}}
   const tg=doorP(best);if(Math.abs(tg-praw)>.004&&!rm){scrollTo({top:scrollY+(tg-praw)*span,behavior:'smooth'});lastS=now-100}}
  pCur+=(praw-pCur)*(rm?1:.07);
  const zT=zS+(zEnd-zS)*pCur;curZ+=(zT-curZ)*(rm?1:.2);
  fb+=((fd?1:0)-fb)*(rm?1:.07);
  const bob=rm||fd?0:Math.sin(T*1.6)*.025;
  sx+=(mx-sx)*.05;sy+=(my-sy)*.05;if(pe&&++ln%3===0){hov=pick(pe);cv.style.cursor=hov?'pointer':''}
  let nd=0,nb=9;for(let i=0;i<n;i++){const q=Math.abs(doorP(i)-pCur);if(q<nb){nb=q;nd=i}}curI=nd;
  const td=fd||doors[nd],sm=t=>t*t*(3-2*t),ff=rm?(nb<.01?1:0):1-sm(clamp((nb/(.5*BAY/(zS-zEnd))-.15)/.85,0,1)),fc=Math.max(fb,ff);
  const px=(sx*.12)*(1-fc)+(-td.s*1.1+sx*.25)*fc,pz=curZ+(td.z+ZO-curZ)*fb,pY=1.65+bob;
  cam.position.set(px,pY,pz);
  cam.lookAt((sx*.5)*(1-fc)+td.s*hw*fc,(1.5+sy*.2)*(1-fc)+(1.45+sy*.12)*fc,(curZ-8)*(1-fc)+td.z*fc);
  L1.position.set(0,H-.7,pz-1.2);L2.position.set(0,H-.7,pz-7.5);
  doors.forEach(d=>{const tv=d.lockV||(hov===d?.12:0);d.open+=(tv-d.open)*(rm?1:.12);d.pv.rotation.y=-d.open*1.75;
   if(d.open>.04){circ(d.pc,d.kind,T);d.ptx.needsUpdate=true}});
  guides.forEach((npc,j)=>{const a=npc.userData.anim||{},ph=(a.phase||0)+T*(npc.userData.npcName==='Jax'?.82:1.15);npc.position.y=Math.sin(ph*.55)*.006;npc.rotation.y=Math.sin(ph*.24+j*.23)*.012;if(a.modelRoot){a.modelRoot.rotation.y=Math.sin(ph*.22+j*.3)*.008;a.modelRoot.rotation.z=Math.sin(ph*.30)*.004;if(a.bones)a.bones.forEach((v,i)=>{const n=v.name,amp=n.includes('head')||n.includes('neck')?.018:n.includes('arm')||n.includes('shoulder')?.012:n.includes('spine')||n.includes('chest')?.008:0;if(amp){v.bone.rotation.x=v.base.x+Math.sin(ph*(n.includes('head')?1.1:.8)+i)*amp;v.bone.rotation.z=v.base.z+Math.sin(ph*.9+i)*amp*.7}});if(a.mixer)a.mixer.update(.016)}else{if(a.head){a.head.rotation.y=Math.sin(ph*.58)*.12;a.head.rotation.z=Math.sin(ph*.83)*.035}if(a.arms)a.arms.forEach((v,i)=>{v.rotation.z=Math.sin(ph*1.25+i*Math.PI)*.13;v.rotation.x=Math.sin(ph*.8+i)*.07});if(a.legs)a.legs.forEach((v,i)=>{v.rotation.x=Math.sin(ph*1.25+i*Math.PI)*.055})}if(a.tag)a.tag.quaternion.copy(cam.quaternion);if(a.halo)a.halo.rotation.z=ph*.18});bubble.position.y=2.1+Math.sin(T*1.7)*.12;bubble.rotation.z=Math.sin(T*.9)*.08;
  R.render(S,cam)}
 loop(t0);return true}
function hall(g){
 const els=[...g.children].filter(e=>e.classList&&e.classList.contains('btn'));g.dataset.h=1;if(els.length<3||!window.THREE)return;
 const bs=els.map(b=>({el:b,go:b.getAttribute('onclick')||'',ic:(b.querySelector('.ico')||{}).textContent||'🚪',tt:(b.querySelector('b')||{}).textContent||'',sp:[...b.querySelectorAll('span')].filter(x=>!x.classList.contains('ico')).map(x=>x.textContent).join(' ')}));
 const n=bs.length,travel=5.5-(-(n+.5)*BAY+ZO),px=Math.round(travel*120),w=document.createElement('div');w.className='hall';w.style.height='calc(100dvh + '+px+'px)';
 g.parentNode.insertBefore(w,g);w.appendChild(g);
 if(!build(g,bs,w,Math.max(1,px))){w.parentNode.insertBefore(g,w);w.remove();return}
 els.forEach(b=>b.removeAttribute('onclick'))}
const root=document.getElementById('app');
new MutationObserver(()=>{const g=root.querySelector('.grid:not([data-h])');if(g)hall(g)}).observe(root,{childList:true,subtree:true});
})();
;
/* ---------- Fondo de circo por pantalla ---------- */
(function(){const B=document.body,A=document.getElementById('app');if(!A)return;const M=k=>k==='org'?1:/^(gue|sym|name|dat|nom|dnd|tab)$/.test(k)?2:k==='mito'?3:k==='mem'?4:5;
const up=()=>{let k='';try{k=S.kind}catch(e){}if(A.querySelector('.hudbar'))B.dataset.cbg=M(k);else if(A.querySelector('.homewrap'))B.dataset.cbg=6;else if(k&&A.querySelector('.card'))B.dataset.cbg=M(k);else delete B.dataset.cbg};new MutationObserver(up).observe(A,{childList:true});up();
addEventListener('pointermove',e=>{B.style.setProperty('--px',(e.clientX/innerWidth-.5).toFixed(3));B.style.setProperty('--py',(e.clientY/innerHeight-.5).toFixed(3))},{passive:true})})();
