import fs from 'node:fs';
const path='dist/index.html';let h=fs.readFileSync(path,'utf8');
const original=h;h=h.replace(/<section class="life section" id="life">[\s\S]*?<\/section>\s*/,'');if(h===original)throw Error('Life section not found');
h=h.replace('<a href="#life">Среда</a>','<a href="#location">Расположение</a>').replace('04 / КВАРТИРЫ','03 / КВАРТИРЫ').replace('05 / МОСКВА','04 / МОСКВА').replace('06 / ВАШ НОВЫЙ ХАРАКТЕР','05 / ВАШ НОВЫЙ ХАРАКТЕР').replace('app.js?v=17','app.js?v=20');
h=h.replace('aria-expanded="false"></button>','aria-expanded="false"><span></span><span></span></button>');
fs.writeFileSync(path,h);
const js=fs.readFileSync('dist/app.js','utf8');fs.writeFileSync('dist/app.js',js.split('\n').filter(line=>!line.startsWith('const stories=')).join('\n'));
