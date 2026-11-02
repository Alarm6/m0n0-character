export function boundedFocus(width,height,point,scale=1.075){
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const x=clamp((.5-point[0])*width*scale,-(scale-1)*width/2,(scale-1)*width/2);
 const y=clamp((.5-point[1])*height*scale,-(scale-1)*height/2,(scale-1)*height/2);
 return{x,y,scale,transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`};
}
