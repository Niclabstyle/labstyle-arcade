/* Labstyle · íconos 3D (reemplazan emojis) */
(function(){
const C={Y:['#FFE45C','#F5A300'],O:['#FFB35C','#E8590C'],R:['#FF7A8A','#C81D3D'],B:['#8FD3FF','#2F7BE0'],G:['#7CF0C0','#16A37A'],P:['#E9B6FF','#9B3CE0'],K:['#D5DBEE','#6B7595'],I:['#8E8BFF','#3A2FB8'],M:['#FFB3D1','#E0467F'],C:['#8CF1FF','#14A3C7'],Au:['#FFF0A0','#D49A00'],Ag:['#F4F6FB','#97A0BC'],Br:['#F2B880','#A8541C']};
const T=(t,s)=>'<text x="32" y="43" text-anchor="middle" font-family="Bricolage Grotesque,Arial,sans-serif" font-weight="800" font-size="'+(s||28)+'">'+t+'</text>';
const S=(d)=>'<path d="'+d+'"/>';
const L=(d,w)=>'<path d="'+d+'" fill="none" stroke="#fff" stroke-width="'+(w||5)+'" stroke-linecap="round" stroke-linejoin="round"/>';
const G={
'⚡':['Y',S('M36 9 19 36h11l-4 19 19-27H34z')],'🔥':['R',S('M32 9c3 11 14 14 14 29a14 14 0 0 1-28 0c0-8 5-12 8-19 1 5 4 7 6 8 0-6-1-12 0-18z')],
'💧':['B',S('M32 9c10 14 16 22 16 30a16 16 0 0 1-32 0c0-8 6-16 16-30z')],'🥇':['Au',T('1')],'🥈':['Ag',T('2')],'🥉':['Br',T('3')],
'🧪':['C',S('M26 10h12v14l12 23a4 4 0 0 1-4 7H18a4 4 0 0 1-4-7l12-23z')],'✅':['G',L('M18 33l10 10 19-22',7)],
'🫧':['C','<circle cx="26" cy="38" r="10"/><circle cx="42" cy="26" r="7"/><circle cx="40" cy="45" r="5"/>'],
'🎯':['R','<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="13" fill="#C81D3D"/><circle cx="32" cy="32" r="6"/>'],
'🧴':['M','<rect x="24" y="8" width="16" height="9" rx="2"/><rect x="18" y="17" width="28" height="38" rx="9"/>'],
'💌':['M','<rect x="12" y="19" width="40" height="28" rx="4"/>'+L('M14 22l18 14 18-14','#E0467F'.length&&4).replace('#fff','#E0467F')],
'💪':['O','<rect x="10" y="28" width="44" height="8" rx="3"/><rect x="12" y="19" width="9" height="26" rx="3"/><rect x="43" y="19" width="9" height="26" rx="3"/>'],
'💡':['Y','<circle cx="32" cy="26" r="15"/><rect x="25" y="41" width="14" height="9" rx="3"/>'],
'🔇':['K',S('M14 26h9l12-9v30l-12-9h-9z')+L('M42 25l12 14M54 25 42 39',4)],'🔊':['K',S('M12 26h9l12-9v30l-12-9h-9z')+L('M41 25c5 4 5 10 0 14M47 19c9 7 9 19 0 26',4)],
'📤':['B','<rect x="14" y="36" width="36" height="16" rx="3"/>'+L('M32 32V10M23 19l9-9 9 9',5)],'📋':['P','<rect x="16" y="12" width="32" height="42" rx="5"/><rect x="25" y="8" width="14" height="9" rx="3"/>'+L('M23 30h18M23 40h18',4).replace('#fff','#9B3CE0')],
'❌':['R',L('M20 20l24 24M44 20 20 44',7)],'🌈':['I',L('M10 44a22 22 0 0 1 44 0',5).replace('#fff','#FF5C70')+L('M17 44a15 15 0 0 1 30 0',5).replace('#fff','#FFE45C')+L('M24 44a8 8 0 0 1 16 0',5).replace('#fff','#5EE0B5')],
'🔬':['P','<rect x="26" y="8" width="11" height="26" rx="3" transform="rotate(28 32 21)"/>'+L('M22 52h24M40 42a12 12 0 0 1-14 4',5)],
'🧊':['C',S('M32 9l20 11v24L32 55 12 44V20z')+L('M12 20l20 11 20-11M32 31v24',2).replace('#fff','#14A3C7')],
'🗺':['G',S('M10 18l15-6 14 6 15-6v34l-15 6-14-6-15 6z')+L('M25 12v34M39 18v34',2).replace('#fff','#16A37A')],
'👀':['B','<ellipse cx="22" cy="32" rx="10" ry="14"/><ellipse cx="42" cy="32" rx="10" ry="14"/><circle cx="24" cy="35" r="5" fill="#1B1E4B"/><circle cx="40" cy="35" r="5" fill="#1B1E4B"/>'],
'🎉':['M',S('M12 54l10-30 20 20z')+'<circle cx="40" cy="16" r="3"/><circle cx="52" cy="28" r="3"/><circle cx="30" cy="12" r="2.5"/>'],
'💀':['K','<path d="M32 10c-12 0-18 8-18 18 0 7 4 10 7 12v8h22v-8c3-2 7-5 7-12 0-10-6-18-18-18z"/><circle cx="25" cy="30" r="5" fill="#1B1E4B"/><circle cx="39" cy="30" r="5" fill="#1B1E4B"/>'],
'🏆':['Au',S('M20 10h24v14a12 12 0 0 1-24 0z')+L('M20 14h-8c0 9 4 13 9 13M44 14h8c0 9-4 13-9 13M32 36v10M22 54h20',4)],
'🎪':['R',S('M32 8 10 28h44z')+'<rect x="14" y="28" width="36" height="24"/><path d="M32 8 24 28h16z" fill="#FFE45C"/>'],
'🐞':['R','<circle cx="32" cy="36" r="18"/><circle cx="32" cy="16" r="8" fill="#1B1E4B"/><circle cx="25" cy="34" r="4" fill="#1B1E4B"/><circle cx="39" cy="34" r="4" fill="#1B1E4B"/><circle cx="32" cy="46" r="3" fill="#1B1E4B"/>'],
'📚':['I','<rect x="12" y="38" width="40" height="12" rx="3"/><rect x="16" y="24" width="36" height="12" rx="3"/><rect x="12" y="10" width="38" height="12" rx="3"/>'],
'🙂':['Y','<circle cx="23" cy="26" r="3.5" fill="#1B1E4B"/><circle cx="41" cy="26" r="3.5" fill="#1B1E4B"/>'+L('M19 38c6 9 20 9 26 0',4).replace('#fff','#1B1E4B')],
'⭐':['Y',S('M32 8l7 16 17 2-13 11 4 17-15-9-15 9 4-17L8 26l17-2z')],'🌙':['I',S('M42 10a22 22 0 1 0 12 30A18 18 0 0 1 42 10z')],
'🏷':['G',S('M10 12h24l20 20-22 22L12 34z')+'<circle cx="22" cy="23" r="4" fill="#16A37A"/>'],'🧭':['C','<circle cx="32" cy="32" r="21" fill="none" stroke="#fff" stroke-width="5"/>'+S('M42 22 36 36 22 42l6-14z')],
'🕵':['K',S('M16 30h32l-4-16H20z')+'<rect x="8" y="30" width="48" height="6" rx="3"/><rect x="14" y="42" width="15" height="9" rx="4"/><rect x="35" y="42" width="15" height="9" rx="4"/>'],
'🔤':['P',T('Ab',26)],'🔍':['B','<circle cx="27" cy="27" r="15" fill="none" stroke="#fff" stroke-width="6"/>'+L('M38 38l14 14',8)],
'🧮':['Br','<rect x="12" y="12" width="40" height="40" rx="4" fill="none" stroke="#fff" stroke-width="4"/>'+L('M12 24h40M12 38h40',2)+'<circle cx="24" cy="24" r="4"/><circle cx="38" cy="38" r="4"/><circle cx="30" cy="38" r="4"/>'],
'🧩':['G',S('M14 18h14a6 6 0 1 1 12 0h10v12a6 6 0 1 0 0 12v10H14z')],'🧂':['Ag','<rect x="20" y="20" width="24" height="34" rx="6"/><rect x="20" y="10" width="24" height="10" rx="5" fill="#97A0BC"/>'],
'🧵':['M','<rect x="16" y="12" width="32" height="40" rx="6"/>'+L('M16 24h32M16 40h32',3).replace('#fff','#E0467F')],
'🔄':['C',L('M46 24a16 16 0 0 0-28 4M18 40a16 16 0 0 0 28-4',6)+S('M50 12v16H34zM14 52V36h16z')],
'🍸':['P',S('M10 12h44L32 36z')+L('M32 36v16M22 54h20',5)],'💍':['Au','<circle cx="32" cy="38" r="16" fill="none" stroke="#fff" stroke-width="6"/>'+S('M32 6l9 9-9 9-9-9z').replace('<path','<path fill="#8CF1FF"')],
'🧫':['G','<ellipse cx="32" cy="38" rx="22" ry="12"/><ellipse cx="32" cy="32" rx="22" ry="12" fill="#CFF9E6"/><circle cx="26" cy="32" r="3" fill="#16A37A"/><circle cx="38" cy="30" r="2.5" fill="#16A37A"/>'],
'🍋':['Y','<ellipse cx="32" cy="34" rx="22" ry="15" transform="rotate(-18 32 34)" fill="#fff"/>'],'🧠':['M','<circle cx="22" cy="28" r="12"/><circle cx="40" cy="26" r="12"/><circle cx="32" cy="40" r="12"/>'],
'🐘':['K','<circle cx="30" cy="30" r="17"/><path d="M42 36c10 0 10 14 2 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'],
'🪶':['C',S('M50 10C26 12 14 28 14 50c14-2 30-14 36-40z')+L('M14 50 38 26',2).replace('#fff','#14A3C7')],'🌡':['R','<rect x="26" y="8" width="12" height="32" rx="6"/><circle cx="32" cy="46" r="11"/>'],
'🚪':['Br','<rect x="16" y="8" width="32" height="48" rx="5"/><circle cx="41" cy="33" r="3" fill="#1B1E4B"/>']
};
const CLAP='<g transform="rotate(-16 24 40)"><rect x="14" y="20" width="21" height="34" rx="10.5" fill="#FFE45C" stroke="#B8730A" stroke-width="1.5"/><path d="M19 28C19 24 22 22 24 22" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"/></g><g transform="rotate(16 40 40)"><rect x="29" y="20" width="21" height="34" rx="10.5" fill="#FFB35C" stroke="#B8730A" stroke-width="1.5"/><path d="M34 28C34 24 37 22 39 22" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".6"/></g><path d="M32 3V11M16 7L21 14M48 7L43 14M8 20L15 23M56 20L49 23" stroke="#FFD84D" stroke-width="3.4" stroke-linecap="round"/>';
const DEFS='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+Object.keys(C).map(k=>'<radialGradient id="ag-'+k+'" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="'+C[k][0]+'"/><stop offset="1" stop-color="'+C[k][1]+'"/></radialGradient>').join('')+'</defs></svg>';
const CSS='.ai{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.25em;line-height:1}.ai svg{width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 2px 1.5px rgba(10,15,40,.35))}';
const RE=/(?:[\u{1F300}-\u{1FAFF}\u26A1\u2B50\u2705\u274C])\uFE0F?/gu;
function svg(e){
 if(e==='👏')return '<svg viewBox="0 0 64 64">'+CLAP+'</svg>';
 const g=G[e]||['I',S('M32 9l7 16 17 2-13 11 4 17-15-9-15 9 4-17L8 26l17-2z')],k=g[0];
 return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29.5" fill="url(#ag-'+k+')" stroke="#1B1E4B" stroke-width="2.6"/><path d="M12 38a21 21 0 0 0 40 0 24 24 0 0 1-40 0z" fill="#000" opacity=".12"/><ellipse cx="23" cy="16" rx="13" ry="7" fill="#fff" opacity=".5" transform="rotate(-24 23 16)"/><g fill="#fff" stroke="#1B1E4B" stroke-width="2" stroke-linejoin="round" transform="translate(32 33) scale(.62) translate(-32 -32)">'+g[1]+'</g></svg>';
}
function prep(d){if(d.__ai)return;d.__ai=1;const s=d.createElement('style');s.textContent=CSS;d.head.appendChild(s);const h=d.createElement('div');h.innerHTML=DEFS;d.body.appendChild(h.firstChild)}
function run(d){
 if(!d||!d.body)return;prep(d);
 const w=d.createTreeWalker(d.body,4,{acceptNode:n=>{const p=n.parentElement;return p&&!p.closest('.ai,script,style,textarea,title,option,noscript')&&(RE.lastIndex=0,RE.test(n.nodeValue))?1:2}}),a=[];let n;while(n=w.nextNode())a.push(n);
 a.forEach(n=>{const t=n.nodeValue,f=d.createDocumentFragment();let i=0,m;RE.lastIndex=0;
  while(m=RE.exec(t)){if(m.index>i)f.appendChild(d.createTextNode(t.slice(i,m.index)));const s=d.createElement('span');s.className='ai';s.setAttribute('role','img');s.setAttribute('aria-label',m[0].replace('\uFE0F',''));s.innerHTML=svg(m[0].replace('\uFE0F',''));f.appendChild(s);i=m.index+m[0].length}
  if(i<t.length)f.appendChild(d.createTextNode(t.slice(i)));n.parentNode.replaceChild(f,n)});
}
let q=0;const go=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;run(document);try{const f=document.getElementById('ldf');f&&f.contentDocument&&run(f.contentDocument)}catch(e){}})};
const init=()=>{go();new MutationObserver(go).observe(document.body,{childList:true,subtree:true,characterData:true});setInterval(go,900)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
window.labIcons={run,svg};
})();
