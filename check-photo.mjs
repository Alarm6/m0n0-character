import fs from 'node:fs';
const html=fs.readFileSync('dist/index.html','utf8');
if(html.includes('model.bundle.js')||!html.includes('amenity-tour.js'))throw Error('Wrong scene connected');
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 const path=match[1].split('?')[0];
 if(!path||path.startsWith('#')||path.includes(':')||path.startsWith('//'))continue;
 if(!fs.existsSync('dist/'+path))throw Error('Missing '+path);
}
for(const file of['tour-aerial.webp','tour-parking.webp','tour-playground.webp','tour-landscape.webp','character-garden-real.webp','character-night-real.webp','residence-photo.webp'])if(!fs.existsSync('dist/assets/'+file))throw Error(file);
console.log('Photo scene wiring and local image references verified');

