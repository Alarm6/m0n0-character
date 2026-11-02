(function(scope){
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function focusTransform(w,h,p,scale){const x=clamp((.5-p.x)*w*scale,-(scale-1)*w/2,(scale-1)*w/2),y=clamp((.5-p.y)*h*scale,-(scale-1)*h/2,(scale-1)*h/2);return{scale,x,y,transform:`translate3d(${x}px,${y}px,0) scale(${scale})`}}
  class CinematicTransition{
    constructor({root,veil,reduced=false,onStage=()=>{}}){Object.assign(this,{root,veil,reduced,onStage});this.sequence=0;this.animations=[];this.pending=new Set();root.dataset.flight='idle'}
    cancel(){this.sequence++;for(const a of this.animations)a.cancel();this.animations=[];for(const p of this.pending){clearTimeout(p.timer);p.resolve(false)}this.pending.clear();this.root.classList.remove('cinema-flight');this.root.dataset.flight='idle'}
    pause(ms,id){if(this.reduced)return Promise.resolve().then(()=>id===this.sequence);return new Promise(resolve=>{const p={resolve};p.timer=setTimeout(()=>{this.pending.delete(p);resolve(id===this.sequence)},ms);this.pending.add(p)})}
    animate(el,frames,duration,delay=0,easing='cubic-bezier(.22,.61,.36,1)'){const a=el.animate(frames,{duration:this.reduced?1:duration,delay:this.reduced?0:delay,easing,fill:'forwards'});this.animations.push(a);return a}
    async run(source,point,reveal,reverse=false){
      this.cancel();const id=this.sequence,kind=point.kind||'shadow';this.root.dataset.transitionKind=kind;this.root.classList.add('cinema-flight');this.root.dataset.flight=reverse?'returning':'entering';this.onStage(this.root.dataset.flight);
      const focus=focusTransform(this.root.clientWidth,this.root.clientHeight,point,point.fromOverview?2.15:kind==='shadow'?1.85:1.55);
      if(kind==='overview'){
        this.animate(source,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:reverse?'scale(.94)':'scale(.9)'}],900);
        if(!await this.pause(380,id))return false;
        const destination=reveal();this.releaseSource(source,destination);
        this.animate(destination,[{opacity:0,transform:reverse?'scale(1.055)':'scale(1.1)'},{opacity:1,transform:'scale(1)'}],1050);
        if(!await this.pause(1080,id))return false;
      }else{
        this.animate(source,[{opacity:1,transform:'translate3d(0,0,0) scale(1)',offset:0},{opacity:1,transform:focus.transform,offset:1}],1350,0,'cubic-bezier(.42,0,.35,1)');
        if(kind==='shadow'){
          this.animate(this.veil,[{opacity:1,clipPath:`circle(0% at ${point.x*100}% ${point.y*100}%)`},{opacity:1,clipPath:'circle(145% at 50% 55%)'}],600,420,'cubic-bezier(.55,0,.3,1)');
        }else{
          const vertical=kind==='path';const sign=reverse?-1:1;
          const entry=vertical?`translate3d(0,${sign*110}%,0) scale(1.18)`:`translate3d(${sign*-110}%,0,0) scale(1.18)`;
          this.animate(this.veil,[{opacity:0,transform:entry,offset:0},{opacity:1,transform:'translate3d(0,0,0) scale(1.18)',offset:1}],680,300,'cubic-bezier(.3,.1,.35,1)');
        }
        if(!await this.pause(1010,id))return false;
        const destination=reveal();this.releaseSource(source,destination);this.root.dataset.flight='settling';this.onStage('settling');
        this.animate(destination,[{opacity:.25,transform:reverse?'scale(.97)':'scale(1.09)'},{opacity:1,transform:'scale(1)'}],1050);
        if(kind==='shadow')this.animate(this.veil,[{opacity:1,clipPath:'circle(145% at 50% 55%)'},{opacity:0,clipPath:'circle(145% at 50% 55%)'}],750);
        else{const vertical=kind==='path',sign=reverse?-1:1;this.animate(this.veil,[{opacity:1,transform:'translate3d(0,0,0) scale(1.18)'},{opacity:0,transform:vertical?`translate3d(0,${sign*-105}%,0) scale(1.18)`:`translate3d(${sign*105}%,0,0) scale(1.18)`}],850)}
        if(!await this.pause(1080,id))return false;
      }
      this.cancel();return true;
    }
    releaseSource(source,destination){for(const a of this.animations)if(a.effect?.target===source)a.cancel()}
    forward(source,point,title,reveal){return this.run(source,point,reveal,false)}
    back(source,point,title,reveal){return this.run(source,point,reveal,true)}
  }
  const api={focusTransform,CinematicTransition};if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.CinematicMotion=api;
})(globalThis);
