const root=document.querySelector('.photo-tour');
if(root){
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ground=q('.photo-ground'),map=q('.photo-map'),world=q('.photo-world'),detail=q('.photo-detail'),story=q('.photo-story'),status=q('.photo-status');
 const places={
  parking:{name:'Подземный паркинг',title:'Приехать. И быть дома.',text:'Въезд с внешней стороны комплекса. Автомобиль остаётся на подземном уровне, двор — для прогулок и встреч.',features:['Отдельный въезд','Подземный уровень','Связь с жилыми корпусами'],image:'tour-parking.webp',point:[.81,.73],position:65},
  playground:{name:'Детская площадка',title:'Большие открытия рядом.',text:'Деревянные конструкции, мягкое покрытие и места для родителей. Площадка расположена внутри пешеходного двора.',features:['Без транзита машин','Натуральные материалы','Отдых для родителей'],image:'tour-playground.webp',point:[.25,.74],position:62},
  courtyard:{name:'Двор без машин',title:'Замедлиться. Встретиться.',text:'Входы в корпуса, тихие террасы и прогулочные дорожки соединены общим двором. Здесь удобно идти своим темпом.',features:['Пешеходные маршруты','Тихие места отдыха','Освещение дорожек'],image:'character-garden-real.webp',point:[.51,.57],position:50},
  landscape:{name:'Зелёная территория',title:'Природа у вашего порога.',text:'Берёзы, многолетники и злаки. Зелёные маршруты проходят между местами отдыха и жилыми корпусами.',features:['Деревья и многолетники','Тень и места отдыха','Прогулочные дорожки'],image:'tour-landscape.webp',point:[.46,.85],position:45}
 };
 let view='home',selected=null,sequence=0,animations=[],drag=null,pan=0,mapScale=1,worldWidth=0,worldHeight=0,night=false;
 const loads=new Map();
 function load(src){if(!loads.has(src)){const img=new Image();img.src=src;loads.set(src,img.decode().then(()=>src).catch(error=>{loads.delete(src);throw error}))}return loads.get(src)}
 function paintStatus(text){status.textContent=text}
 function cancel(){sequence++;animations.forEach(a=>a.cancel());animations=[];root.classList.remove('busy');return sequence}
 async function motion(el,frames,duration){const a=el.animate(frames,{duration:reduced?1:duration,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});animations.push(a);try{await a.finished;a.commitStyles();a.cancel();return true}catch{return false}}
 function setView(value){view=value;root.dataset.view=value;q('.photo-intro').inert=value!=='home';q('.photo-back').hidden=value==='home';q('.photo-back span').textContent=value==='map'?'К главному виду':'К территории';if(value==='map')q('.photo-back span').textContent='К главному виду';map.classList.toggle('active',value==='map');map.setAttribute('aria-hidden',String(value!=='map'));map.inert=value!=='map';detail.setAttribute('aria-hidden',String(value!=='detail'));story.hidden=value!=='detail';all('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(value==='detail'&&b.dataset.place===selected)));q('.photo-location').textContent=value==='detail'?places[selected].name:value==='map'?'Территория с высоты':'Жизнь в деталях'}
 function uninspect(){root.classList.remove('inspect');q('.photo-scrim').hidden=true;q('.photo-return').hidden=true}
 function baseTransform(x=0,s=1){return`translate(calc(-50% + ${x}px), -50%) scale(${s})`}
 function fit(){worldWidth=Math.max(root.clientWidth,root.clientHeight*16/9);worldHeight=worldWidth*9/16;world.style.width=worldWidth+'px';world.style.height=worldHeight+'px';pan=Math.max(-(worldWidth-root.clientWidth)/2,Math.min((worldWidth-root.clientWidth)/2,pan));if(view==='map')world.style.transform=baseTransform(pan)}
 new ResizeObserver(fit).observe(root);fit();
 for(const [id,p]of Object.entries(places)){const b=document.createElement('button');b.className='photo-pin';b.dataset.point=id;b.style.left=p.point[0]*100+'%';b.style.top=p.point[1]*100+'%';b.setAttribute('aria-label',p.name);b.innerHTML='<i aria-hidden="true"></i><span>'+p.name+'</span>';b.onclick=()=>select(id);q('.photo-pins').append(b)}
 async function overview(){const id=cancel();uninspect();const was=view;root.classList.add('busy');setView('map');paintStatus('Обзор территории. Перетяните панораму или выберите место.');
  try{await load('assets/tour-aerial.webp');if(id!==sequence)return;pan=0;mapScale=1;world.style.transform=baseTransform(0,was==='home'?1.015:1);const tasks=[motion(map,[{opacity:getComputedStyle(map).opacity},{opacity:1}],1000),motion(detail,[{opacity:getComputedStyle(detail).opacity},{opacity:0}],700),motion(ground,[{opacity:getComputedStyle(ground).opacity,transform:'scale(1)'},{opacity:0,transform:'scale(1)'}],1000),motion(world,[{transform:world.style.transform},{transform:baseTransform()}],1400)];await Promise.all(tasks);if(id!==sequence)return;root.classList.remove('busy');
  }catch{if(id===sequence){home();paintStatus('Не удалось загрузить обзор. Попробуйте ещё раз.')}}
 }
 async function select(key){const p=places[key];if(!p)return;const id=cancel();uninspect();selected=key;root.dataset.place=key;const was=view;root.classList.add('busy');setView('detail');story.hidden=true;paintStatus('Открываем: '+p.name.toLowerCase());
  try{await Promise.all([load('assets/'+p.image),load('assets/tour-aerial.webp')]);if(id!==sequence)return;
   if(was!=='map'){map.style.opacity=0;world.style.transform=baseTransform(0,1.015);await Promise.all([motion(map,[{opacity:0},{opacity:1}],650),motion(detail,[{opacity:getComputedStyle(detail).opacity},{opacity:0}],500),motion(ground,[{opacity:getComputedStyle(ground).opacity},{opacity:0}],650),motion(world,[{transform:baseTransform(0,1.015)},{transform:baseTransform()}],900)]);if(id!==sequence)return}
   const [px,py]=p.point,s=1.04,tx=(.5-px)*worldWidth*s,ty=(.5-py)*worldHeight*s;
   const focus=`translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${s})`;
   await motion(world,[{transform:world.style.transform||baseTransform(pan)},{transform:focus}],400);if(id!==sequence)return;
   detail.querySelector('img').src='assets/'+p.image;detail.querySelector('img').alt=p.name+' — архитектурная визуализация';detail.style.setProperty('--detail-x',p.position+'%');detail.style.opacity=1;
   await Promise.all([motion(detail,[{opacity:0},{opacity:1}],800),motion(detail.querySelector('img'),[{transform:'scale(1.025)'},{transform:'scale(1.025)'}],800)]);if(id!==sequence)return;
   q('.photo-kicker').textContent='ХАРАКТЕР / '+p.name.toUpperCase();story.querySelector('h2').textContent=p.title;story.querySelector('p').textContent=p.text;story.querySelector('ul').replaceChildren(...p.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));story.hidden=false;motion(story,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],500);root.classList.remove('busy');paintStatus('Выберите «Осмотреть место», чтобы убрать описание.');
  }catch{if(id===sequence){root.classList.remove('busy');await overview();paintStatus('Не удалось загрузить место. Выберите его ещё раз.')}}
 }
 async function home(){const id=cancel();uninspect();setView('home');selected=null;root.classList.add('busy');await Promise.all([motion(ground,[{opacity:getComputedStyle(ground).opacity,transform:'scale(1)'},{opacity:1,transform:'scale(1)'}],1100),motion(map,[{opacity:getComputedStyle(map).opacity},{opacity:0}],800),motion(detail,[{opacity:getComputedStyle(detail).opacity},{opacity:0}],800)]);if(id!==sequence)return;root.classList.remove('busy');paintStatus('Выберите место — окажитесь ближе.')}
 all('[data-place]').forEach(b=>b.onclick=()=>select(b.dataset.place));q('.photo-explore').onclick=overview;q('.photo-overview').onclick=overview;q('.photo-back').onclick=()=>view==='map'?home():overview();
 q('.photo-look').onclick=()=>{root.classList.add('inspect');q('.photo-scrim').hidden=false;q('.photo-return').hidden=false};q('.photo-return').onclick=uninspect;
 function panDetail(e){if(!root.classList.contains('inspect'))return;const r=root.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;detail.querySelector('img').style.objectPosition=(20+x*60)+'% center'}
 q('.photo-scrim').addEventListener('pointermove',panDetail);
 q('.photo-day').onclick=async()=>{if(view==='detail')return;const expected=sequence,next=!night,src='assets/'+(next?'character-night-real.webp':'residence-photo.webp');try{await load(src);if(expected!==sequence)return;night=next;ground.querySelector('img').src=src;q('.photo-day').setAttribute('aria-pressed',String(night));q('.photo-day').textContent=night?'День ☀':'Вечер ◐';await home()}catch{paintStatus('Не удалось загрузить изображение. Попробуйте ещё раз.')}};
 map.addEventListener('pointerdown',e=>{if(view!=='map'||root.classList.contains('busy')||e.target.closest('button'))return;drag={x:e.clientX,start:pan,pointer:e.pointerId};map.setPointerCapture(e.pointerId);map.classList.add('dragging')});
 map.addEventListener('pointermove',e=>{if(!drag)return;const max=(worldWidth-root.clientWidth)/2;pan=Math.max(-max,Math.min(max,drag.start+e.clientX-drag.x));world.style.transform=baseTransform(pan)});
 const release=()=>{drag=null;map.classList.remove('dragging')};map.addEventListener('pointerup',release);map.addEventListener('pointercancel',release);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&view!=='home'){if(root.classList.contains('inspect'))uninspect();else if(view==='detail')overview();else home()}});
 root.dataset.photoReady='true';setView('home');
 if(!navigator.connection?.saveData){const preload=()=>load('assets/tour-aerial.webp').catch(()=>{});if('requestIdleCallback'in window)requestIdleCallback(preload);else setTimeout(preload,1800)}
}


