import * as T from 'three';
import {ZONES} from './model-data.mjs';
import {addSiteDetails} from './model-details.mjs';
const BOX=new T.BoxGeometry(1,1,1),CYL=new T.CylinderGeometry(1,1,1,8),LEAF=new T.IcosahedronGeometry(1,1);
export function createModel(){
 const scene=new T.Scene();scene.background=new T.Color('#211c18');scene.fog=new T.FogExp2('#211c18',.0025);
 const above=new T.Group(),underground=new T.Group();scene.add(above,underground);
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
 // Deterministic mineral grain, shared by every stone surface; no image downloads.
 const grain=new Uint8Array(128*128*4);let noise=19283;
 for(let i=0;i<128*128;i++){noise=(noise*1664525+1013904223)>>>0;const v=214+(noise>>>27);grain.set([v,v,v,255],i*4)}
 const stoneMap=new T.DataTexture(grain,128,128);stoneMap.wrapS=stoneMap.wrapT=T.RepeatWrapping;stoneMap.repeat.set(5,5);stoneMap.colorSpace=T.SRGBColorSpace;stoneMap.needsUpdate=true;
 const materials={stone:mat('#c4b39b'),bronze:mat('#655746',{metalness:.6,roughness:.45}),glass:mat('#273135',{metalness:.5,roughness:.28}),wood:mat('#8c6c4c'),ground:mat('#9a8e7d'),path:mat('#c0b39f'),plant:mat('#526049'),trunk:mat('#8e826a'),dark:mat('#302f2b'),sand:mat('#b7a68a'),lit:mat('#b5a18a',{emissive:'#d49f5d',emissiveIntensity:0}),metal:mat('#555854',{metalness:.7,roughness:.4})};
 materials.stone.map=stoneMap;materials.stone.color.set('#b8a58b');materials.glass.color.set('#46565f');materials.glass.metalness=.85;materials.glass.roughness=.17;materials.bronze.color.set('#4c4036');materials.plant.color.set('#3e5140');
 const ambient=new T.HemisphereLight('#e1e9f0','#625447',1);const sun=new T.DirectionalLight('#fff0d4',2.4);sun.position.set(40,60,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-52,right:52,top:55,bottom:-50,near:1,far:180});sun.shadow.bias=-.00015;sun.shadow.normalBias=.035;const fill=new T.DirectionalLight('#a6b2bd',.5);fill.position.set(-40,30,-30);scene.add(ambient,sun,fill);
 sun.shadow.camera.updateProjectionMatrix();
 const interactive=[],zoneGroups={},highlight=new T.Group();scene.add(highlight);
 function group(zone,parent=above){const g=new T.Group();g.userData.zone=zone;parent.add(g);zoneGroups[zone]=g;return g}
 function box(parent,x,y,z,w,h,d,m,zone){const mesh=new T.Mesh(BOX,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;if(zone)mesh.userData.zone=zone;parent.add(mesh);return mesh}
 function cylinder(parent,x,y,z,r,h,m){const mesh=new T.Mesh(CYL,m);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.castShadow=true;parent.add(mesh);return mesh}
 function instances(parent,geo,m,items){const mesh=new T.InstancedMesh(geo,m,items.length),dummy=new T.Object3D();items.forEach((v,i)=>{dummy.position.set(v.x||0,v.y||0,v.z||0);dummy.rotation.set(v.rx||0,v.ry||0,v.rz||0);dummy.scale.set(v.w||1,v.h||1,v.d||1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 box(above,0,-.3,0,190,.2,190,materials.dark);box(above,0,.02,0,72,.12,60,materials.ground,'courtyard');
 // A physical model plinth: subtle raised edges and an inset warm stone site.
 const edgeMaterial=mat('#948c80');for(const z of[-30.5,30.5])box(above,0,-.1,z,73,.25,.22,edgeMaterial);for(const x of[-36.5,36.5])box(above,x,-.1,0,.22,.25,61,edgeMaterial);
 const podium=group('courtyard');box(podium,0,3.1,-10,53,6.1,19,materials.stone);
 const podiumFrames=[],podiumGlass=[];for(let x=-24;x<=24;x+=2.4)for(let f=0;f<2;f++){podiumFrames.push({x,y:1.6+f*2.5,z:-.42,w:1.5,h:2.05,d:.18});podiumGlass.push({x,y:1.6+f*2.5,z:-.3,w:1.18,h:1.85,d:.12})}instances(podium,BOX,materials.bronze,podiumFrames);instances(podium,BOX,materials.glass,podiumGlass);
 const floorBands={};
 function tower(id,x,floors){const g=group(id),height=floors*2.1,y0=6.2;box(g,x,y0+height/2,-10,11.3,height,13.3,materials.stone);box(g,x,y0+height+.12,-10,12.6,.3,14.6,materials.stone);const frames=[],glass=[],warm=[],slabs=[];
  for(let f=0;f<floors;f++){const y=y0+f*2.1+1.03;slabs.push({x,y:y0+f*2.1,z:-10,w:12.2,h:.065,d:14.2});for(let col=0;col<5;col++){for(const side of[-1,1]){const v={x:x-4.65+col*2.3,y,z:-10+side*7.04,w:1.24,h:1.66,d:.16};frames.push(v);const p={...v,z:v.z+side*.1,w:.94,h:1.48,d:.09};glass.push(p);if((f*13+col*7+(side+1)*3)%7<2)warm.push({...p,z:p.z+side*.052,w:.84,h:1.38,d:.015})}}for(let col=0;col<5;col++)for(const side of[-1,1]){frames.push({x:x+side*6.04,y,z:-15.1+col*2.55,w:.16,h:1.66,d:1.25});glass.push({x:x+side*6.14,y,z:-15.1+col*2.55,w:.09,h:1.48,d:.95})}}
  instances(g,BOX,materials.bronze,frames);const panes=instances(g,BOX,materials.glass,glass);glass.forEach((v,i)=>panes.setColorAt(i,new T.Color().setRGB(.55+(i*13%11)*.035,.62+(i*7%13)*.025,.68+(i*3%9)*.03)));instances(g,BOX,materials.lit,warm);instances(g,BOX,materials.stone,slabs);
  const reveals=[],mullions=[],sills=[],curtains=[],balconies=[],rails=[],joints=[],piers=[];
  const curtainMat=mat('#a69884',{roughness:1}),revealMat=mat('#4d4943'),jointMat=mat('#8a8072');
  for(let f=0;f<floors;f++){
   const y=y0+f*2.1+1.03;
   for(let c=0;c<5;c++)for(const side of[-1,1]){
    const xx=x-4.65+c*2.3,zz=-10+side*7.24;
    mullions.push({x:xx,y,z:zz,w:.045,h:1.5,d:.08});
    sills.push({x:xx,y:y-.85,z:zz,w:1.35,h:.075,d:.38});
    for(const dx of[-.69,.69])reveals.push({x:xx+dx,y,z:zz-side*.12,w:.12,h:1.85,d:.4});
    if((f*11+c*3+(side+1))%4===0)curtains.push({x:xx-.27,y,z:zz+side*.015,w:.36,h:1.35,d:.025});
    if(c===4&&f>0&&f%3!==0){balconies.push({x:xx,y:y-.94,z:zz+side*.55,w:1.9,h:.16,d:1.4});rails.push({x:xx,y:y-.38,z:zz+side*1.22,w:1.85,h:.035,d:.045});for(let b=0;b<6;b++)rails.push({x:xx-.85+b*.34,y:y-.66,z:zz+side*1.22,w:.025,h:.55,d:.025})}
   }
   for(let c=0;c<6;c++){
    for(const side of[-1,1])piers.push({x:x-5.8+c*2.3,y,z:-10+side*7.02,w:.86,h:2.1,d:.42});
    joints.push({x:x-5.75+c*2.3,y,z:-2.755,w:.025,h:2.04,d:.012});
   }
   for(const side of[-1,1]){
    piers.push({x,y:y-.96,z:-10+side*7.02,w:12.5,h:.3,d:.43});
    for(let c=0;c<6;c++)piers.push({x:x+side*6.03,y,z:-16.37+c*2.55,w:.42,h:2.1,d:1.1});
   }
  }
  instances(g,BOX,materials.stone,piers);instances(g,BOX,revealMat,reveals);instances(g,BOX,materials.bronze,mullions);instances(g,BOX,materials.stone,sills);instances(g,BOX,curtainMat,curtains);instances(g,BOX,materials.stone,balconies);instances(g,BOX,materials.bronze,rails);instances(g,BOX,jointMat,joints);
  box(g,x+1,y0+height+.8,-11,4,1.4,4,materials.dark);
  const roof=mat('#696761');box(g,x,y0+height+.3,-10,11.8,.12,13.8,roof);
  for(const sx of[-5.8,5.8])box(g,x+sx,y0+height+.65,-10,.15,1.1,13.8,materials.stone);for(const sz of[-16.8,-3.2])box(g,x,y0+height+.65,sz,11.6,1.1,.15,materials.stone);
  for(let vent=0;vent<4;vent++){box(g,x-3+vent*1.5,y0+height+.65,-13,1,.55,1.2,materials.metal);for(let slat=0;slat<4;slat++)box(g,x-3+vent*1.5,y0+height+.5+slat*.1,-12.38,.9,.035,.04,materials.dark)}
  const band=new T.Mesh(BOX,new T.MeshBasicMaterial({color:'#e9cf9c',transparent:true,opacity:.27,depthWrite:false}));band.position.set(x,y0+1.05,-10);band.scale.set(12.8,2.05,14.8);band.visible=false;highlight.add(band);floorBands[id]=band;return g;
 }
 tower('buildingA',-14,14);tower('buildingB',14,17);
 // Paths and meeting places.
 const yard=group('courtyard');box(yard,5,.15,12,13,.13,24,materials.path);box(yard,-1,.16,24,58,.14,3.5,materials.path);box(yard,-15,.15,2,30,.13,3.4,materials.path);
 function bench(parent,x,z,rotation=0){const b=new T.Group();b.position.set(x,0,z);b.rotation.y=rotation;parent.add(b);box(b,0,.85,0,3.6,.24,1.1,materials.wood);box(b,0,1.65,-.45,3.6,1,.15,materials.wood);for(const sx of[-1.3,1.3])box(b,sx,.42,0,.18,.8,.8,materials.metal)}
 bench(yard,13,8,-Math.PI/2);bench(yard,13,19,-Math.PI/2);bench(yard,-1,14,Math.PI/2);bench(yard,3,25);
 // Playground with actual timber structures, ropes and a slide.
 const play=group('playground');box(play,-18,.19,15,20,.2,16,materials.sand);
 for(const x of[-21,-16])for(const z of[12,17])cylinder(play,x,2.6,z,.17,5.2,materials.wood);
 box(play,-18.5,3.4,14.5,5.3,.22,5.3,materials.wood);box(play,-18.5,5.1,12,5.2,.22,.22,materials.wood);
 const slide=box(play,-12.7,1.8,14.5,5.9,.16,1.6,materials.metal);slide.rotation.z=-.54;
 for(const z of[13.7,15.3]){const rail=box(play,-12.7,2.08,z,5.9,.24,.1,materials.metal);rail.rotation.z=-.54}
 for(let i=0;i<5;i++)box(play,-23.3,.4+i*.57,14.4-i*.6,2,.18,.2,materials.wood);
 for(let i=0;i<6;i++){box(play,-22.7+i*.65,1.6,18,.045,2.7,.045,materials.dark);box(play,-21, .35+i*.45,18,3.4,.035,.035,materials.dark)}
 bench(play,-26,11,Math.PI/2);bench(play,-25,21);
 // Garden islands and instanced birch-like trees.
 const green=group('landscape');for(const [x,z,w,d]of[[-31,9,5,33],[29,20,10,16],[-12,28,30,3],[10,28,19,3],[-3,6,5,7]])box(green,x,.18,z,w,.23,d,materials.plant);
 const trunks=[],canopies=[];let seed=98241;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const trees=[];for(let z=-24;z<=26;z+=7)trees.push([-31,z],[32,z]);for(let x=-24;x<=24;x+=7)trees.push([x,27]);trees.push([-5,7],[18,23],[-26,3],[24,-24],[-25,-23]);
 for(const tree of trees){const [x,z]=tree;const h=4.2+random()*2.7;tree[2]=h;trunks.push({x,y:h/2,z,w:.12,h,d:.12});for(let j=0;j<36;j++){const a=random()*Math.PI*2,r=Math.sqrt(random())*2;canopies.push({x:x+Math.cos(a)*r,y:h-.2+random()*2.4,z:z+Math.sin(a)*r,w:.5+random()*.65,h:.6+random()*.6,d:.5+random()*.65,ry:a})}}
 instances(green,CYL,materials.trunk,trunks);
 const grass=[];for(let i=0;i<1600;i++){const x=-34+random()*68,z=25+random()*3;grass.push({x,y:.35+random()*.3,z,w:.025,h:.35+random()*.65,d:.035,rz:(random()-.5)*.6})}instances(green,BOX,mat('#877b56'),grass);
 const pavers=[];for(let z=3;z<24;z+=1.2)for(let x=0;x<11;x+=1.2)pavers.push({x:x-.5,y:.225,z,w:1.16,h:.025,d:1.16});instances(yard,BOX,mat('#b3aaa0'),pavers);
 const shrubs=[];for(let i=0;i<110;i++){const x=-32+random()*64,z=25+random()*3;shrubs.push({x,y:.65,z,w:.45+random()*.4,h:.6+random()*.6,d:.5+random()*.4})}instances(green,LEAF,materials.plant,shrubs);
 // Parking entry and an inspectable underground level.
 const parking=group('parking');box(parking,29,.25,0,9,.2,16,materials.dark);for(const x of[24.5,33.5])box(parking,x,.8,0,.3,1.4,16,materials.stone);box(parking,29,1.8,-6,9,3.6,.25,materials.dark);box(parking,29,3.7,-5.8,9.5,.35,1.2,materials.stone);box(parking,29,3.32,-5.5,7.8,.07,.12,materials.lit);const ramp=box(parking,29,.25,2,8,.16,11,materials.dark);ramp.rotation.x=-.1;
 const garageFloor=box(underground,0,-3.3,-1,67,.25,49,materials.dark);const columns=[],cars=[],carGlass=[],lines=[];
 for(let x=-27;x<=27;x+=6){for(const z of[-19,0,19])columns.push({x,y:-1.6,z,w:.55,h:3.2,d:.55});for(const z of[-14,13]){cars.push({x,y:-2.7,z,w:2.7,h:.7,d:4.4});carGlass.push({x,y:-2.15,z:z-.2,w:2.35,h:.55,d:2.45});lines.push({x:x-2,y:-3.14,z,w:.08,h:.02,d:5.2})}}instances(underground,BOX,materials.stone,columns);instances(underground,BOX,materials.metal,cars);instances(underground,BOX,materials.glass,carGlass);instances(underground,BOX,materials.path,lines);underground.visible=false;
 const lamps=[];for(let z=4;z<=24;z+=5)for(const x of[-4,14]){box(above,x,.9,z,.24,1.8,.24,materials.dark);lamps.push({x,y:1.52,z,w:.26,h:.2,d:.26})}instances(above,BOX,materials.lit,lamps);
 const routePoints=[[-14,.3,-.2],[-14,.3,2],[5,.3,2],[5,.3,21],[-18,.3,21],[-18,.3,15]];const curve=new T.CatmullRomCurve3(routePoints.map(p=>new T.Vector3(...p)),false,'centripetal');const routeGeo=new T.BufferGeometry().setFromPoints(curve.getPoints(120));const route=new T.Line(routeGeo,new T.LineBasicMaterial({color:'#f2d3a0',transparent:true,opacity:.9,depthTest:false}));route.renderOrder=8;route.visible=false;scene.add(route);
 const overlays={};for(const [id,zone]of Object.entries(ZONES)){const pts=zone.footprint.map(([x,z])=>new T.Vector3(x,.42,z));const outline=new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#eed3aa',transparent:true,opacity:.8,depthTest:false}));outline.renderOrder=9;outline.visible=false;highlight.add(outline);overlays[id]=outline}
 addSiteDetails({above,yard,green,parking,trees,random,materials,box,instances});
 above.traverse(o=>{if(o.isMesh)interactive.push(o)});
 const materialDefaults=new Map();above.traverse(o=>{if(o.material&&!materialDefaults.has(o.material))materialDefaults.set(o.material,{opacity:o.material.opacity,transparent:o.material.transparent,depthWrite:o.material.depthWrite})});
 let section=false;
 function setSection(enabled){section=enabled;underground.visible=enabled;for(const [m,defaults]of materialDefaults){m.transparent=enabled||defaults.transparent;m.opacity=enabled?.105:defaults.opacity;m.depthWrite=enabled?false:defaults.depthWrite;m.needsUpdate=true}highlight.visible=!enabled;route.visible=!enabled&&route.visible}
 function highlightZone(id){for(const [key,line]of Object.entries(overlays))line.visible=key===id}
 function selectFloor(id,floor){Object.values(floorBands).forEach(b=>b.visible=false);if(!floorBands[id])return;floorBands[id].position.y=6.2+(floor-.5)*2.1;floorBands[id].visible=true}
 return{scene,above,underground,materials,ambient,sun,fill,interactive,zoneGroups,overlays,floorBands,route,setSection,highlightZone,selectFloor,get section(){return section},stats:{trees:trees.length,windowInstances:above.children.filter(g=>g.userData.zone?.startsWith('building')).reduce((n,g)=>n+g.children.filter(o=>o.isInstancedMesh).reduce((s,o)=>s+o.count,0),0)}};
}


