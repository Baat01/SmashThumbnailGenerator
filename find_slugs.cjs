const fs = require('fs');
const lines = fs.readFileSync('all_chars.txt', 'utf16le').split('\n');
const names = lines.map(l => {
  const m = l.match(/"name":\s*"(.*?)_0_00\.png"/);
  return m ? m[1] : null;
}).filter(m => m);
console.log([...new Set(names)].join(', '));
