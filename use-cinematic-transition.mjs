import fs from 'node:fs';
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace('<link rel="stylesheet" href="drone.css">','<link rel="stylesheet" href="cinematic.css">');
html=html.replace(/<div class="tour-aerial"[\s\S]*?<div class="hero-shade">/,'<div class="cinema-veil" aria-hidden="true"></div><button class="territory-open">Посмотреть территорию</button><div class="hero-shade">');
html=html.replace('<script src="drone-motion.js"></script>','<script src="cinematic-motion.js"></script>');
fs.writeFileSync('dist/index.html',html);
let js=fs.readFileSync('dist/tour.js','utf8');
js=js.replace('  Object.values(sceneData)',`  sceneData.territory={name:'Территория',image:'assets/tour-aerial.webp',label:'ВЕСЬ КОМПЛЕКС',title:'Территория комплекса',description:'Выберите место на общем плане: паркинг, площадку, двор или зелёный маршрут.',features:[],pins:[]};
  Object.values(sceneData)`);
const start=js.indexOf('  function renderScene('),end=js.indexOf('  async function openScene(',start);
if(start<0||end<0)throw Error('Cannot find scene renderer');
const replacement=`  const portalPoints={parking:{x:.82,y:.78,kind:'shadow'},playground:{x:.38,y:.8,kind:'foliage'},courtyard:{x:.6,y:.85,kind:'path'},landscape:{x:.22,y:.72,kind:'foliage'},territory:{x:.5,y:.5,kind:'overview'}};
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
`;
js=js.slice(0,start)+replacement+js.slice(end);
js=js.replace("await Promise.all([preload.decode(),q('.tour-aerial img').decode()])","await preload.decode()");
js=js.replace("flight.forward(source,dronePoints[key],sceneData[key].name", "flight.forward(source,{...portalPoints[key],...(scene==='territory'&&planPoints[key]?{...planPoints[key],fromOverview:true}:{})},sceneData[key].name");
js=js.replace("scene=key;photo.src=preload.src;renderScene(key);root.classList.add('at-scene');","scene=key;root.dataset.sceneKey=key;photo.src=preload.src;renderScene(key);root.classList.add('at-scene');");
js=js.replace("root.classList.remove('at-scene','departing','switching');destination", "root.classList.remove('at-scene','departing','switching');delete root.dataset.sceneKey;destination");
js=js.replace('flight.back(destination,dronePoints[previous]','flight.back(destination,portalPoints[previous]');
js=js.replace("if(!scene)return;dragging=true", "if(!scene||scene==='territory')return;dragging=true");
js=js.replace("new ResizeObserver(cloudSize).observe(root);", "new ResizeObserver(()=>{cloudSize();positionTerritoryPins()}).observe(root);");
js=js.replace("  let dragging=false", "  q('.territory-open').onclick=()=>openScene('territory');q('.territory-open').onpointerenter=()=>warmScene('territory');q('.territory-open').onfocus=()=>warmScene('territory');\n  let dragging=false");
fs.writeFileSync('dist/tour.js',js);
