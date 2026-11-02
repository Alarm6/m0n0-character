import fs from 'node:fs';
let h=fs.readFileSync('dist/index.html','utf8');
h=h.replace(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g,(whole,tag,attrs,body)=>{
 if(/id="(?:lifePrev|lifeNext|resetFilters)"/.test(attrs))return whole;
 if(/id="top"/.test(attrs))return '<button'+attrs+'>Наверх</button>';
 return '<'+tag+attrs+'>'+body.replace(/[↗↘↙↖→←↓↑]/g,'').replace(/<span>\s*<\/span>/g,'').trim()+'</'+tag+'>';
});
const position=h.indexOf('<svg class="sky-defs"');if(position<0)throw Error('Hero insertion missing');
h=h.slice(0,position)+'<div class="night-reveal" aria-hidden="true"><img src="assets/character-night-real.webp" alt="" decoding="async" fetchpriority="low"></div>'+h.slice(position);
h=h.replace('amenity-tour.js?v=16','amenity-tour.js?v=18').replace('amenity-tour.css?v=17','amenity-tour.css?v=18');
h=h.replace('</body>','<script type="module" src="night-lens.js?v=18"></script></body>');fs.writeFileSync('dist/index.html',h);
