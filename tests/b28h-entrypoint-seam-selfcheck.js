const fs=require('fs');
const paths=['patches/b28e-index-b28f-load-block.html','js/b28e-world-map-gate-router.js'];
const a=(x,m)=>{if(!x)throw new Error(m)};
const block=fs.readFileSync(paths[0],'utf8');
a(!block.includes('\\\\n'),'literal newline token can break browser startup');
a(block.includes('gate-recovery-bootstrap.js'),'bootstrap missing');
const map=fs.readFileSync(paths[1],'utf8');
a(/world|map/i.test(map),'world-map router seam missing');
console.log('B28-H entrypoint seam selfcheck PASS');
