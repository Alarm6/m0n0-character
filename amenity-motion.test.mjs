import test from 'node:test';
import assert from 'node:assert/strict';
import {boundedFocus} from './dist/amenity-motion.mjs';
test('gentle camera move never exposes an image edge at any selected point',()=>{
 for(const [w,h]of[[1600,900],[390,219.375],[800,450]])for(const p of[[0,0],[1,1],[.81,.73],[.25,.74],[.51,.57],[.46,.85]]){
  const f=boundedFocus(w,h,p),extraX=(f.scale-1)*w/2,extraY=(f.scale-1)*h/2;
  assert.ok(f.scale<=1.08);assert.ok(f.x-extraX<=1e-9);assert.ok(f.x+extraX>=-1e-9);assert.ok(f.y-extraY<=1e-9);assert.ok(f.y+extraY>=-1e-9);
 }
});
