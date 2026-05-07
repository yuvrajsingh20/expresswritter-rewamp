const fs = require('fs');
const path = require('path');

const adminDir = 'C:/Users/ASUS/Downloads/expresswritter/app/(dashboard)/admin';
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.js') && f !== 'page.js');

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove Object.assign(window, ...)
  content = content.replace(/Object\.assign\s*\(\s*window\s*,\s*\{[^}]*\}\s*\)\s*;/g, '');
  
  // Make sure to add export to functions that don't have it yet, except the ones we already did
  // Actually let's just make sure all function declarations are exported
  // but only top-level ones
  
  // A simple way is to match `function Foo(` that is not already `export function Foo(`
  content = content.replace(/^(?!export\s)function\s+([A-Z][a-zA-Z0-9_]*)\s*\(/gm, 'export function $1(');

  fs.writeFileSync(filePath, content);
});

console.log('Fixed exports!');
