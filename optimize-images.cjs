const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/Владислав/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
  const folder='dist/assets',backup='previous-assets/png-performance';fs.mkdirSync(backup,{recursive:true});
  const files=fs.readdirSync(folder).filter(f=>f.endsWith('.png')),result=[];
  for(const file of files){const source=path.join(folder,file),name=file.replace(/\.png$/,'.webp'),target=path.join(folder,name),before=fs.statSync(source).size;
    const width=file.includes('tower')?900:file.includes('clouds')?1400:1600;
    await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:file.includes('clouds')?72:82,alphaQuality:85,effort:5}).toFile(target);
    result.push({file:name,before,after:fs.statSync(target).size});
  }
  for(const file of fs.readdirSync('dist').filter(f=>/\.(html|css|js)$/.test(f))){const p=path.join('dist',file);let text=fs.readFileSync(p,'utf8');for(const name of files)text=text.replaceAll('assets/'+name,'assets/'+name.replace(/\.png$/,'.webp'));fs.writeFileSync(p,text)}
  // Preserve full-resolution originals outside the deployed asset directory.
  for(const file of files)fs.renameSync(path.join(folder,file),path.join(backup,file));
  const before=result.reduce((n,r)=>n+r.before,0),after=result.reduce((n,r)=>n+r.after,0);fs.writeFileSync('image-optimization.json',JSON.stringify({before,after,reductionPercent:Math.round((1-after/before)*100),files:result},null,2));console.log(JSON.stringify({before,after,reductionPercent:Math.round((1-after/before)*100)}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
