const fs = require('fs');
const path = require('path');

const handoffDir = 'C:/Users/ASUS/Downloads/expresswritter/Xpresswriters/design_handoff_xpresswriters';
const appDir = 'C:/Users/ASUS/Downloads/expresswritter/app';
const compDir = 'C:/Users/ASUS/Downloads/expresswritter/components';

function processHtmlToNext(htmlFile, outDir, name) {
  const htmlPath = path.join(handoffDir, htmlFile);
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    fs.writeFileSync(path.join(outDir, 'theme.css'), styleMatch[1]);
  }

  const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    let script = scriptMatch[1];
    
    script = script.replace(/ReactDOM\.createRoot[^\n]+/g, '');
    script = script.replace(/function App\(\) \{/g, 'export default function App() {');
    
    // Remove "const { useState, useEffect, useRef } = React;" since we import it
    script = script.replace(/const\s+\{.*\}\s*=\s*React;/g, '');
    
    // Replace React.Fragment with standard React.Fragment since we import React
    
    let finalScript = '"use client";\nimport React, { useState, useEffect, useRef, useCallback, useMemo } from "react";\nimport "./theme.css";\n';
    
    if (htmlFile === 'admin.html') {
       finalScript += 'import { AdminIntegrations } from "./admin-integrations";\nimport { AdminTickets } from "./admin-tickets";\nimport { AdminPayments } from "./admin-payments";\nimport { AdminWriters } from "./admin-writers";\nimport { AdminSettings } from "./admin-settings";\nimport { AdminCurrency, AdminUsers, AdminWorkflow, AdminTheme } from "./admin-shared";\n';
    }

    finalScript += script;
    
    fs.writeFileSync(path.join(outDir, 'page.js'), finalScript);
    console.log('Processed ' + htmlFile + ' into ' + outDir);
  } else {
    console.log('No script found for ' + htmlFile);
  }
}

// Make sure output directories exist
[
  path.join(appDir, '(dashboard)/admin'),
  path.join(appDir, '(dashboard)/student'),
  path.join(appDir, '(dashboard)/freelancer')
].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

processHtmlToNext('admin.html', path.join(appDir, '(dashboard)/admin'), 'Admin');
processHtmlToNext('dashboard.html', path.join(appDir, '(dashboard)/student'), 'Student');
processHtmlToNext('writer-dashboard.html', path.join(appDir, '(dashboard)/freelancer'), 'Freelancer');

// Copy admin jsx files
['admin-shared.jsx', 'admin-integrations.jsx', 'admin-tickets.jsx', 'admin-payments.jsx', 'admin-writers.jsx', 'admin-settings.jsx'].forEach(file => {
   let content = fs.readFileSync(path.join(handoffDir, file), 'utf8');
   content = '"use client";\nimport React, { useState, useEffect } from "react";\n' + content;
   // Replace global React hook destructuring if any
   content = content.replace(/const\s+\{.*\}\s*=\s*React;/g, '');
   
   // Export components
   // Admin files use "function Admin..." and we need to export them.
   content = content.replace(/function\s+(Admin[A-Za-z0-9_]+)\s*\(/g, 'export function $1(');

   fs.writeFileSync(path.join(appDir, '(dashboard)/admin', file.replace('.jsx', '.js')), content);
});

console.log('Done!');
