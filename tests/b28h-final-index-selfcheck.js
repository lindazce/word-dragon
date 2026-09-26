const fs=require('fs'),path=require('path');
const file=process.argv[2]||'index.html';if(!fs.existsSync(file)){console.log('B28-H final index selfcheck SKIP: no assembled index in module tree');process.exit(0)}const html=fs.readFileSync(file,'utf8');
const a=(x,m)=>{if(!x)throw new Error(m)};
a(!html.includes('\\\\n'),'final index contains literal \\\\n token');
const refs=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(?:\?[^"]*)?"/g)].map(x=>x[1]).filter(x=>!/^https?:/.test(x));
for(const ref of refs)a(fs.existsSync(path.resolve(path.dirname(file),ref)),'missing final asset: '+ref);
for(const name of ['js/phrase-chunks.js','js/sentence-phrase-power.js','css/phrase-power.css','css/mobile-home-compact.css'])a(html.includes(name),'hotfix asset not loaded: '+name);
console.log('B28-H final index selfcheck PASS:',refs.length,'local JS/CSS refs');
