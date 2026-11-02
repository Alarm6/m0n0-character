(() => {
  const root=document.querySelector('.hero-visual');
  if(!root)return;
  const q=s=>root.querySelector(s),all=s=>root.querySelectorAll(s);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sceneData={
    parking:{name:'Подземный паркинг',image:'assets/tour-parking.webp',label:'01 / ПОД ДОМом',title:'Машина — внизу.\nДвор — для жизни.',description:'Въезд в подземный паркинг вынесен за пределы пешеходного двора. От автомобиля можно подняться к своему корпусу через лифтовой холл.',features:['Подземные машино-места','Лифт к жилым этажам','Контролируемый въезд'],pins:[{x:'64%',y:'80%',name:'Въезд в подземный паркинг',detail:'Отдельный въезд',text:'Рампа находится с внешней стороны комплекса: маршрут автомобиля не пересекает игровую площадку.'},{x:'83%',y:'72%',name:'Вход в лифтовой холл',detail:'Из паркинга — к дому',text:'Пешеходный выход через лифтовой холл соединяет подземный уровень и жилые этажи.'}]},
    playground:{name:'Детская площадка',image:'assets/tour-playground.webp',label:'02 / ИГРА ВО ДВОРЕ',title:'Большие открытия.\nРядом с домом.',description:'Игровое пространство находится внутри двора, вдали от автомобильных маршрутов. Натуральные материалы, мягкое покрытие и места для родителей рядом.',features:['Без транзита машин','Мягкое покрытие','Скамейки для родителей'],pins:[{x:'59%',y:'63%',name:'Игровая зона',detail:'Место для игры',text:'Невысокие игровые элементы и маршруты для лазания позволяют придумывать собственные сценарии.'},{x:'80%',y:'67%',name:'Места для родителей',detail:'Всё в поле зрения',text:'Рядом с площадкой предусмотрены места, где удобно присесть, наблюдая за ребёнком.'}]},
    courtyard:{name:'Двор без машин',image:'assets/character-garden-real.webp',label:'03 / ВНУТРИ КВАРТАЛА',title:'Встретиться.\nОстаться на минуту.',description:'Пешеходный двор объединяет входы в корпуса, места для короткого отдыха и прогулочные дорожки. Здесь нет транзитного движения автомобилей.',features:['Пешеходные маршруты','Места для встреч','Освещение дорожек'],pins:[{x:'46%',y:'66%',name:'Пешеходная дорожка',detail:'Маршрут до дома',text:'Дорожки связывают входы в корпуса и места отдыха в единую пешеходную сеть.'},{x:'77%',y:'56%',name:'Терраса у дома',detail:'Небольшая пауза',text:'Места для спокойных разговоров и встреч соседей расположены рядом с первыми этажами.'}]},
    landscape:{name:'Зелёная территория',image:'assets/tour-landscape.webp',label:'04 / ПРОГУЛОЧНЫЙ МАРШРУТ',title:'Зелень —\nчасть каждого дня.',description:'Деревья, многолетние посадки и спокойные дорожки отделяют места отдыха от фасадов. Пройтись, посидеть в тени или просто сменить темп можно у самого дома.',features:['Деревья и многолетники','Прогулочные дорожки','Регулярный уход'],pins:[{x:'43%',y:'58%',name:'Посадки вдоль дорожки',detail:'Живая граница',text:'Деревья и многолетники создают тень и мягко отделяют прогулочные маршруты от окон квартир.'},{x:'61%',y:'65%',name:'Маршрут по территории',detail:'Пешком через сад',text:'Дорожки позволяют пройти территорию насквозь и выбрать более тихий путь к своему подъезду.'}]}
  };
  sceneData.territory={name:'Территория',image:'assets/tour-aerial.webp',label:'ВЕСЬ КОМПЛЕКС',title:'Территория комплекса',description:'Выберите место на общем плане: паркинг, площадку, двор или зелёный маршрут.',features:[],pins:[]};
  Object.values(sceneData).forEach(s=>s.label=s.label.toUpperCase());
  const home=q('.tour-home'),destination=q('.tour-destination'),photo=q('.tour-scene-image'),toolbar=q('.tour-toolbar'),caption=q('.tour-caption'),status=q('.tour-status'),back=q('.tour-back');
  let scene=null,operation=0,returnFocus=null,panX=0,panY=0;
  root.dataset.journeyState='home';
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced?0:ms));
  const sceneCache=new Map();
  function warmScene(key){if(!sceneCache.has(key)){const image=new Image();image.decoding='async';image.src=sceneData[key].image;sceneCache.set(key,image)}return sceneCache.get(key)}
  const setPan=(x=0,y=0)=>{panX=x;panY=y;photo.style.setProperty('--pan-x',x+'px');photo.style.setProperty('--pan-y',y+'px')};
  const portalPoints={parking:{x:.82,y:.78,kind:'shadow'},playground:{x:.38,y:.8,kind:'foliage'},courtyard:{x:.6,y:.85,kind:'path'},landscape:{x:.22,y:.72,kind:'foliage'},territory:{x:.5,y:.5,kind:'overview'}};
  const planPoints={parking:{x:.82,y:.71},playground:{x:.245,y:.70},courtyard:{x:.52,y:.625},landscape:{x:.43,y:.855}};
  function positionTerritoryPins(){if(scene!=='territory')return;const w=root.clientWidth,h=root.clientHeight,iw=photo.naturalWidth||1600,ih=photo.naturalHeight||900,fit=Math.min(w/iw,h/ih);all('.territory-pin').forEach(b=>{const p=planPoints[b.dataset.zone];b.style.left=((w-iw*fit)/2+iw*fit*p.x)+'px';b.style.top=((h-ih*fit)/2+ih*fit*p.y)+'px'})}
  photo.addEventListener('load',positionTerritoryPins);
  function renderScene(key){
    const s=sceneData[key];q('.tour-view-name').textContent=s.name;q('.tour-label').textContent=s.label;q('.tour-title').textContent=s.title;q('.tour-title').style.whiteSpace='pre-line';q('.tour-description').textContent=s.description;
    q('.tour-features').replaceChildren(...s.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
    q('.tour-scene-nav').replaceChildren(...Object.entries(sceneData).map(([id,item])=>{const b=document.createElement('button');b.textContent=item.name;b.classList.toggle('active',id===key);b.setAttribute('aria-pressed',String(id===key));b.onclick=()=>openScene(id);b.onpointerenter=()=>warmScene(id);b.onfocus=()=>warmScene(id);return b}));
    q('.scene-pins').replaceChildren();
    if(key==='territory'){for(const id of Object.keys(planPoints)){const b=document.createElement('button');b.className='territory-pin';b.dataset.zone=id;b.setAttribute('aria-label',sceneData[id].name);const label=document.createElement('span');label.textContent=sceneData[id].name;b.append(label);b.onclick=()=>openScene(id);b.onpointerenter=()=>warmScene(id);b.onfocus=()=>warmScene(id);q('.scene-pins').append(b)}positionTerritoryPins()}
    photo.alt=s.name+' — архитектурная визуализация';setPan();
  }
  let flightTarget=null;
  const flight=new CinematicMotion.CinematicTransition({root,veil:q('.cinema-veil'),reduced,onStage:stage=>{root.dataset.journeyState=stage;status.textContent=''}});
  async function openScene(key){
    if(!sceneData[key])return;
    const token=++operation;flight.cancel();flightTarget=key;returnFocus=scene?returnFocus:document.activeElement;
    root.dataset.journeyState='loading';root.dataset.flight='loading';status.textContent='Загружаем ракурс…';
    all('.tour-pins button').forEach(b=>b.disabled=true);caption.hidden=true;toolbar.hidden=false;back.disabled=false;
    if(root.getBoundingClientRect().top<-40)scrollTo({top:document.querySelector('#home').offsetTop,behavior:reduced?'instant':'smooth'});
    const preload=warmScene(key);
    try{await preload.decode()}catch{
      if(token!==operation)return;root.dataset.flight='idle';root.dataset.journeyState=scene?'scene':'home';status.textContent='Не удалось загрузить вид. Попробуйте ещё раз.';
      all('.tour-pins button').forEach(b=>b.disabled=false);toolbar.hidden=!scene;caption.hidden=!scene;
      setTimeout(()=>{if(token===operation)status.textContent=''},3500);return;
    }
    if(token!==operation)return;
    const source=scene?destination:home;
    const arrived=await flight.forward(source,{...portalPoints[key],...(scene==='territory'&&planPoints[key]?{...planPoints[key],fromOverview:true}:{})},sceneData[key].name,()=>{
      scene=key;root.dataset.sceneKey=key;photo.src=preload.src;renderScene(key);root.classList.add('at-scene');
      destination.setAttribute('aria-hidden','false');home.setAttribute('aria-hidden','true');return destination;
    });
    if(!arrived||token!==operation)return;
    status.textContent='';root.dataset.journeyState='arriving';await wait(100);if(token!==operation)return;
    caption.hidden=false;root.dataset.journeyState='scene';back.focus({preventScroll:true});
  }
  async function closeScene(){
    const token=++operation,previous=scene,interrupted=root.dataset.flight!=='idle';
    flight.cancel();caption.hidden=true;status.textContent='';back.disabled=true;
    all('.tour-pins button').forEach(b=>b.disabled=true);root.dataset.journeyState='returning';
    const revealHome=()=>{root.classList.remove('at-scene','departing','switching');delete root.dataset.sceneKey;destination.setAttribute('aria-hidden','true');home.setAttribute('aria-hidden','false');return home};
    if(previous&&!interrupted){flightTarget=previous;const done=await flight.back(destination,portalPoints[previous],sceneData[previous].name,revealHome);if(!done||token!==operation)return}else revealHome();
    if(token!==operation)return;scene=null;status.textContent='';toolbar.hidden=true;setPan();lastActivity=performance.now();await wait(180);
    if(token!==operation)return;all('.tour-pins button').forEach(b=>b.disabled=false);back.disabled=false;root.dataset.journeyState='home';
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
  }
  all('[data-scene]').forEach(b=>{b.onclick=()=>openScene(b.dataset.scene);b.onpointerenter=()=>warmScene(b.dataset.scene);b.onfocus=()=>warmScene(b.dataset.scene)});back.onclick=closeScene;q('.tour-reset').onclick=()=>{setPan();all('.scene-pin').forEach(b=>b.setAttribute('aria-pressed','false'));if(scene)renderScene(scene)};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&(scene||root.dataset.flight!=='idle')&&!document.querySelector('dialog[open]'))closeScene()});
  q('.territory-open').onclick=()=>openScene('territory');q('.territory-open').onpointerenter=()=>warmScene('territory');q('.territory-open').onfocus=()=>warmScene('territory');
  let dragging=false,startX=0,startY=0,originX=0,originY=0;
  photo.addEventListener('pointerdown',e=>{if(!scene||scene==='territory')return;dragging=true;startX=e.clientX;startY=e.clientY;originX=panX;originY=panY;photo.setPointerCapture(e.pointerId)});
  photo.addEventListener('pointermove',e=>{if(!scene||!dragging)return;const maxX=root.clientWidth*.024,maxY=root.clientHeight*.024;setPan(Math.max(-maxX,Math.min(maxX,originX+(e.clientX-startX)*.16)),Math.max(-maxY,Math.min(maxY,originY+(e.clientY-startY)*.13)))});
  photo.addEventListener('pointerup',()=>dragging=false);photo.addEventListener('pointercancel',()=>dragging=false);
  function linkPhoto(selector,key){const img=document.querySelector(selector);if(!img)return;img.classList.add('interactive-photo');img.setAttribute('tabindex','0');img.setAttribute('role','button');img.setAttribute('aria-label','Осмотреть: '+sceneData[key].name);img.onclick=()=>openScene(key);img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openScene(key)}}}
  linkPhoto('.intro-building img','courtyard');linkPhoto('#architectureImage','parking');linkPhoto('#lifeImage','landscape');
  // Gallery shots retain their full-screen controls and gain their own detail view.
  const fullImage=document.querySelector('#fullImage');if(fullImage){fullImage.style.cursor='zoom-in';let enlarged=false;fullImage.onclick=()=>{enlarged=!enlarged;fullImage.style.transform=enlarged?'scale(1.25)':'none';fullImage.style.transition='transform .6s'}}
  let dusk=0,lastActivity=performance.now(),motion=!reduced,fade=null,lastFrame=0;
  function paintDusk(){root.style.setProperty('--dusk',dusk.toFixed(4));root.dataset.light=dusk>.98?'night':dusk<.02?'day':'sunset';all('[data-time]').forEach(b=>{const active=b.dataset.time===(dusk>=.5?'night':'day');b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});q('.hero-index').textContent=scene?'РАКУРС / 0'+(Object.keys(sceneData).indexOf(scene)+1):dusk>.98?'ВЕЧЕР / 02':dusk<.02?'ДЕНЬ / 01':'СУМЕРКИ'}
  all('[data-time]').forEach(b=>b.onclick=()=>{lastActivity=performance.now();fade={from:dusk,to:b.dataset.time==='night'?1:0,start:lastActivity,duration:reduced?1:1800,auto:false}});
  const motionButton=q('.tour-motion');function paintMotion(){root.classList.toggle('tour-paused',!motion);motionButton.setAttribute('aria-pressed',String(motion));motionButton.innerHTML='<i></i> АНИМАЦИЯ · '+(motion?'ВКЛ':'ПАУЗА')}
  motionButton.onclick=()=>{motion=!motion;lastActivity=performance.now();if(!motion&&fade?.auto)fade=null;paintMotion()};paintMotion();paintDusk();
  const activity=()=>{lastActivity=performance.now()};['pointerdown','pointermove','keydown','wheel','touchstart'].forEach(type=>addEventListener(type,activity,{passive:true}));document.addEventListener('visibilitychange',activity);
  function cloudSize(){const sky=q('.cloud-sky'),image=q('.hero-image');const iw=image.naturalWidth||1664,ih=image.naturalHeight||941,w=root.clientWidth,h=root.clientHeight,scale=Math.max(w/iw,h/ih);sky.style.width=iw*scale+'px';sky.style.height=ih*scale+'px';sky.style.left=(w-iw*scale)*(w<=650?.66:.6)+'px';sky.style.top='0px'}
  q('.hero-image').addEventListener('load',cloudSize);new ResizeObserver(()=>{cloudSize();positionTerritoryPins()}).observe(root);cloudSize();
  function tick(now){if(now-lastFrame>=80){const rect=root.getBoundingClientRect(),visible=rect.bottom>100&&rect.top<innerHeight&&!document.hidden;if(!visible||scene||!motion||root.dataset.flight!=='idle')lastActivity=now;if(!fade&&motion&&!reduced&&visible&&!scene&&root.dataset.flight==='idle'&&dusk<.999&&now-lastActivity>35000)fade={from:dusk,to:1,start:now,duration:45000,auto:true};if(fade){if(fade.auto&&(!visible||scene||!motion||root.dataset.flight!=='idle')){fade.start=now;fade.from=dusk}else{const t=Math.min(1,(now-fade.start)/fade.duration);const ease=t*t*(3-2*t);dusk=fade.from+(fade.to-fade.from)*ease;paintDusk();if(t>=1)fade=null}}lastFrame=now}requestAnimationFrame(tick)}requestAnimationFrame(tick);
})();




