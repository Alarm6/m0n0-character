import fs from 'node:fs';
const path='dist/photo-tour.js';let s=fs.readFileSync(path,'utf8');
s=s.replace("map.setAttribute('aria-hidden',String(value!=='map'));","map.setAttribute('aria-hidden',String(value!=='map'));map.inert=value!=='map';");
s=s.replace("was==='home'?1.14:1","was==='home'?1.015:1").replaceAll('scale(.93)','scale(1)').replaceAll('scale(.96)','scale(1)').replaceAll('baseTransform(0,1.12)','baseTransform(0,1.015)').replace('s=1.55','s=1.04');
s=s.replace("[{clipPath:'circle(0% at 50% 44%)',filter:'blur(3px)'},{clipPath:'circle(145% at 50% 44%)',filter:'blur(0px)'}],1050","[{opacity:0},{opacity:1}],800").replace("[{transform:'scale(1.16)'},{transform:'scale(1.025)'}],1500","[{transform:'scale(1.025)'},{transform:'scale(1.025)'}],800");
s=s.replace("}],1100);if(id!==sequence)return;","}],400);if(id!==sequence)return;");
s=s.replace("const next=!night,src=", "const expected=sequence,next=!night,src=").replace("try{await load(src);night=next;", "try{await load(src);if(expected!==sequence)return;night=next;");
fs.writeFileSync(path,s);
