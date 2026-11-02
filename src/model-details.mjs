import * as T from 'three';
const BOX=new T.BoxGeometry(1,1,1);
function surface(color,roughness=.85){return new T.MeshStandardMaterial({color,roughness})}
// Real leaf silhouettes rather than solid geometric tree crowns.
function foliageTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 const lobes=[[-.3,-.3,.22,.12],[-.02,-.4,.2,.12],[.27,-.25,.25,.12],[-.3,.05,.25,.13],[.05,-.04,.28,.14],[.3,.18,.22,.13],[-.15,.32,.24,.14],[.15,.43,.22,.12]];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*2-1,v=y/size*2-1,i=(y*size+x)*4;
  const leaf=lobes.some(([cx,cy,rx,ry])=>((u-cx)/rx)**2+((v-cy)/ry)**2<1);
  const stem=Math.abs(u-v*.22)<.015&&v>-.55&&v<.5;
  const n=((x*17+y*29)%19)/19;data.set([115+n*38,143+n*42,81+n*27,leaf||stem?255:0],i);
 }
 const texture=new T.DataTexture(data,size,size);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
function noiseMap(seed,repeat){const n=128,data=new Uint8Array(n*n*4);for(let i=0;i<n*n;i++){seed=(seed*1664525+1013904223)>>>0;let v=175+(seed>>>26);data.set([v,v,v,255],i*4)}const t=new T.DataTexture(data,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.needsUpdate=true;return t}
export function outdoorEnvironment(){
 const w=512,h=256,data=new Uint8Array(w*h*4);
 const sky=new T.Color('#a9bfd1'),horizon=new T.Color('#e3d6be'),ground=new T.Color('#545b4f');
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const t=y/h,c=y<h/2?sky.clone().lerp(horizon,Math.pow(t*2,3)):horizon.clone().lerp(ground,Math.min(1,(t-.5)*5));
  const sun=Math.exp(-((x/w-.27)**2+(t-.3)**2)/.002);c.r+=sun*.7;c.g+=sun*.6;c.b+=sun*.4;const i=(y*w+x)*4;data.set([Math.min(255,c.r*255),Math.min(255,c.g*255),Math.min(255,c.b*255),255],i);
 }
 const texture=new T.DataTexture(data,w,h);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;
}
export function addSiteDetails({above,yard,green,parking,trees,random,materials,box,instances}){
 const pavement=surface('#a69e91'),asphalt=surface('#383c3d'),soil=surface('#444331'),kerb=surface('#aaa394'),wood=surface('#8b7052');
 asphalt.map=noiseMap(4391,24);asphalt.bumpMap=asphalt.map;asphalt.bumpScale=.025;
 pavement.map=noiseMap(87451,12);pavement.bumpMap=pavement.map;pavement.bumpScale=.035;
 materials.ground.map=pavement.map;materials.ground.roughness=.96;
 materials.stone.bumpMap=materials.stone.map;materials.stone.bumpScale=.018;
 materials.wood.map=noiseMap(113,8);
 // A continuous street and sidewalk ground the building in an urban setting.
 box(above,44,-.12,-2,11,.1,140,asphalt);
 box(above,36.8,-.04,-2,3.2,.18,140,pavement);
 const kerbs=[],markings=[];
 for(let z=-70;z<68;z+=1.5)kerbs.push({x:38.5,y:.04,z,w:.22,h:.28,d:1.47});
 for(let z=-64;z<68;z+=8)markings.push({x:44,y:-.06,z,w:.12,h:.01,d:3});
 for(let z=12;z<19;z+=1.2)markings.push({x:44,y:-.05,z,w:10,h:.01,d:.55});
 instances(above,BOX,kerb,kerbs);instances(above,BOX,surface('#b8b5a5'),markings);
 // Recessed lobbies, metal door frames, handles and glass canopies.
 for(const x of[-14,14]){
  box(yard,x,1.65,-.02,4.5,3.3,.45,materials.dark);
  for(const dx of[-1.05,1.05]){
   box(yard,x+dx,1.5,.26,1.9,2.9,.08,materials.glass);
   for(const edge of[-.98,.98])box(yard,x+dx+edge,1.5,.31,.07,3,.07,materials.bronze);
   box(yard,x+dx+(dx<0?.72:-.72),1.4,.4,.045,.65,.08,materials.metal);
  }
  box(yard,x,3.3,1,5.5,.12,2.5,materials.bronze);box(yard,x,3.4,1,5.25,.08,2.2,materials.glass);
  box(yard,x,.1,1.7,5.8,.18,2.4,pavement);
  for(let s=0;s<3;s++)box(yard,x,.08-s*.025,3+s*.42,5.8,.12,.4,kerb);
  box(yard,x+2.6,1.65,.23,.28,.75,.1,materials.metal);
  for(const dx of[-2.2,2.2])box(yard,x+dx,2.5,.38,.13,.6,.12,materials.lit);
 }
 // Thin timber slats and fine metal details replace solid furniture blocks.
 const seatSlats=[],drains=[],edging=[];
 for(const [x,z]of[[13,8],[13,19],[-1,14],[3,25],[-25,21]])for(let s=0;s<8;s++)seatSlats.push({x:x-1.65+s*.46,y:.99,z,w:.4,h:.05,d:1.08});
 instances(yard,BOX,wood,seatSlats);
 for(let z=2;z<23;z+=.3)drains.push({x:11.7,y:.23,z,w:.3,h:.025,d:.08});
 instances(yard,BOX,materials.dark,drains);
 for(const [x,z,w,d]of[[-31,9,5,33],[29,20,10,16],[-12,28,30,3],[10,28,19,3],[-3,6,5,7]]){
  box(green,x,.32,z,w-.1,.04,d-.1,soil);
  for(const side of[-1,1])edging.push({x:x+side*w/2,y:.33,z,w:.06,h:.22,d});
 }
 instances(green,BOX,surface('#5f5c50'),edging);
 // Layered alpha-tested leaves: single shared texture and instanced geometry.
 const leaves=[],branches=[];
 for(const [x,z,treeHeight]of trees){
  const h=treeHeight;
  for(let b=0;b<5;b++){const a=b*2.4;branches.push({x:x+Math.cos(a)*.5,y:h-.8,z:z+Math.sin(a)*.5,w:.07,h:2,d:.07,rz:Math.cos(a)*.55,rx:Math.sin(a)*.55})}
  for(let j=0;j<420;j++){
   const a=random()*Math.PI*2,u=random()*2-1,r=Math.sqrt(1-u*u)*(1.2+random()*.85);
   leaves.push({x:x+Math.cos(a)*r,y:h+u*1.9,z:z+Math.sin(a)*r,w:.65+random()*.65,h:.75+random()*.5,d:1,rx:(random()-.5)*1.7,ry:random()*Math.PI});
  }
 }
 instances(green,BOX,materials.trunk,branches);
 const foliage=new T.MeshStandardMaterial({map:foliageTexture(),alphaTest:.45,side:T.DoubleSide,roughness:1,color:'#e0e4cf'});
 const leafMesh=instances(green,new T.PlaneGeometry(1,1),foliage,leaves);leafMesh.name='detailed-foliage';
 for(let i=0;i<leaves.length;i++)leafMesh.setColorAt(i,new T.Color().setHSL(.22+random()*.1,.17+random()*.16,.65+random()*.25));
 // Perennial planting groups and individual stems, varied in height and spacing.
 const stems=[],flowers=[];
 for(let i=0;i<950;i++){
  const side=i%2,x=side?27+random()*5:-33+random()*3,z=3+random()*24,h=.3+random()*.6;
  stems.push({x,y:.35+h/2,z,w:.018,h,d:.018,rz:(random()-.5)*.4});
  if(i%3===0)flowers.push({x,y:.35+h,z,w:.07,h:.12,d:.07});
 }
 instances(green,BOX,surface('#747650'),stems);instances(green,new T.IcosahedronGeometry(1,0),surface('#8e8290'),flowers);
 // Baked contact occlusion supplements the sun shadow without a full-screen postprocess.
 const aoSize=256,ao=new Uint8Array(aoSize*aoSize*4);
 for(let y=0;y<aoSize;y++)for(let x=0;x<aoSize;x++){
  const wx=x/(aoSize-1)*74-37,wz=31-y/(aoSize-1)*62;
  const dx=Math.max(0,Math.abs(wx)-26.5),dz=Math.max(0,Math.abs(wz+10)-9.5);
  let shade=.42*Math.exp(-(dx*dx+dz*dz)/2.4);
  for(const [tx,tz]of trees)shade+=.17*Math.exp(-((wx-tx)**2+(wz-tz)**2)/2);
  const i=(y*aoSize+x)*4;ao.set([20,18,15,Math.min(.6,shade)*255],i);
 }
 const aoTexture=new T.DataTexture(ao,aoSize,aoSize);aoTexture.needsUpdate=true;
 const contact=new T.Mesh(new T.PlaneGeometry(74,62),new T.MeshBasicMaterial({map:aoTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
 contact.rotation.x=-Math.PI/2;contact.position.y=.25;contact.name='contact-occlusion';above.add(contact);
 // Entry control, safety bollards and a physically detailed parked vehicle.
 for(const x of[25,33])for(const z of[6,8]){box(parking,x,.65,z,.16,1.2,.16,materials.metal);box(parking,x,1.12,z,.18,.08,.18,materials.lit)}
 box(parking,25.1,1.15,3,.5,2.2,.5,materials.dark);box(parking,25.1,1.7,3.27,.35,.35,.05,materials.glass);
 box(parking,29,1.5,3,7,.09,.12,surface('#d6c9b5'));
 const car=new T.Group();car.position.set(43.5,0,-15);above.add(car);car.userData.zone='parking';
 const paint=new T.MeshStandardMaterial({color:'#626568',metalness:.7,roughness:.26});
 box(car,0,.68,0,1.85,.55,4.5,paint);box(car,0,1.13,-.15,1.66,.5,2.45,materials.glass);box(car,0,1.43,-.25,1.65,.08,2.1,paint);
 const wheelGeo=new T.CylinderGeometry(.34,.34,.18,16),rubber=surface('#17191b');
 for(const x of[-.93,.93])for(const z of[-1.4,1.4]){const w=new T.Mesh(wheelGeo,rubber);w.rotation.z=Math.PI/2;w.position.set(x,.35,z);car.add(w);const hub=new T.Mesh(new T.CylinderGeometry(.19,.19,.19,12),materials.metal);hub.rotation.z=Math.PI/2;hub.position.copy(w.position);car.add(hub)}
 for(const x of[-.6,.6]){box(car,x,.76,2.26,.48,.15,.04,surface('#e2ddd0'));box(car,x,.8,-2.26,.45,.12,.04,surface('#692e24'))}
 box(car,0,.45,2.28,.62,.12,.03,surface('#b7b3a4'));
 above.userData.detailStats={leaves:leaves.length,planting:stems.length,entrances:2};
}

