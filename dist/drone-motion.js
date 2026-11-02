(function(scope){
  'use strict';
  function projectTarget(width,height,imageWidth,imageHeight,point,scale=2.65){
    const fit=Math.min(width/imageWidth,height/imageHeight),drawWidth=imageWidth*fit,drawHeight=imageHeight*fit;
    const x=(width-drawWidth)/2+drawWidth*point.x,y=(height-drawHeight)/2+drawHeight*point.y;
    return{x,y,scale,transform:`translate3d(${width/2-x*scale}px,${height/2-y*scale}px,0) scale(${scale})`};
  }
  class DroneTransition{
    constructor({root,aerial,image,marker,label,reduced=false,onStage=()=>{}}){Object.assign(this,{root,aerial,image,marker,label,reduced,onStage});this.animations=[];this.pending=new Set();this.sequence=0;root.dataset.flight='idle'}
    cancel(){this.sequence++;for(const a of this.animations)a.cancel();this.animations=[];for(const p of this.pending){clearTimeout(p.timer);p.resolve(false)}this.pending.clear();this.root.classList.remove('drone-flight');this.root.dataset.flight='idle'}
    pause(ms,id){if(this.reduced)return Promise.resolve().then(()=>id===this.sequence);return new Promise(resolve=>{const p={resolve,timer:0};p.timer=setTimeout(()=>{this.pending.delete(p);resolve(id===this.sequence)},ms);this.pending.add(p)})}
    animate(el,frames,duration,delay=0,easing='cubic-bezier(.22,.61,.36,1)'){const a=el.animate(frames,{duration:this.reduced?1:duration,delay:this.reduced?0:delay,easing,fill:'forwards'});this.animations.push(a);return a}
    setup(point,title){this.cancel();const id=this.sequence;this.root.style.setProperty('--flight-height',this.root.clientHeight+'px');const p=projectTarget(this.root.clientWidth,this.root.clientHeight,this.image.naturalWidth||1664,this.image.naturalHeight||941,point);this.marker.style.left=p.x+'px';this.marker.style.top=p.y+'px';this.label.textContent=title;this.aerial.style.transformOrigin='0 0';this.root.classList.add('drone-flight');return{id,p}}
    stage(name){this.root.dataset.flight=name;this.onStage(name)}
    async forward(source,point,title,reveal){
      const {id,p}=this.setup(point,title);this.stage('ascending');
      const pose=(at,scale)=>projectTarget(this.root.clientWidth,this.root.clientHeight,this.image.naturalWidth||1664,this.image.naturalHeight||941,at,scale).transform;
      const middle={x:(.5+point.x)/2,y:(.5+point.y)/2};
      // One uninterrupted flight curve: rise, travel and descend. No held overview frame.
      this.animate(source,[{opacity:1,transform:'translate3d(0,0,0) scale(1) rotateX(0deg)',offset:0},{opacity:.9,transform:'translate3d(0,5%,0) scale(.96) rotateX(4deg)',offset:.35},{opacity:0,transform:'translate3d(0,19%,0) scale(.76) rotateX(14deg)',offset:1}],1650);
      this.animate(this.aerial,[
        {opacity:0,transform:pose({x:.5,y:.43},1.48),offset:0},
        {opacity:1,transform:pose({x:.5,y:.47},1.14),offset:.24},
        {opacity:1,transform:pose({x:.5,y:.5},1.015),offset:.42},
        {opacity:1,transform:pose(middle,1.3),offset:.61},
        {opacity:1,transform:pose(point,2.05),offset:.81},
        {opacity:0,transform:p.transform,offset:1}
      ],4600,250,'linear');
      this.animate(this.image,[{transform:'rotateX(20deg) scale(1.08)',offset:0},{transform:'rotateX(0deg) scale(1)',offset:.42},{transform:'rotateX(0deg) scale(1)',offset:.61},{transform:'rotateX(15deg) scale(1.04)',offset:1}],4600,250,'linear');
      if(!await this.pause(1700,id))return false;this.stage('overview');
      if(!await this.pause(600,id))return false;this.stage('approaching');
      if(!await this.pause(1550,id))return false;
      const destination=reveal();this.stage('arriving');
      // Source and destination may be the same element when changing categories.
      if(source===destination){for(const a of this.animations){if(a.effect?.target===source)a.cancel()}}
      this.animate(destination,[{opacity:0,transform:'translate3d(0,-6%,0) scale(1.12) rotateX(-5deg)'},{opacity:1,transform:'translate3d(0,0,0) scale(1) rotateX(0deg)'}],1000);
      if(!await this.pause(1030,id))return false;this.cancel();return true;
    }
    async back(source,point,title,reveal){
      const {id,p}=this.setup(point,title);this.stage('leaving');
      const pose=(at,scale)=>projectTarget(this.root.clientWidth,this.root.clientHeight,this.image.naturalWidth||1664,this.image.naturalHeight||941,at,scale).transform;
      const middle={x:(.5+point.x)/2,y:(.5+point.y)/2};
      this.animate(source,[{opacity:1,transform:'translate3d(0,0,0) scale(1)'},{opacity:0,transform:'translate3d(0,14%,0) scale(.8) rotateX(10deg)'}],1250);
      this.animate(this.aerial,[{opacity:0,transform:p.transform,offset:0},{opacity:1,transform:pose(point,2.05),offset:.22},{opacity:1,transform:pose(middle,1.3),offset:.43},{opacity:1,transform:pose({x:.5,y:.5},1.015),offset:.62},{opacity:1,transform:pose({x:.5,y:.47},1.14),offset:.8},{opacity:0,transform:pose({x:.5,y:.43},1.48),offset:1}],4400,200,'linear');
      this.animate(this.image,[{transform:'rotateX(15deg) scale(1.04)',offset:0},{transform:'rotateX(0deg) scale(1)',offset:.43},{transform:'rotateX(0deg) scale(1)',offset:.62},{transform:'rotateX(20deg) scale(1.08)',offset:1}],4400,200,'linear');
      if(!await this.pause(2050,id))return false;this.stage('overview');
      if(!await this.pause(1500,id))return false;this.stage('returning');const home=reveal();
      this.animate(home,[{opacity:0,transform:'translate3d(0,12%,0) scale(.86) rotateX(8deg)'},{opacity:1,transform:'translate3d(0,0,0) scale(1) rotateX(0deg)'}],1080);
      if(!await this.pause(1100,id))return false;this.cancel();return true;
    }
  }
  const api={projectTarget,DroneTransition};if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.DroneMotion=api;
})(globalThis);
