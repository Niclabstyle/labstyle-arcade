/* Labstyle Arcade · js/landing.js — lógica de la portada (matraz 3D, agitar, elegir acto) */
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const V=THREE.Vector3,V2=THREE.Vector2,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(),COL=['--c1','--c2','--c3'].map(v=>{const c=new THREE.Color(css(v));return[c.r,c.g,c.b]}),R=y=>y<.1?1.36:1.44-(y-.1)*.44;
function liquid(h,m,PL){PL=PL||COL;const pts=[new V2(0,.06)];for(let i=0;i<=24;i++){const y=.06+(h-.06)*i/24;pts.push(new V2(R(y),y))}pts.push(new V2(0,h));
 const g=new THREE.LatheGeometry(pts,40),P=g.attributes.position,c=[];
 for(let i=0;i<P.count;i++){const t=clamp(P.getY(i)/Math.max(h,.5),0,1),s=clamp((t-.35)/.5,0,1);
  for(let k=0;k<3;k++){const b=PL[0][k]+(PL[1][k]-PL[0][k])*s;c.push(b+(PL[2][k]-b)*m)}}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g}
function build(el){let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){el.textContent='Tu navegador no soporta 3D.';return null}
 r.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(r.domElement);
 const s=new THREE.Scene(),c=new THREE.PerspectiveCamera(38,1,.1,100);
 s.add(new THREE.AmbientLight(0xffffff,.48));const d=new THREE.DirectionalLight(0xffe7cf,1.05);d.position.set(4,8,6);s.add(d);
 const d2=new THREE.DirectionalLight(0x9e9bff,.32);d2.position.set(-5,3,-4);s.add(d2);
 const out=[[0,0],[1.4,0],[1.5,.1],[.4,2.6],[.4,3.5],[.52,3.6]].map(a=>new V2(a[0],a[1]));
 const gl=new THREE.Mesh(new THREE.LatheGeometry(out,48),new THREE.MeshPhongMaterial({color:0xcfe9ff,transparent:true,opacity:.34,shininess:120,side:THREE.DoubleSide,depthWrite:false}));gl.renderOrder=2;s.add(gl);{const ink=css("--ink"),lm=new THREE.LineBasicMaterial({color:ink,transparent:true,opacity:.7});out.forEach(p=>{const q=[];for(let k=0;k<=56;k++){const t=k/56*Math.PI*2;q.push(new V(p.x*Math.cos(t),p.y,p.x*Math.sin(t)))}s.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(q),lm))});for(let k=0;k<8;k++){const t=k/8*Math.PI*2;s.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(out.map(p=>new V(p.x*Math.cos(t),p.y,p.x*Math.sin(t)))),lm))}}
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,.12,48),new THREE.MeshPhongMaterial({color:css('--c2')}));disc.position.y=-.07;s.add(disc);
 const liq=new THREE.Mesh(liquid(1,0),new THREE.MeshPhongMaterial({vertexColors:true,shininess:80,transparent:true,opacity:.93,side:THREE.DoubleSide}));s.add(liq);
 const o={s,c,r,R:13,ly:2.6,vis:true,set(h,m){liq.geometry.dispose();liq.geometry=liquid(Math.max(.07,h),m,o.pal)},cam(th,y){c.position.set(o.R*Math.sin(th),y,o.R*Math.cos(th));c.lookAt(0,o.ly,0)}};
 const fit=()=>{const w=el.clientWidth,h=el.clientHeight;r.setSize(w,h,false);c.aspect=w/h;c.updateProjectionMatrix();o.dirty=1};new ResizeObserver(fit).observe(el);fit();
 new IntersectionObserver(e=>o.vis=e[0].isIntersecting).observe(el);return o}
/* ===== Titulación en el circo digital: matraz Erlenmeyer real, bureta, pilares dorados, carpa y luces ===== */
function titr(el){
 const Q=THREE,V3=Q.Vector3,PI=Math.PI,S=Math.sin,Cs=Math.cos,R=Math.random,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 let r;try{r=new Q.WebGLRenderer({antialias:true,alpha:true})}catch(e){el.textContent='Tu navegador no soporta 3D.';return null}
 r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0x12050c);el.appendChild(r.domElement);
 const s=new Q.Scene(),c=new Q.PerspectiveCamera(34,1,.1,220);s.background=new Q.Color(0x12050c);s.fog=new Q.FogExp2(0x12050c,.0105);
 const mkc=(w,h,f,rep)=>{const k=document.createElement('canvas');k.width=w;k.height=h;f(k.getContext('2d'),w,h);const t=new Q.CanvasTexture(k);t.anisotropy=4;if(rep){t.wrapS=t.wrapT=Q.RepeatWrapping}return t};
 const soft=mkc(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
 /* entorno para reflejos metálicos y de vidrio */
 const env=mkc(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a0a2e');g.addColorStop(.5,'#74302a');g.addColorStop(1,'#1c0912');x.fillStyle=g;x.fillRect(0,0,w,h);
  [[.12,.32,'#ffd98a',70],[.38,.22,'#ff4fd8',60],[.62,.3,'#fff0c0',80],[.86,.34,'#4fd8ff',60],[.5,.58,'#ffb347',100],[.25,.7,'#a24bd8',70]].forEach(a=>{const gg=x.createRadialGradient(a[0]*w,a[1]*h,0,a[0]*w,a[1]*h,a[3]);gg.addColorStop(0,a[2]);gg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gg;x.fillRect(0,0,w,h)})});
 env.mapping=Q.EquirectangularReflectionMapping;
 const GOLD=new Q.MeshStandardMaterial({color:0xe3a83a,metalness:1,roughness:.26,envMap:env,envMapIntensity:1.25}),
  PURP=new Q.MeshStandardMaterial({color:0x9a45dc,metalness:.35,roughness:.22,envMap:env,envMapIntensity:1}),
  RED=new Q.MeshStandardMaterial({color:0xe0243f,metalness:.2,roughness:.3,envMap:env,envMapIntensity:.8});
 const add=(g,m,x,y,z,p)=>{const o=new Q.Mesh(g,m);o.position.set(x||0,y||0,z||0);(p||s).add(o);return o};
 const spr=(col,sc,op,x,y,z,p)=>{const o=new Q.Sprite(new Q.SpriteMaterial({map:soft,color:col,blending:Q.AdditiveBlending,transparent:true,depthWrite:false,opacity:op}));o.position.set(x||0,y||0,z||0);o.scale.set(sc,sc,1);(p||s).add(o);return o};
 /* --- carpa: telón a rayas, suelo de pista y luces de feria --- */
 const tent=mkc(1024,512,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#c8902a':'#8a1329';x.fillRect(i*w/16,0,w/16,h);const g=x.createLinearGradient(i*w/16,0,(i+1)*w/16,0);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(.5,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=g;x.fillRect(i*w/16,0,w/16,h)}
  const v=x.createLinearGradient(0,0,0,h);v.addColorStop(0,'rgba(10,2,8,.85)');v.addColorStop(.45,'rgba(10,2,8,.1)');v.addColorStop(1,'rgba(10,2,8,.9)');x.fillStyle=v;x.fillRect(0,0,w,h)},1);tent.wrapS=Q.RepeatWrapping;tent.repeat.set(2,1);
 add(new Q.CylinderGeometry(46,46,70,48,1,true),new Q.MeshBasicMaterial({map:tent,side:Q.BackSide,fog:false}),0,26,0);
 const floorT=mkc(1024,1024,(x,w,h)=>{x.translate(w/2,h/2);for(let i=0;i<32;i++){x.fillStyle=i%2?'#6a1424':'#b27a22';x.beginPath();x.moveTo(0,0);x.arc(0,0,w,i/32*PI*2,(i+1)/32*PI*2);x.fill()}
  const g=x.createRadialGradient(0,0,0,0,0,w/2);g.addColorStop(0,'rgba(255,200,230,.55)');g.addColorStop(.18,'rgba(255,150,200,.12)');g.addColorStop(.55,'rgba(8,2,8,.6)');g.addColorStop(1,'rgba(8,2,8,.97)');x.fillStyle=g;x.fillRect(-w/2,-h/2,w,h)});
 const fl=add(new Q.CircleGeometry(40,64),new Q.MeshBasicMaterial({map:floorT}),0,0,0);fl.rotation.x=-PI/2;
 /* luces de feria: bombillas que titilan sobre cables */
 const NB=84,bp=new Float32Array(NB*3),bc=new Float32Array(NB*3),BCOL=[[1,.3,.4],[1,.85,.3],[.4,1,.6],[.45,.7,1],[1,.4,.95]],bph=[];
 for(let i=0;i<NB;i++){const row=i%3,a=-PI*.95+(i/NB)*PI*1.9,rad=30+row*2,sag=Math.sin(((i*3/NB)%1)*PI)*-2.2;bp[i*3]=Math.sin(a)*rad;bp[i*3+1]=9+row*4.2+sag+Math.sin(i*1.7)*.3;bp[i*3+2]=-Math.cos(a)*rad*.9-4;bph.push(R()*6.28)}
 const bg=new Q.BufferGeometry();bg.setAttribute('position',new Q.BufferAttribute(bp,3));bg.setAttribute('color',new Q.BufferAttribute(bc,3));
 const bulbs=new Q.Points(bg,new Q.PointsMaterial({map:soft,size:2.4,vertexColors:true,transparent:true,blending:Q.AdditiveBlending,depthWrite:false,fog:false}));s.add(bulbs);
 /* focos (conos de luz) */
 const coneM=(col,o)=>new Q.ShaderMaterial({transparent:true,depthWrite:false,blending:Q.AdditiveBlending,side:Q.DoubleSide,uniforms:{uC:{value:new Q.Color(col)},uO:{value:o}},
  vertexShader:'varying float vY;varying vec3 vN;varying vec3 vW;void main(){vY=uv.y;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform vec3 uC;uniform float uO;varying float vY;varying vec3 vN;varying vec3 vW;void main(){float e=pow(abs(dot(normalize(vN),normalize(cameraPosition-vW))),1.4);gl_FragColor=vec4(uC,pow(vY,1.5)*e*uO);}'});
 const spots=[[-17,30,-10,0xffe2a0,.22],[17,30,-10,0xff7ad8,.2],[0,34,-16,0x8fe0ff,.14]].map(a=>{const g=new Q.Group();g.position.set(a[0],a[1],a[2]);s.add(g);const m=add(new Q.CylinderGeometry(.5,6.5,34,36,1,true),coneM(a[3],a[4]),0,-17,0,g);g.userData.base=Math.atan2(a[0],34);g.userData.x=a[0];g.lookAt(0,7,0);g.rotateX(-PI/2);g.userData.q=g.quaternion.clone();add(new Q.SphereGeometry(.9,12,10),new Q.MeshBasicMaterial({color:a[3]}),0,0,0,g);return g});
 /* --- podio central de arlequín --- */
 const harl=mkc(512,64,(x,w,h)=>{x.fillStyle='#f3c331';x.fillRect(0,0,w,h);for(let i=0;i<12;i++){x.fillStyle=i%2?'#d9242f':'#f3c331';x.beginPath();x.moveTo(i*w/12,h);x.lineTo((i+.5)*w/12,0);x.lineTo((i+1)*w/12,h);x.fill();x.fillStyle=i%2?'#f3c331':'#d9242f';x.beginPath();x.moveTo((i+.5)*w/12,0);x.lineTo((i+1.5)*w/12,0);x.lineTo((i+1)*w/12,h);x.fill()}});
 const pod=add(new Q.CylinderGeometry(2.5,2.7,.9,48),[new Q.MeshStandardMaterial({map:harl,roughness:.45,envMap:env,envMapIntensity:.5}),new Q.MeshStandardMaterial({color:0x5a0f22,roughness:.4}),new Q.MeshStandardMaterial({color:0x3a0a18})],0,.45,0);
 add(new Q.TorusGeometry(2.52,.09,10,48),GOLD,0,.9,0).rotation.x=PI/2;
 /* --- pilares dorados retorcidos con pedestal de estrellas --- */
 const star=mkc(256,256,(x,w,h)=>{x.fillStyle='#d9a233';x.fillRect(0,0,w,h);x.strokeStyle='#f6d36e';x.lineWidth=10;x.strokeRect(12,12,w-24,h-24);x.fillStyle='#8f5e14';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?28:62;x.lineTo(w/2+Math.cos(a)*rr,h/2+Math.sin(a)*rr)}x.fill()});
 function pillar(px){const g=new Q.Group();g.position.x=px;s.add(g);
  add(new Q.CylinderGeometry(1.5,1.7,.45,32),GOLD,0,.22,0,g);
  const b=add(new Q.CylinderGeometry(1.0,1.25,2.6,4,1),new Q.MeshStandardMaterial({map:star,metalness:.6,roughness:.35,envMap:env,envMapIntensity:.7}),0,1.75,0,g);b.rotation.y=PI/4;
  add(new Q.TorusGeometry(.88,.16,10,32),PURP,0,3.1,0,g).rotation.x=PI/2;add(new Q.CylinderGeometry(.7,.9,.35,24),GOLD,0,3.3,0,g);
  for(let i=0;i<10;i++){const a=i/10*PI*2;add(new Q.SphereGeometry(.12,10,8),PURP,Cs(a)*.82,3.12,S(a)*.82,g)}
  add(new Q.CylinderGeometry(.36,.36,8,20),GOLD,0,7.3,0,g);
  for(let k=0;k<2;k++){const pts=[];for(let i=0;i<=70;i++){const a=i/70*PI*10+k*PI;pts.push(new V3(.44*Math.cos(a),3.4+i/70*7.8,.44*Math.sin(a)))}add(new Q.TubeGeometry(new Q.CatmullRomCurve3(pts),160,.13,8),GOLD,0,0,0,g)}
  add(new Q.SphereGeometry(.55,20,16),GOLD,0,11.5,0,g);add(new Q.TorusGeometry(.5,.08,8,24),PURP,0,11.2,0,g).rotation.x=PI/2;add(new Q.SphereGeometry(.3,16,12),PURP,0,12.1,0,g);add(new Q.SphereGeometry(.14,10,8),GOLD,0,12.5,0,g);
  spr(0xffd36a,2.4,.5,0,12.1,0,g)}
 pillar(-4.6);pillar(4.6);
 /* travesaño con volutas y abrazadera de la bureta */
 add(new Q.CylinderGeometry(.22,.22,9.2,16),GOLD,0,11.2,0).rotation.z=PI/2;
 [-2.5,2.5].forEach(x=>{const t=add(new Q.TorusGeometry(.5,.07,8,22,PI*1.6),GOLD,x,11.7,0);t.rotation.z=x<0?0:PI});
 add(new Q.TorusGeometry(.5,.09,10,28),GOLD,0,11.2,0).rotation.x=PI/2;add(new Q.BoxGeometry(1.1,.5,.5),GOLD,0,11.2,-.2);
 /* --- bureta: vidrio con graduaciones, líquido magenta, llave dorada --- */
 const gradT=mkc(256,1024,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.85)';x.strokeStyle='rgba(255,255,255,.9)';x.font='700 22px monospace';x.textAlign='left';
  for(let i=0;i<=50;i++){const y=40+i/50*(h-80),L=i%10===0?46:i%5===0?34:20;x.lineWidth=2;x.beginPath();x.moveTo(w*.5-L/2+6,y);x.lineTo(w*.5+L/2+6,y);x.stroke();if(i%10===0)x.fillText(String(i),w*.5+34,y+7)}});
 const GL=(o,ex)=>new Q.ShaderMaterial({transparent:true,depthWrite:false,side:Q.DoubleSide,uniforms:{uA:{value:o||.1}},
  vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uA;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(vN);float f=pow(1.-abs(dot(N,V)),2.4);vec3 L1=normalize(vec3(-.6,.7,.8)),L2=normalize(vec3(.8,.4,.5));float sp=pow(max(dot(reflect(-V,N),L1),0.),70.)+pow(max(dot(reflect(-V,N),L2),0.),55.)*.7;vec3 col=vec3(.82,.92,1.)*f+vec3(1.)*sp+vec3(.9,.5,1.)*f*.25;gl_FragColor=vec4(col,clamp(uA+f*.75+sp,0.,1.));}'});
 const BG=GL(.07),buTop=14.3,buBot=8.7,buL=buTop-buBot;
 const bu=add(new Q.CylinderGeometry(.42,.42,buL,36,1,true),BG,0,(buTop+buBot)/2,0);bu.renderOrder=4;
 add(new Q.CylinderGeometry(.435,.435,buL,36,1,true),new Q.MeshBasicMaterial({map:gradT,transparent:true,depthWrite:false,side:Q.DoubleSide,fog:false}),0,(buTop+buBot)/2,0).rotation.y=PI*.2;
 add(new Q.TorusGeometry(.43,.04,8,28),GL(.25),0,buTop,0).rotation.x=PI/2;
 const bliq=add(new Q.CylinderGeometry(.32,.32,1,28),new Q.MeshStandardMaterial({color:0xd02bf0,emissive:0x8a1aa8,emissiveIntensity:.9,roughness:.2,envMap:env,envMapIntensity:.8,transparent:true,opacity:.95}),0,10,0);
 add(new Q.CylinderGeometry(.42,.07,.75,24,1,true),BG,0,8.34,0).renderOrder=4;add(new Q.CylinderGeometry(.07,.07,.9,12,1,true),BG,0,7.5,0).renderOrder=4;
 add(new Q.BoxGeometry(.8,.5,.6),GOLD,0,8.28,0);const hd=add(new Q.CylinderGeometry(.08,.08,1.0,12),RED,.85,8.28,0);hd.rotation.z=PI/2;add(new Q.SphereGeometry(.17,12,10),RED,1.35,8.28,0);
 const tipL=add(new Q.SphereGeometry(.12,10,8),new Q.MeshBasicMaterial({color:0xff6af0}),0,7.1,0);
 /* --- matraz Erlenmeyer de vidrio --- */
 const FP=[[0,0],[1.4,0],[1.58,.06],[1.64,.22],[1.4,.95],[1.1,1.75],[.8,2.5],[.5,3.15],[.44,3.4],[.43,4.0],[.5,4.1],[.56,4.18]];
 const rad=y=>{for(let i=1;i<FP.length;i++){if(y<=FP[i][1]||i===FP.length-1){const a=FP[i-1],b=FP[i],k=cl((y-a[1])/Math.max(.0001,b[1]-a[1]),0,1);return Math.max(.12,a[0]+(b[0]-a[0])*k-.07)}}return .4};
 const F=new Q.Group();F.position.y=.9;s.add(F);
 const glass=add(new Q.LatheGeometry(FP.map(p=>new Q.Vector2(p[0],p[1])),72),GL(.06),0,0,0,F);glass.renderOrder=5;
 add(new Q.TorusGeometry(.53,.045,8,32),GL(.35),0,4.15,0,F).rotation.x=PI/2;
 const LQ=new Q.ShaderMaterial({transparent:true,side:Q.DoubleSide,uniforms:{uT:{value:0},uH:{value:1}},
  vertexShader:'varying vec3 vW,vN,vL;void main(){vL=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uT,uH;varying vec3 vW,vN,vL;void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(vN);float a=atan(vL.z,vL.x),r=length(vL.xz);float sw=.5+.5*sin(a*2.+vL.y*3.2-uT*2.4+r*2.2);float g=clamp(vL.y/max(uH,.4),0.,1.);vec3 deep=vec3(.36,.03,.6),hot=vec3(.98,.2,.94),lite=vec3(1.,.66,1.);vec3 col=mix(deep,hot,g*.55+sw*.5);float f=pow(1.-abs(dot(N,V)),2.);col+=lite*f*.75+vec3(.35,.05,.4)*(.3+.7*sw)*.4;gl_FragColor=vec4(col,.93);}'});
 const SF=new Q.ShaderMaterial({transparent:true,side:Q.DoubleSide,uniforms:{uT:{value:0},uR:{value:1},uD:{value:.7}},
  vertexShader:'uniform float uR,uT,uD;varying vec2 vP;varying float vK;void main(){vec3 p=position;float k=length(p.xz);vK=k;vP=p.xz;p.xz*=uR;p.y-=uD*pow(1.-k,2.)*(.7+.3*sin(uT*3.));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
  fragmentShader:'uniform float uT;varying vec2 vP;varying float vK;void main(){float a=atan(vP.y,vP.x);float sp=.5+.5*sin(a*3.+log(max(vK,.03))*7.-uT*3.6);vec3 col=mix(vec3(.45,.05,.7),vec3(1.,.5,1.),sp);col+=vec3(1.,.8,1.)*pow(1.-vK,3.)*.8;gl_FragColor=vec4(col,.96);}'});
 const sg=new Q.RingGeometry(.001,1,56,12);sg.rotateX(-PI/2);const surf=add(sg,SF,0,1,0,F);
 let lqm=null,curH=-1;const mkLiq=h=>{const pts=[new Q.Vector2(0,.05)];for(let i=0;i<=22;i++){const y=.05+(h-.05)*i/22;pts.push(new Q.Vector2(rad(y),y))}const g=new Q.LatheGeometry(pts,56);if(lqm){lqm.geometry.dispose();lqm.geometry=g}else{lqm=add(g,LQ,0,0,0,F);lqm.renderOrder=3}};
 const VF=[];for(let i=0;i<=14;i++){const u=i/14;VF.push(new Q.Vector2(.05+.74*Math.pow(u,1.5),u*1.9))}
 const vort=add(new Q.LatheGeometry(VF,40),new Q.ShaderMaterial({transparent:true,depthWrite:false,blending:Q.AdditiveBlending,side:Q.DoubleSide,uniforms:{uT:{value:0}},
  vertexShader:'varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float uT;varying vec3 vL;void main(){float a=atan(vL.z,vL.x);float st=pow(.5+.5*sin(a*3.+vL.y*7.-uT*6.),3.);gl_FragColor=vec4(vec3(1.,.75,1.)*st,st*.5);}'}),0,0,0,F);vort.renderOrder=4;
 /* burbujas y chispas dentro del matraz */
 const NBU=70,bpos=new Float32Array(NBU*3),bsd=[];for(let i=0;i<NBU;i++)bsd.push({a:R()*6.28,r:R(),y:R()*3,v:.4+R()*.9});
 const bubs=new Q.Points(new Q.BufferGeometry().setAttribute('position',new Q.BufferAttribute(bpos,3)),new Q.PointsMaterial({map:soft,color:0xffb0f8,size:.42,transparent:true,blending:Q.AdditiveBlending,depthWrite:false}));F.add(bubs);bubs.frustumCulled=false;
 /* gota, salpicadura y onda */
 const drop=add(new Q.SphereGeometry(.17,16,14),new Q.MeshBasicMaterial({color:0xff5af0}),0,7,0);const dglow=spr(0xff4fe8,1.1,.9,0,7,0);
 const rg=new Q.RingGeometry(.9,1,60);rg.rotateX(-PI/2);const rip=add(rg,new Q.MeshBasicMaterial({color:0xffa0f8,transparent:true,opacity:0,blending:Q.AdditiveBlending,depthWrite:false,side:Q.DoubleSide}),0,1,0,F);
 const NS=18,spl=[],sgm=add(new Q.SphereGeometry(.07,8,6),new Q.MeshBasicMaterial({color:0xff9af4,transparent:true,opacity:.9}),0,0,0);s.remove(sgm);
 for(let i=0;i<NS;i++){const m=new Q.Mesh(sgm.geometry,sgm.material.clone());m.visible=false;F.add(m);spl.push({m,vx:(R()-.5)*1.4,vz:(R()-.5)*1.4,vy:1.8+R()*1.9})}
 const glowF=spr(0xff4fe8,6.2,.5,0,2.6,0,F);
 /* glifos magenta que giran alrededor del matraz */
 const spiral=mkc(128,128,(x)=>{x.translate(64,64);x.strokeStyle='#ff7af0';x.lineWidth=7;x.lineCap='round';x.shadowColor='#ff4fe8';x.shadowBlur=14;x.beginPath();for(let a=0;a<12;a+=.15){const q=a*4.6;x.lineTo(Math.cos(a)*q*.9,Math.sin(a)*q*.9)}x.stroke()});
 const gl=[0,1,2,3,4].map(i=>{const m=new Q.Sprite(new Q.SpriteMaterial({map:spiral,transparent:true,blending:Q.AdditiveBlending,depthWrite:false,opacity:.85}));m.scale.set(.9,.9,1);s.add(m);m.userData={a:i/5*6.283,y:2.5+i*.7,r:2.7+(i%2)*.5};return m});
 /* --- mesa de laboratorio con matraces, libros y neón --- */
 const tb=new Q.Group();tb.position.set(-11,0,-2.5);tb.rotation.y=.5;s.add(tb);
 add(new Q.BoxGeometry(5.2,.3,2.2),new Q.MeshStandardMaterial({color:0x7a4a22,roughness:.7}),0,2.4,0,tb);[-2.3,2.3].forEach(x=>[-.9,.9].forEach(z=>add(new Q.BoxGeometry(.22,2.4,.22),new Q.MeshStandardMaterial({color:0x5e3818}),x,1.2,z,tb)));
 [[0xf4a12a,-1.8],[0x4cd08b,-.6],[0xff4fd8,.8]].forEach((a,i)=>{const sc=.36+i*.05,m=add(new Q.LatheGeometry(FP.map(p=>new Q.Vector2(p[0]*sc,p[1]*sc)),32),GL(.1),a[1],2.55,0,tb);m.renderOrder=5;const lq=add(new Q.CylinderGeometry(.35*sc*1.2,.55*sc*1.3,.8*sc*1.4,20),new Q.MeshStandardMaterial({color:a[0],emissive:a[0],emissiveIntensity:.5,transparent:true,opacity:.9}),a[1],2.55+.45*sc*1.3,0,tb)});
 [[0x2f9d5a,.9],[0xd9242f,.7],[0x2b49c9,.55]].forEach((a,i)=>add(new Q.BoxGeometry(1.7-i*.12,.28,1.05),new Q.MeshStandardMaterial({color:a[0],roughness:.6}),2.0,2.7+i*.28,0,tb).rotation.y=i*.12);
 const neon=mkc(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.lineWidth=9;x.lineCap='round';x.lineJoin='round';const L=(c,f)=>{x.strokeStyle=c;x.shadowColor=c;x.shadowBlur=22;f();x.stroke()};
  L('#ff4fd8',()=>{x.beginPath();x.moveTo(40,170);x.lineTo(90,90);x.lineTo(150,150);x.lineTo(200,70)});L('#ffe45c',()=>{x.beginPath();x.arc(262,110,34,0,6.28)});L('#4fd8ff',()=>{x.beginPath();x.moveTo(300,130);x.lineTo(380,60);x.lineTo(470,100)});L('#5ee0b5',()=>{x.beginPath();x.moveTo(150,215);x.lineTo(250,185);x.lineTo(350,215);x.lineTo(450,180)})});
 const nz=add(new Q.PlaneGeometry(6,3),new Q.MeshBasicMaterial({map:neon,transparent:true,blending:Q.AdditiveBlending,depthWrite:false,fog:false}),-11.5,6.4,-4);nz.rotation.y=.5;
 /* --- moléculas flotantes (bolas y palitos) --- */
 const mol=(pts,bonds,cols,px,py,pz,sc)=>{const g=new Q.Group();g.position.set(px,py,pz);g.scale.setScalar(sc);s.add(g);pts.forEach((p,i)=>add(new Q.SphereGeometry(i?.3:.42,20,16),new Q.MeshStandardMaterial({color:cols[i%cols.length],roughness:.25,metalness:.1,envMap:env,envMapIntensity:.8}),p[0],p[1],p[2],g));
  bonds.forEach(b=>{const A=new V3(...pts[b[0]]),B=new V3(...pts[b[1]]),d=B.clone().sub(A),m=add(new Q.CylinderGeometry(.07,.07,d.length(),8),new Q.MeshStandardMaterial({color:0xdddddd,roughness:.4}),0,0,0,g);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize())});return g};
 const m1=mol([[0,0,0],[1.3,.8,0],[-1.2,.9,.3],[.2,-1.4,.5],[.3,.2,1.4],[2.4,.4,.5],[1.5,1.9,-.3]],[[0,1],[0,2],[0,3],[0,4],[1,5],[1,6]],[0x2f6fe0,0xe0364f,0x4cd0c8,0xf4a12a],10.5,8.6,-2,1.05);
 const m2=mol([[0,0,0],[1.4,0,0],[-.7,1.2,0],[-.7,-1.2,.4],[2.2,1.1,0.3],[2.2,-1.1,-.3]],[[0,1],[0,2],[0,3],[1,4],[1,5]],[0x9a45dc,0xe0364f,0xffffff,0x4cd0c8],8.4,4.3,-1,.9);
 /* luces */
 s.add(new Q.AmbientLight(0x6a3a5a,.9));const key=new Q.PointLight(0xffd9a0,1.15,70);key.position.set(-8,11,12);s.add(key);const fill=new Q.PointLight(0x4fd8ff,.55,60);fill.position.set(10,7,9);s.add(fill);const mag=new Q.PointLight(0xff3df0,1.3,26);mag.position.set(0,3.4,3);s.add(mag);const top=new Q.PointLight(0xffe2a8,.7,40);top.position.set(0,16,4);s.add(top);
 /* polvo y destellos */
 const ND=140,dp=new Float32Array(ND*3),dsd=[];for(let i=0;i<ND;i++){dsd.push({x:(R()-.5)*30,y:R()*16,z:(R()-.5)*14,p:R()*6.28});}
 const dust=new Q.Points(new Q.BufferGeometry().setAttribute('position',new Q.BufferAttribute(dp,3)),new Q.PointsMaterial({map:soft,color:0xffe9b8,size:.28,transparent:true,opacity:.55,blending:Q.AdditiveBlending,depthWrite:false}));dust.frustumCulled=false;s.add(dust);
 /* estado y cuadro */
 const o={r,s,c,vis:true,dirty:1,p:0,sv:false};
 const keepS=new Set([F,...gl]),decor=s.children.filter(ch=>!ch.isLight&&!keepS.has(ch)),bgCol=s.background,fogO=s.fog;
 o.solo=v=>{if(v===o.sv)return;o.sv=v;decor.forEach(d=>d.visible=!v);s.background=v?null:bgCol;s.fog=v?null:fogO;r.setClearColor(0x12050c,v?0:1);o.dirty=1};let W=1,H=1;
 const fitS=()=>{W=el.clientWidth||1;H=el.clientHeight||1;r.setSize(W,H,false);c.aspect=W/H;c.updateProjectionMatrix();o.dirty=1};new ResizeObserver(fitS).observe(el);fitS();
 new IntersectionObserver(e=>o.vis=e[0].isIntersecting).observe(el);
 o.update=(T,p)=>{o.p=p;const lvl=.55+p*2.45,bl=1-p*.9;
  if(Math.abs(lvl-curH)>.004){curH=lvl;mkLiq(lvl);surf.position.y=lvl;surf.scale.set(1,1,1);SF.uniforms.uR.value=rad(lvl);LQ.uniforms.uH.value=lvl;const k=cl(lvl/2.1,.25,1),rk=cl((rad(lvl)-.1)/.75,.3,1);vort.scale.set(rk,k,rk);vort.position.y=lvl-1.9*k;rip.position.y=lvl}
  [LQ,SF,vort.material].forEach(m=>m.uniforms.uT.value=T);
  const bh=Math.max(.1,buL*.96*bl);bliq.scale.y=bh;bliq.position.y=buBot+.1+bh/2;
  hd.rotation.z=PI/2+(p<1?.5+.25*S(T*2):0);
  /* gota: se forma, cae, golpea y ondula */
  const ph=p<1?(T*.82)%1:2,tipY=7.05,sy=.9+lvl;let dy=tipY,sc=0;
  if(ph<.34){sc=.25+ph/.34*.75;dy=tipY-.1*sc}else if(ph<.78){const u=(ph-.34)/.44;sc=1;dy=tipY-.1-(tipY-.1-sy)*u*u}
  drop.visible=dglow.visible=sc>0;drop.position.set(0,dy,0);drop.scale.set(sc,sc*(ph>.34?1.5:1),sc);dglow.position.copy(drop.position);dglow.scale.setScalar(1.2*sc+.1);tipL.visible=p<1&&!o.sv;if(o.sv)drop.visible=dglow.visible=false;tipL.scale.setScalar(ph<.34?.4+ph/.34*.8:.4);
  const ru=ph>=.78&&ph<=1?(ph-.78)/.6:ph<.34?(ph+.22)/.6:1;
  rip.material.opacity=ru<1?.9*(1-ru):0;rip.scale.setScalar(rad(lvl)*(.15+Math.min(ru,1)*.95));
  spl.forEach(q=>{const u=ph>=.78&&ph<=1?(ph-.78)/.22*.55:ph<.34?.55+ph/.34*.45:1;q.m.visible=u<1;if(q.m.visible){const t=u*1.1;q.m.position.set(q.vx*t,lvl+q.vy*t-3.2*t*t,q.vz*t);q.m.material.opacity=.9*(1-u)}});
  const ip=ph>=.78&&ph<=1?(ph-.78)/.22:1;
  mag.intensity=1.3+(1-ip)*2.4+.25*S(T*3);glowF.material.opacity=.42+.12*S(T*2.2)+(1-ip)*.25;
  const P=bubs.geometry.attributes.position;for(let i=0;i<NBU;i++){const b=bsd[i];b.y+=.012*b.v;b.a+=.03*b.v;if(b.y>lvl-.05){b.y=.1;b.r=R()}const rr=rad(b.y)*.8*b.r;P.setXYZ(i,Cs(b.a)*rr,b.y,S(b.a)*rr)}P.needsUpdate=true;
  const D=dust.geometry.attributes.position;for(let i=0;i<ND;i++){const d=dsd[i];D.setXYZ(i,d.x+S(T*.2+d.p)*.8,(d.y+T*.25)%16,d.z)}D.needsUpdate=true;
  gl.forEach((m,i)=>{const u=m.userData,a=u.a+T*(.6+i*.08);m.position.set(Cs(a)*u.r,.9+u.y+S(T*1.2+i)*.25,S(a)*u.r);m.material.rotation=T*(1+i*.2);m.material.opacity=.45+.4*S(T*2+i)});
  for(let i=0;i<NB;i++){const k=.45+.55*Math.max(0,S(T*2.6+bph[i]*3)),col=BCOL[(i+(Math.floor(T*1.1)%2?1:0))%5];bc[i*3]=col[0]*k;bc[i*3+1]=col[1]*k;bc[i*3+2]=col[2]*k}bg.attributes.color.needsUpdate=true;
  spots.forEach((g,i)=>{g.quaternion.copy(g.userData.q);g.rotateZ(S(T*.35+i*2)*.08);g.rotateX(S(T*.27+i)*.05)});
  m1.rotation.y=T*.4;m1.rotation.x=T*.23;m1.position.y=8.6+S(T*.9)*.4;m2.rotation.y=-T*.5;m2.rotation.z=T*.3;m2.position.y=4.3+S(T*1.1+1)*.4;
  nz.material.opacity=.85+(S(T*1.3)>.9?.15*S(T*60):0);
  /* cámara: órbita lenta con el scroll */
  const th=-.42+p*.95+Math.sin(T*.22)*.16,asp=W/H,dist=Math.max(23.5,27.2/Math.min(1,asp*1.3)),ty=7.1+Math.sin(T*.3)*.25;
  if(o.sv){c.position.set(Math.sin(T*.6)*1.2,3.9,10.4);c.lookAt(0,3.0,0)}else{c.position.set(Math.sin(th)*dist,ty+1.6+p*.8,Math.cos(th)*dist);c.lookAt(0,ty,0)}
  o.dirty=0;r.render(s,c)};
 return o}

const o1=titr($('#f1')),o2=null;
const hall=$('.hall'),steps=[...document.querySelectorAll('#steps li')];let p1=0;
function scroll(){const r=hall.getBoundingClientRect();p1=clamp(-r.top/(hall.offsetHeight-innerHeight),0,1);
 const s=Math.round(240*(1-p1)),m=Math.floor(s/60);$('#clock').textContent=m+':'+String(s%60).padStart(2,'0');
 steps.forEach((li,i)=>li.classList.toggle('on',p1>=i/3));if(o1)o1.dirty=1}
addEventListener('scroll',scroll,{passive:true});scroll();
/* Escena 2: cuchara + particulas, se agita arrastrando */
let ang=0,mix=0,vel=0,last=null,auto=0,rod,parts=[];const pad=$('#pad');
if(o2){o2.set(2,0);rod=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1,12),new THREE.MeshPhongMaterial({color:css('--ink')}));o2.s.add(rod);
 for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75}));
  m.userData={a:Math.random()*6.28,r:.25+Math.random()*.8,y:.4+Math.random()*1.5};o2.s.add(m);parts.push(m)}}
function spoon(){if(!o2)return;const x=.75*Math.cos(ang),z=.75*Math.sin(ang),a=new V(x,.5,z),b=new V(x*.3,4.8,z*.3),dv=b.clone().sub(a);
 rod.position.copy(a).add(b).multiplyScalar(.5);rod.scale.y=dv.length();rod.quaternion.setFromUnitVectors(new V(0,1,0),dv.normalize())}
function add(d){ang+=d;mix=clamp(mix+Math.abs(d)/(Math.PI*6),0,1);vel=clamp(vel+d*.4,-.3,.3);
 if(o2)o2.set(2,mix);spoon();$('#bar i').style.width=mix*100+'%';$('#bar').setAttribute('aria-valuenow',Math.round(mix*100));
 if(mix>=1)$('#hx').textContent='¡Reacción completa! Ahora elige abajo ↓'}
const cen=()=>{const r=pad.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height*.6]};
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);const[c,d]=cen();last=Math.atan2(e.clientY-d,e.clientX-c)});
pad.addEventListener('pointermove',e=>{if(last===null)return;const[c,d]=cen(),a=Math.atan2(e.clientY-d,e.clientX-c);let df=a-last;if(df>Math.PI)df-=2*Math.PI;if(df<-Math.PI)df+=2*Math.PI;last=a;add(df)});
['pointerup','pointercancel'].forEach(t=>pad.addEventListener(t,()=>last=null));
pad.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();add(.5)}
 if(e.key==='Enter'){e.preventDefault();clearInterval(auto);auto=setInterval(()=>{add(.35);if(mix>=1)clearInterval(auto)},30)}});
spoon();
function frame(t){requestAnimationFrame(frame);const T=t/1000;
 if(o1&&(o1.vis||o1.dirty)){o1.update(rm?1.3:T,p1)}
 if(o2&&(o2.vis||o2.dirty)){o2.cam(.5+(rm?0:Math.sin(T*.3)*.2),4.2);vel*=.95;parts.forEach(m=>{const u=m.userData;u.a+=vel*(1.2-u.r*.5);m.position.set(u.r*Math.cos(u.a),u.y,u.r*Math.sin(u.a))});o2.r.render(o2.s,o2.c);o2.dirty=0}}
requestAnimationFrame(frame);
document.addEventListener("click",e=>{const a=e.target.closest("[data-go]");if(a){e.preventDefault();parent.postMessage({ld:a.dataset.go},"*")}});
;
(function(){const el=document.getElementById('pom');if(!el)return;try{if(parent&&parent.pomRoom){el.textContent='';parent.pomRoom(el);return}}catch(e){}if(!window.THREE)return;const T=THREE,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;let r;try{r=new T.WebGLRenderer({antialias:true})}catch(e){el.textContent='Tu navegador no soporta 3D.';return}
r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0x0e0709);el.appendChild(r.domElement);
const S=new T.Scene();S.fog=new T.Fog(0x0e0709,11,24);const C=new T.PerspectiveCamera(38,1.7,.1,60);
const M=(c,o)=>new T.MeshPhongMaterial(Object.assign({color:c,shininess:20},o||{})),bx=(w,h,d,m,x,y,z,p)=>{const k=new T.Mesh(new T.BoxGeometry(w,h,d),m);k.position.set(x,y,z);(p||S).add(k);return k},
sp=(q,m,x,y,z,p)=>{const k=new T.Mesh(new T.SphereGeometry(q,20,16),m);k.position.set(x,y,z);(p||S).add(k);return k},
cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h);return{t:new T.CanvasTexture(c),x}},
limb=(g,a,b,q,m)=>{const d=new T.Vector3(...b).sub(new T.Vector3(...a)),k=new T.Mesh(new T.CylinderGeometry(q,q,d.length(),10),m);k.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);k.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(k)};
const wp=cv(256,256,(x,w,h)=>{x.fillStyle='#cdb98a';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'rgba(120,90,50,.18)':'rgba(255,240,200,.12)';x.fillRect(i*32,0,32,h)}x.fillStyle='rgba(110,80,40,.5)';for(let a=0;a<4;a++)for(let b=0;b<4;b++){const X=a*64+32,Y=b*64+32;x.beginPath();x.moveTo(X,Y-16);x.lineTo(X+10,Y);x.lineTo(X,Y+16);x.lineTo(X-10,Y);x.fill()}const g=x.createRadialGradient(128,128,40,128,128,190);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,15,5,.55)');x.fillStyle=g;x.fillRect(0,0,w,h)});
wp.t.wrapS=wp.t.wrapT=T.RepeatWrapping;wp.t.repeat.set(4,2.6);
const wall=new T.Mesh(new T.PlaneGeometry(10,6.6),M(0xffffff,{map:wp.t,shininess:2}));wall.position.set(-3.6,3.3,-3);S.add(wall);
const tent=new T.Mesh(new T.PlaneGeometry(12,8),M(0x2a0c12,{shininess:2}));tent.position.set(7,4,-3.6);S.add(tent);
bx(2.3,4.1,.2,M(0x1a0a0c),4.4,2.05,-3.5);bx(1.9,3.8,.1,M(0x6a0f1a,{emissive:0x7a1020}),4.4,1.9,-3.4);
const ex=cv(128,48,(x,w,h)=>{x.fillStyle='#2a0508';x.fillRect(0,0,w,h);x.fillStyle='#ff4455';x.font='bold 34px Arial';x.textAlign='center';x.fillText('EXIT',64,37)});
const exs=new T.Mesh(new T.PlaneGeometry(1.5,.56),new T.MeshBasicMaterial({map:ex.t}));exs.position.set(4.4,4.45,-3.38);S.add(exs);
const fl=new T.Mesh(new T.PlaneGeometry(30,18),M(0x1a1315,{shininess:5}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,2);S.add(fl);
const wood=M(0x6e5034),wd2=M(0x5a4129);bx(6.4,.22,2.3,wood,-3.4,2.1,-1.6);bx(.25,2,2,wd2,-6.5,1,-1.6);bx(1.6,2,2.1,wd2,-.9,1,-1.6);
const Mo=new T.Group();Mo.position.set(-4.7,3.25,-1.6);Mo.rotation.y=.45;S.add(Mo);bx(2.3,1.9,1.8,M(0xd6cdb4),0,0,0,Mo);bx(1.4,.15,1,M(0xcfc6aa),0,-1.02,0,Mo);
const sc=cv(256,200,()=>{}),scm=new T.Mesh(new T.PlaneGeometry(1.7,1.35),new T.MeshBasicMaterial({map:sc.t}));scm.position.set(0,.05,.91);Mo.add(scm);
const kb=bx(2.1,.12,.7,M(0xe2dcc6),-2.8,2.27,-.9);kb.rotation.y=.25;bx(1.3,.35,.9,M(0xe8e2d0),-3.3,2.4,-2.2);bx(1.2,.05,.9,M(0xcbd5c8),-1.9,2.24,-1.2).rotation.y=.4;bx(1.8,.35,.6,M(0x3b3f5a),-6,2.4,-1.4);
const mug=new T.Mesh(new T.CylinderGeometry(.16,.16,.3,14),M(0xeeeeee));mug.position.set(-1.6,2.36,-1.9);S.add(mug);
[[-6.8,4.7],[-5.3,4.3]].forEach((p,i)=>{bx(.95,1.25,.08,M(0x4a3524),p[0],p[1],-2.93);bx(.75,1,.05,M(i?0xb8a0d0:0xd9b27a),p[0],p[1],-2.88)});
const ck=cv(128,48,(x,w,h)=>{x.fillStyle='#120';x.fillRect(0,0,w,h);x.fillStyle='#ff2a3a';x.font='bold 34px monospace';x.textAlign='center';x.fillText('0:00',64,36)});
bx(1.9,.8,.1,M(0x333333),-2.6,5.1,-2.95);const ckp=new T.Mesh(new T.PlaneGeometry(1.7,.62),new T.MeshBasicMaterial({map:ck.t}));ckp.position.set(-2.6,5.1,-2.88);S.add(ckp);
const ch=new T.Group();ch.position.set(1.2,0,-.2);S.add(ch);const olive=M(0x6f6d45);
bx(1.7,.22,1.6,olive,0,1.55,0,ch);bx(1.6,1.9,.22,olive,.3,2.6,-.75,ch);bx(.2,.2,1,M(0x5f5d3a),-.9,2.05,0,ch);const pole=new T.Mesh(new T.CylinderGeometry(.08,.08,1.5,8),M(0x222222));pole.position.y=.8;ch.add(pole);for(let i=0;i<5;i++){const a=i/5*6.283,l=bx(1.1,.08,.12,M(0x222222),Math.cos(a)*.5,.1,Math.sin(a)*.5,ch);l.rotation.y=-a}
const Pm=new T.Group();Pm.position.set(1.2,1.65,-.1);Pm.rotation.y=-.55;Pm.scale.setScalar(1.12);S.add(Pm);
const sk=cv(64,8,(x)=>{x.fillStyle='#d92a3e';x.fillRect(0,0,32,8);x.fillStyle='#2b49c9';x.fillRect(32,0,32,8)}),torso=new T.Mesh(new T.CylinderGeometry(.55,.62,1.15,16),M(0xffffff,{map:sk.t}));torso.position.y=.9;Pm.add(torso);
[.6,.9,1.2].forEach(y=>sp(.08,M(0xf4d03f),0,y,.58,Pm));
const Hd=new T.Group();Hd.position.y=1.95;Pm.add(Hd);const hs=sp(.66,M(0xbfe4d4),0,0,0,Hd);hs.scale.set(1.05,1,1);
const eyes=[],pup=[];[-1,1].forEach(s=>{const e=sp(.27,M(0xffffff),s*.28,.1,.55,Hd);e.scale.z=.55;eyes.push(e);pup.push(sp(.11,M(0x111111),s*.28,.1,.74,Hd));const b=new T.Mesh(new T.CircleGeometry(.11,16),new T.MeshBasicMaterial({color:0xf08aa0}));b.position.set(s*.42,-.2,.6);Hd.add(b)});
sp(.13,M(0x8a3a4a),0,-.34,.62,Hd).scale.set(1,.3,.3);
const Ht=new T.Group();Ht.position.y=.55;Hd.add(Ht);const bnd=new T.Mesh(new T.TorusGeometry(.62,.09,8,24),M(0xf4d03f));bnd.rotation.x=Math.PI/2;Ht.add(bnd);
const c1=new T.Mesh(new T.ConeGeometry(.4,1.3,16),M(0xd92a3e));c1.position.set(-.32,.6,0);c1.rotation.z=.65;Ht.add(c1);const c2=new T.Mesh(new T.ConeGeometry(.4,1.3,16),M(0x2b49c9));c2.position.set(.32,.6,0);c2.rotation.z=-.65;Ht.add(c2);
const poms=[sp(.14,M(0xf4d03f),-.71,1.12,0,Ht),sp(.14,M(0xf4d03f),.71,1.12,0,Ht)];
const red=M(0xd92a3e),blue=M(0x2b49c9),yel=M(0xf1c40f);limb(Pm,[-.6,1.45,0],[-.75,.85,.65],.13,red);sp(.17,red,-.75,.8,.68,Pm);limb(Pm,[.6,1.45,0],[.55,.85,.6],.13,blue);sp(.17,blue,.55,.8,.63,Pm);
[-1,1].forEach((s,i)=>{limb(Pm,[s*.28,.35,.1],[s*.28,.3,1],.2,i?red:blue);limb(Pm,[s*.28,.3,1],[s*.28,-.55,1.05],.18,i?blue:red);const b=sp(.26,yel,s*.28,-.7,1.15,Pm);b.scale.set(1,.6,1.4)});
const bp=new T.Group();bp.position.set(-.8,8,-1.5);S.add(bp);const cord=new T.Mesh(new T.CylinderGeometry(.015,.015,2.7,4),M(0x111111));cord.position.y=-1.35;bp.add(cord);const bulb=new T.Mesh(new T.SphereGeometry(.24,16,12),new T.MeshBasicMaterial({color:0xfff1c0}));bulb.position.y=-2.75;bp.add(bulb);
const bl=new T.PointLight(0xffd49a,1.1,15);bl.position.y=-2.75;bp.add(bl);
S.add(new T.AmbientLight(0x2a1c22,.9));const gl=new T.PointLight(0x3dff7a,.9,9);gl.position.set(-4.2,3.4,.2);S.add(gl);const rl=new T.PointLight(0xff2030,.9,8);rl.position.set(4.4,4.2,-2.5);S.add(rl);
for(let i=0;i<5;i++){const pts=[];let x=-4.5+Math.random()*2,z=-1;for(let k=0;k<7;k++){pts.push(new T.Vector3(x,.06+Math.random()*.08,z));x+=.5+Math.random()*.7;z+=.4+Math.random()*.6}const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,.05,6),M(0xcfc9b8));S.add(m)}
const dn=70,dg=new T.BufferGeometry(),dp=new Float32Array(dn*3);for(let i=0;i<dn;i++){dp[i*3]=-3+Math.random()*6;dp[i*3+1]=Math.random()*7;dp[i*3+2]=-2+Math.random()*4}dg.setAttribute('position',new T.BufferAttribute(dp,3));const dust=new T.Points(dg,new T.PointsMaterial({color:0xffe9b0,size:.04,transparent:true,opacity:.6}));S.add(dust);
const lines=['O','H','H–C','CS=H₃','C=O','CH₃–CH₂–OH','C₆H₆','NaOH','Δ','R–X','HC≡CH'];let last=-1;
function scr(t){const x=sc.x;x.fillStyle='#021008';x.fillRect(0,0,256,200);x.font='bold 24px monospace';x.fillStyle='#52ff8a';for(let i=0;i<7;i++){const y=((i*34+t*28)%238)-14;x.fillText(lines[(i*3+Math.floor(t/3))%lines.length],12+((i*47)%110),y)}x.fillStyle='rgba(0,0,0,.28)';for(let y=0;y<200;y+=3)x.fillRect(0,y,256,1);sc.t.needsUpdate=true}scr(0);
let W=1,H=1,mx=0,my=0,cx=0,cy=0,vis=true;const fit=()=>{W=el.clientWidth;H=el.clientHeight;r.setSize(W,H,false);C.aspect=W/H;C.updateProjectionMatrix()};new ResizeObserver(fit).observe(el);fit();new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(el);
el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();mx=(e.clientX-b.left)/b.width-.5;my=(e.clientY-b.top)/b.height-.5});
function f(n){requestAnimationFrame(f);if(!vis)return;const t=rm?1:n/1000;cx+=(mx-cx)*.05;cy+=(my-cy)*.05;const zk=Math.max(1,1.7/C.aspect);C.position.set(cx*2-.4*(zk-1),2.6-cy*.8,9.8*zk);C.lookAt(-.4,3.05,-1.2);
 if(Math.floor(t*8)!==last){last=Math.floor(t*8);scr(t)}
 bp.rotation.z=Math.sin(t*.9)*.06;bl.intensity=1.1+(Math.random()<.03?-.6:Math.sin(t*20)*.03);gl.intensity=.85+Math.sin(t*13)*.08;
 torso.scale.y=1+Math.sin(t*1.6)*.02;Hd.rotation.y=-.45+Math.sin(t*.5)*.1;Hd.rotation.z=Math.sin(t*.7)*.04;Hd.position.y=1.95+Math.sin(t*1.6)*.015;
 const bk=(t%4)<.12?.1:1;eyes.forEach(e=>e.scale.y=bk);pup.forEach((p,i)=>{p.position.x=(i?.28:-.28)+Math.sin(t*1.3+i)*.04;p.position.y=.1+Math.sin(t*.9)*.03});poms.forEach((p,i)=>p.position.y=1.12+Math.sin(t*2+i)*.04);
 const d=dg.attributes.position;for(let i=0;i<dn;i++){d.array[i*3+1]+=.002;if(d.array[i*3+1]>7)d.array[i*3+1]=0}d.needsUpdate=true;
 r.render(S,C)}
requestAnimationFrame(f)})()
;
(function(){const f=document.getElementById('fg'),hall=document.querySelector('.hall'),slot=document.getElementById('fslot');if(!f||!hall||!slot)return;let dc=0,tg=0,run=0;const cl=(a,b,x)=>Math.max(a,Math.min(b,x)),E=t=>t*t*(3-2*t),top=e=>e.getBoundingClientRect().top+scrollY;
function apply(d){if(d<=0){f.style.opacity=0;f.classList.remove('fdone');return}const y0=hall.offsetTop+hall.offsetHeight-innerHeight/2-95,y1=top(slot),k=E(d);f.classList.toggle('fdone',d>=1);f.style.opacity=Math.min(1,d*12);f.style.transform='translate('+(innerWidth/2-75)+'px,'+(y0+(y1-y0)*k)+'px) scale('+(1.25-.55*k)+') rotate('+(Math.sin(d*18)*(1-k)*10)+'deg)'}
function tick(){dc+=(tg-dc)*.14;if(Math.abs(tg-dc)<.0008)dc=tg;apply(dc);if(dc!==tg)requestAnimationFrame(tick);else run=0}
function kick(){const a=hall.offsetTop+hall.offsetHeight-innerHeight,b=Math.max(a+1,top(slot)-innerHeight*.55);tg=cl((scrollY-a)/(b-a),0,1);if(!run){run=1;requestAnimationFrame(tick)}}
addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);kick()})();
