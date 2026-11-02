import {build} from 'esbuild';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
const result=await build({entryPoints:['src/model-app.mjs'],outfile:'dist/model.bundle.js',bundle:true,minify:true,format:'esm',target:['es2020'],legalComments:'eof',metafile:true});
const data=fs.readFileSync('dist/model.bundle.js');
const stats={bundleBytes:data.length,gzipBytes:gzipSync(data).length,inputs:Object.keys(result.metafile.inputs).length};fs.writeFileSync('model-build.json',JSON.stringify(stats,null,2));console.log(JSON.stringify(stats));
