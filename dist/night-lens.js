const hero=document.querySelector('.calm-hero'),layer=hero?.querySelector('.night-reveal');
if(hero&&layer&&(CSS.supports('mask-image','radial-gradient(black,transparent)')||CSS.supports('-webkit-mask-image','radial-gradient(black,transparent)'))){
 const image=layer.querySelector('img'),day=hero.querySelector('.hero-image'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let timer=0,frame=0,targetX=0,targetY=0,x=0,y=0,active=false,touchStart=null;
 function fit(){const iw=day.naturalWidth||1672,ih=day.naturalHeight||941,s=Math.max(hero.clientWidth/iw,hero.clientHeight/ih),w=iw*s,h=ih*s;Object.assign(image.style,{width:w+'px',height:h+'px',left:(hero.clientWidth-w)*(hero.clientWidth<650?.62:.5)+'px',top:(hero.clientHeight-h)*.5+'px'});layer.style.setProperty('--night-size',(hero.clientWidth<650?145:Math.min(300,hero.clientWidth*.22))+'px')}
 new ResizeObserver(fit).observe(hero);day.addEventListener('load',fit);fit();
 function paint(){frame=0;if(!active)return;x=reduce?targetX:x+(targetX-x)*.26;y=reduce?targetY:y+(targetY-y)*.26;layer.style.setProperty('--night-x',x+'px');layer.style.setProperty('--night-y',y+'px');if(Math.abs(x-targetX)+Math.abs(y-targetY)>.4)frame=requestAnimationFrame(paint)}
 function show(e){const r=hero.getBoundingClientRect();targetX=e.clientX-r.left;targetY=e.clientY-r.top;if(!active){x=targetX;y=targetY}active=true;clearTimeout(timer);if(image.complete&&image.naturalWidth)layer.classList.add('is-active');if(!frame)frame=requestAnimationFrame(paint)}
 function hide(){active=false;clearTimeout(timer);cancelAnimationFrame(frame);frame=0;layer.classList.remove('is-active');touchStart=null}
 image.addEventListener('load',()=>{if(active)layer.classList.add('is-active')});
 hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch'){if(touchStart&&Math.hypot(e.clientX-touchStart[0],e.clientY-touchStart[1])>14)hide();return}show(e)},{passive:true});
 hero.addEventListener('pointerdown',e=>{show(e);if(e.pointerType==='touch'){touchStart=[e.clientX,e.clientY];timer=setTimeout(hide,1800)}},{passive:true});
 hero.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){clearTimeout(timer);timer=setTimeout(hide,1600)}},{passive:true});hero.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide()});hero.addEventListener('pointercancel',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)hide()}).observe(hero);
 hero.dataset.nightLens='ready';
}

