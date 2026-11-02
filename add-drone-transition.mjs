import fs from 'node:fs';
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace('<link rel="stylesheet" href="tour.css">','<link rel="stylesheet" href="tour.css"><link rel="stylesheet" href="drone.css">');
html=html.replace('<div class="hero-shade"></div>','<div class="tour-aerial" aria-hidden="true"><img src="assets/tour-aerial.png" alt="Общий вид жилого комплекса с дрона"><span class="drone-marker"></span></div><div class="drone-route" aria-hidden="true"><span class="route-home">Главный вид</span><span class="route-overview">Вид сверху</span><span class="route-target">Локация</span></div><div class="hero-shade"></div>');
html=html.replace('<script src="tour.js"></script>','<script src="drone-motion.js"></script><script src="tour.js"></script>');
fs.writeFileSync('dist/index.html',html);
let js=fs.readFileSync('dist/tour.js','utf8');
const start=js.indexOf('  async function openScene('),end=js.indexOf("  all('[data-scene]')",start);
if(start<0||end<0)throw new Error('Cannot locate scene transition code');
const replacement=`  const dronePoints={parking:{x:.82,y:.71},playground:{x:.245,y:.70},courtyard:{x:.52,y:.625},landscape:{x:.43,y:.855}};
  let flightTarget=null;
  const flight=new DroneMotion.DroneTransition({root,aerial:q('.tour-aerial'),image:q('.tour-aerial img'),marker:q('.drone-marker'),label:q('.route-target'),reduced,onStage:stage=>{
    root.dataset.journeyState=stage;
    status.textContent=stage==='overview'?'Общий вид комплекса':stage==='approaching'?'Приближаемся: '+sceneData[flightTarget].name:stage==='ascending'?'Поднимаемся над комплексом':stage==='returning'?'Возвращаемся к дому':'';
  }});
  async function openScene(key){
    if(!sceneData[key])return;
    const token=++operation;flight.cancel();flightTarget=key;returnFocus=scene?returnFocus:document.activeElement;
    root.dataset.journeyState='loading';root.dataset.flight='loading';status.textContent='Загружаем ракурс…';
    all('.tour-pins button').forEach(b=>b.disabled=true);caption.hidden=true;toolbar.hidden=false;back.disabled=false;
    if(root.getBoundingClientRect().top<-40)scrollTo({top:document.querySelector('#home').offsetTop,behavior:reduced?'instant':'smooth'});
    const preload=new Image();preload.src=sceneData[key].image;
    try{await Promise.all([preload.decode(),q('.tour-aerial img').decode()])}catch{
      if(token!==operation)return;root.dataset.flight='idle';root.dataset.journeyState=scene?'scene':'home';status.textContent='Не удалось загрузить вид. Попробуйте ещё раз.';
      all('.tour-pins button').forEach(b=>b.disabled=false);toolbar.hidden=!scene;caption.hidden=!scene;
      setTimeout(()=>{if(token===operation)status.textContent=''},3500);return;
    }
    if(token!==operation)return;
    const source=scene?destination:home;
    const arrived=await flight.forward(source,dronePoints[key],sceneData[key].name,()=>{
      scene=key;photo.src=preload.src;renderScene(key);root.classList.add('at-scene');
      destination.setAttribute('aria-hidden','false');home.setAttribute('aria-hidden','true');return destination;
    });
    if(!arrived||token!==operation)return;
    status.textContent='';root.dataset.journeyState='arriving';await wait(750);if(token!==operation)return;
    caption.hidden=false;root.dataset.journeyState='scene';back.focus({preventScroll:true});
  }
  async function closeScene(){
    const token=++operation,previous=scene,interrupted=root.dataset.flight!=='idle';
    flight.cancel();caption.hidden=true;status.textContent='';back.disabled=true;
    all('.tour-pins button').forEach(b=>b.disabled=true);root.dataset.journeyState='returning';
    const revealHome=()=>{root.classList.remove('at-scene','departing','switching');destination.setAttribute('aria-hidden','true');home.setAttribute('aria-hidden','false');return home};
    if(previous&&!interrupted){flightTarget=previous;const done=await flight.back(destination,dronePoints[previous],sceneData[previous].name,revealHome);if(!done||token!==operation)return}else revealHome();
    if(token!==operation)return;scene=null;status.textContent='';toolbar.hidden=true;setPan();lastActivity=performance.now();await wait(800);
    if(token!==operation)return;all('.tour-pins button').forEach(b=>b.disabled=false);back.disabled=false;root.dataset.journeyState='home';
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
  }
`;
js=js.slice(0,start)+replacement+js.slice(end);
js=js.replace("(scene||root.classList.contains('departing'))","(scene||root.dataset.flight!=='idle')");
js=js.replace("if(!visible||scene||!motion)lastActivity=now;","if(!visible||scene||!motion||root.dataset.flight!=='idle')lastActivity=now;");
js=js.replace("visible&&!scene&&dusk<.999","visible&&!scene&&root.dataset.flight==='idle'&&dusk<.999");
js=js.replace("(!visible||scene||!motion)","(!visible||scene||!motion||root.dataset.flight!=='idle')");
fs.writeFileSync('dist/tour.js',js);
