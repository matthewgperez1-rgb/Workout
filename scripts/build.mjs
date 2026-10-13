import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const f of ['index.html','app.css','app.mjs','program.mjs','exercise-library.mjs','icon.svg','manifest.webmanifest','sw.js'])await copyFile(f,'dist/'+f);
for(const d of ['modules','assets'])await cp(d,'dist/'+d,{recursive:true});
console.log('Static distribution built.');
