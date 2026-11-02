import fs from 'node:fs';
const file='dist/index.html';let html=fs.readFileSync(file,'utf8');
const start=html.indexOf('<div class="hero-visual">'),end=html.indexOf('<div class="hero-title">',start);
if(start<0||end<0)throw Error('Hero bounds not found');
html=html.slice(0,start)+`<div class="hero-visual photo-tour" data-view="home" aria-label="Визуальная прогулка по жилому комплексу">
 <div class="photo-ground photo-layer"><img class="hero-image" src="assets/residence-photo.webp" alt="Два корпуса ЖК Характер, каменные фасады и зелёный двор" fetchpriority="high"></div>
 <div class="photo-map photo-layer" aria-hidden="true"><div class="photo-world"><img src="assets/tour-aerial.webp" alt="Вид жилого комплекса с высоты"><div class="photo-pins"></div></div></div>
 <div class="photo-detail photo-layer" aria-hidden="true"><img alt=""></div>
 <div class="photo-shade"></div><div class="photo-topline"><span>ХАРАКТЕР / МОСКВА</span><span class="photo-location">Жизнь в деталях</span></div>
 <div class="photo-intro"><span>СВОЯ СРЕДА. СВОЙ ХАРАКТЕР.</span><h2>Представьте,<br>что вы <em>уже дома.</em></h2><button class="photo-explore">Исследовать территорию <span>↗</span></button></div>
 <button class="photo-back" hidden>← <span>К территории</span></button>
 <aside class="photo-story" hidden aria-label="Описание выбранного места"><span class="photo-kicker"></span><h2></h2><p></p><ul></ul><button class="photo-look">Осмотреть место <span>↗</span></button></aside>
 <div class="photo-scrim" hidden></div><button class="photo-return" hidden>Вернуть описание</button>
 <div class="photo-footer"><div class="photo-navigation" role="group" aria-label="Места жилого комплекса"><button data-place="parking">01 <span>Паркинг</span></button><button data-place="playground">02 <span>Площадка</span></button><button data-place="courtyard">03 <span>Двор</span></button><button data-place="landscape">04 <span>Сад</span></button></div><div class="photo-secondary"><button class="photo-overview">Вся территория ↗</button><button class="photo-day" aria-pressed="false">Вечер ◐</button></div></div>
 <p class="photo-status" role="status" aria-live="polite">Выберите место — окажитесь ближе.</p>
 </div>`+html.slice(end);
html=html.replace(/<link rel="stylesheet" href="model\.css[^\"]*">/,'<link rel="stylesheet" href="photo-tour.css?v=12">').replace(/<script type="module" src="model\.bundle\.js[^\"]*"><\/script>/,'<script type="module" src="photo-tour.js?v=12"></script>').replace(/src="app\.js[^\"]*"/,'src="app.js?v=12"').replace('href="assets/character-day-real.webp"','href="assets/residence-photo.webp"');
fs.writeFileSync(file,html);
let app=fs.readFileSync('dist/app.js','utf8').replace('if(!reduce&&scrollY<innerHeight)','if(!reduce&&scrollY<innerHeight&&!document.querySelector(".photo-tour"))');fs.writeFileSync('dist/app.js',app);
