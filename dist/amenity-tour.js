import {boundedFocus} from './amenity-motion.mjs';
const root=document.querySelector('.amenity-tour');
if(root){
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const places={
 parking:{name:'Подземный паркинг',title:'Подземный паркинг',text:'Въезд с улицы, пешеходный выход к жилым корпусам. Двор остаётся без машин.',features:['Отдельный въезд','Подземный уровень','Связь с жилыми корпусами'],image:'tour-parking.webp',point:[.81,.73],position:65},
 playground:{name:'Детская площадка',title:'Детская площадка',text:'Деревянные игровые конструкции, мягкое покрытие и скамейки для родителей.',features:['Без транзита машин','Натуральные материалы','Отдых для родителей'],image:'tour-playground.webp',point:[.25,.74],position:62},
 courtyard:{name:'Двор без машин',title:'Двор без машин',text:'Пешеходные дорожки связывают входы в корпуса и места отдыха.',features:['Пешеходные маршруты','Тихие места отдыха','Освещение дорожек'],image:'character-garden-real.webp',point:[.51,.57],position:50},
 landscape:{name:'Зелёная территория',title:'Сад у дома',text:'Берёзы, многолетники и злаки вдоль прогулочных дорожек.',features:['Деревья и многолетники','Тень и места отдыха','Прогулочные дорожки'],image:'tour-landscape.webp',point:[.46,.85],position:45}
 };
 const map=q('.photo-map'),world=q('.photo-world'),detail=q('.photo-detail'),story=q('.photo-story'),status=q('.photo-status');
 const stage=document.createElement('div');stage.className='amenity-stage';root.prepend(stage);
 for(const selector of['.photo-map','.photo-detail','.photo-shade','.photo-back','.photo-scrim','.photo-return'])stage.append(q(selector));
 let selected=null,sequence=0,animations=[];const images=new Map();
 const base='translate(-50%, -50%) scale(1)';
 function load(src){if(!images.has(src)){const img=new Image();img.src=src;images.set(src,img.decode().catch(error=>{images.delete(src);throw error}))}return images.get(src)}
 function cancel(){sequence++;animations.forEach(a=>a.cancel());animations=[];root.classList.remove('busy');return sequence}
 async function motion(el,frames,duration){const a=el.animate(frames,{duration:reduce?1:duration,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});animations.push(a);try{await a.finished;a.commitStyles();a.cancel();return true}catch{return false}}
 function inspect(off=false){root.classList.toggle('inspect',!off);q('.photo-return').hidden=off;q('.photo-scrim').hidden=off}
 function setView(view){root.dataset.view=view;map.inert=view!=='map';map.setAttribute('aria-hidden',String(view!=='map'));detail.setAttribute('aria-hidden',String(view!=='detail'));q('.photo-back').hidden=view==='map';story.hidden=view!=='detail';all('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(view==='detail'&&b.dataset.place===selected)));}
 function reset(){world.style.width=stage.clientWidth+'px';world.style.height=stage.clientHeight+'px';world.style.transform=base}
 new ResizeObserver(()=>{if(root.classList.contains('busy')){cancel();inspect(true);setView('map');detail.style.opacity=0;}reset()}).observe(stage);reset();
 for(const [key,p]of Object.entries(places)){const b=document.createElement('button');b.className='photo-pin';b.style.left=p.point[0]*100+'%';b.style.top=p.point[1]*100+'%';b.setAttribute('aria-label',p.name);b.innerHTML='<i aria-hidden="true"></i><span>'+p.name+'</span>';b.onclick=()=>select(key);q('.photo-pins').append(b)}
 async function overview(){const id=cancel();inspect(true);setView('map');root.classList.add('busy');map.style.opacity=1;await Promise.all([motion(detail,[{opacity:getComputedStyle(detail).opacity},{opacity:0}],650),motion(world,[{transform:world.style.transform||base},{transform:base}],700)]);if(id!==sequence)return;root.classList.remove('busy');status.textContent='Выберите место на плане.';}
 async function select(key){const p=places[key];if(!p)return;const id=cancel();inspect(true);root.classList.add('busy');selected=key;root.dataset.place=key;story.hidden=true;status.textContent='Открываем: '+p.name.toLowerCase();
 try{await load('assets/'+p.image);if(id!==sequence)return;
  if(root.dataset.view==='detail'){setView('map');story.hidden=true;await motion(detail,[{opacity:getComputedStyle(detail).opacity},{opacity:0}],450);if(id!==sequence)return}
  reset();const focus=boundedFocus(stage.clientWidth,stage.clientHeight,p.point);
  await motion(world,[{transform:base},{transform:focus.transform}],650);if(id!==sequence)return;
  detail.querySelector('img').src='assets/'+p.image;detail.querySelector('img').alt=p.name+' — архитектурная визуализация';detail.style.setProperty('--detail-x',p.position+'%');
  detail.querySelector('img').style.objectPosition=p.position+'% center';await motion(detail,[{opacity:0},{opacity:1}],850);if(id!==sequence)return;
  setView('detail');q('.photo-kicker').textContent=p.name.toUpperCase();story.querySelector('h2').textContent=p.title;story.querySelector('p').textContent=p.text;story.querySelector('ul').replaceChildren(...p.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));story.hidden=false;motion(story,[{opacity:0},{opacity:1}],350);root.classList.remove('busy');status.textContent='Открыто: '+p.name.toLowerCase();
 }catch{if(id===sequence){await overview();status.textContent='Не удалось загрузить сцену. Попробуйте выбрать место ещё раз.'}}}
 all('[data-place]').forEach(b=>b.onclick=()=>select(b.dataset.place));q('.photo-back').onclick=overview;q('.photo-overview').onclick=overview;q('.photo-look').onclick=()=>inspect();q('.photo-return').onclick=()=>inspect(true);
 q('.photo-scrim').addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();detail.querySelector('img').style.objectPosition=(30+(e.clientX-r.left)/r.width*40)+'% center'});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){if(root.classList.contains('inspect'))inspect(true);else overview()}});
 map.style.opacity=1;world.style.transform=base;setView('map');root.dataset.photoReady='true';
}
// The cloud layer shares the exact cover crop of the still image and is clipped to its sky.
const hero=document.querySelector('.calm-hero');
if(hero){const image=hero.querySelector('img'),composition=hero.querySelector('.hero-composition');
 const fit=()=>{const iw=image.naturalWidth||1672,ih=image.naturalHeight||941,s=Math.max(hero.clientWidth/iw,hero.clientHeight/ih),w=iw*s,h=ih*s;composition.style.width=w+'px';composition.style.height=h+'px';composition.style.left=(hero.clientWidth-w)*(hero.clientWidth<650?.62:.5)+'px';composition.style.top=(hero.clientHeight-h)*.5+'px'};
 new ResizeObserver(fit).observe(hero);image.addEventListener('load',fit);fit();
 new IntersectionObserver(entries=>hero.classList.toggle('cloud-paused',!entries[0].isIntersecting)).observe(hero);
 document.addEventListener('visibilitychange',()=>hero.classList.toggle('cloud-hidden',document.hidden));
}

