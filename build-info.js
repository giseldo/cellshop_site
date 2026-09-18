/* Executado pelo Vercel a cada deploy (ver vercel.json).
   Gera version.js com o commit e a hora do deploy, exibidos no rodapé. */
const fs = require('fs');

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 7);
const info = { sha: sha, data: new Date().toISOString() };

fs.writeFileSync('version.js', 'window.BUILD = ' + JSON.stringify(info) + ';\n');
console.log('version.js gerado:', info);
