import fs from 'node:fs';
const path='dist/index.html';
let html=fs.readFileSync(path,'utf8');
html=html.replace(/(<h([1-6])\b[^>]*>)([\s\S]*?)(<\/h\2>)/g,(_,open,level,body,close)=>open+body.replace(/\.(?=(?:\s|<[^>]+>)*$)/,'')+close);
html=html.replace('amenity-tour.css?v=19','amenity-tour.css?v=20').replace('amenity-tour.js?v=21','amenity-tour.js?v=22');
fs.writeFileSync(path,html);
const js='dist/amenity-tour.js';
fs.writeFileSync(js,fs.readFileSync(js,'utf8').replace(/title:'([^']+)\.'/g,"title:'$1'"));
fs.appendFileSync('dist/amenity-tour.css',`\n/* Keep the hero headline legible over changing light and clouds. */
.calm-hero .photo-shade{background:linear-gradient(90deg,rgba(13,12,11,.45),transparent 75%),linear-gradient(180deg,rgba(0,0,0,.23),transparent 32%,rgba(13,12,11,.12) 48%,rgba(13,12,11,.78) 100%)}
.calm-copy h2{color:#fff9ef;font-weight:450;text-shadow:0 2px 5px #0005,0 6px 30px #0008}
.calm-copy h2 em{color:inherit}
.calm-copy a{color:#fff9ef;border-bottom-color:#fff9ef99;text-shadow:0 1px 8px #0009}
`);
console.log('Heading punctuation removed; hero contrast improved');
