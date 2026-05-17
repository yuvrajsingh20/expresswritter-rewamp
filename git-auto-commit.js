const { execSync } = require('child_process');
const path = require('path');

// Colors for beautiful console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    return '';
  }
}

console.log(`${colors.bright}${colors.cyan}🚀 Initiating Intelligent Git Auto-Commit Sequence...${colors.reset}\n`);

// 1. Check if git repository is initialized
const isGit = runCmd('git rev-parse --is-inside-work-tree');
if (isGit !== 'true') {
  console.log(`${colors.red}❌ Error: Not a git repository!${colors.reset}`);
  process.exit(1);
}

// 2. Get git status
const statusOutput = runCmd('git status --porcelain');
if (!statusOutput) {
  console.log(`${colors.green}✨ Clean workspace! No modified or untracked files detected.${colors.reset}`);
  process.exit(0);
}

const lines = statusOutput.split('\n').filter(Boolean);
console.log(`${colors.yellow}Found ${lines.length} changed file(s). Processing commits one-by-one...${colors.reset}\n`);

// Helper to generate a professional commit message
function generateCommitMessage(statusCode, filePath) {
  const parts = filePath.split(/[/\\]/);
  const fileName = parts[parts.length - 1];
  const dirName = parts.length > 1 ? parts[parts.length - 2] : '';
  
  // Decide prefix based on folder structure
  let prefix = 'chore';
  if (parts.includes('frontend')) {
    prefix = 'fe';
  } else if (parts.includes('backend')) {
    prefix = 'be';
  }

  // Decide action based on status code
  let action = 'update';
  if (statusCode === '??' || statusCode === 'A') {
    action = 'add';
  } else if (statusCode === 'D') {
    action = 'remove';
  }

  // Generate description based on folder/file context
  let desc = fileName;
  if (fileName === 'route.js' && parts.includes('api')) {
    const apiIndex = parts.indexOf('api');
    const apiPath = parts.slice(apiIndex + 1, parts.length - 1).join(' ');
    desc = `${apiPath} API`;
  } else if (fileName === 'page.js' && parts.includes('app')) {
    const appIndex = parts.indexOf('app');
    const appPath = parts.slice(appIndex + 1, parts.length - 1)
      .filter(p => !p.startsWith('(') || !p.endsWith(')')) // clean routes like (dashboard)
      .join(' ');
    desc = `${appPath || 'home'} page`;
  } else {
    // Clean file extension
    const ext = path.extname(fileName);
    desc = fileName.replace(ext, '');
    // Replace hyphens/underscores with spaces
    desc = desc.replace(/[-_]/g, ' ');
  }

  // Clean trailing spaces and return
  return `${prefix}: ${action} ${desc.toLowerCase().trim()}`;
}

// 3. Process each file
let committedCount = 0;

for (const line of lines) {
  // Parse porcelain status line
  // Example: " M frontend/app/layout.js" or "?? newfile.js"
  const match = line.match(/^([ MADRC?]{2})\s+(.+)$/);
  if (!match) continue;

  const statusCode = match[1].trim();
  let filePath = match[2];
  
  // Strip quotes if present (for files with spaces)
  if (filePath.startsWith('"') && filePath.endsWith('"')) {
    filePath = filePath.slice(1, -1);
  }

  const commitMsg = generateCommitMessage(statusCode, filePath);

  console.log(`${colors.cyan}──────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.bright}File:${colors.reset} ${filePath}`);
  console.log(`${colors.bright}Action:${colors.reset} ${statusCode} (${commitMsg})`);

  try {
    // Add file
    runCmd(`git add "${filePath}"`);
    
    // Commit file
    const commitOutput = runCmd(`git commit -m "${commitMsg}"`);
    
    console.log(`${colors.green}✅ Successfully committed!${colors.reset}`);
    committedCount++;
  } catch (err) {
    console.log(`${colors.red}❌ Failed to commit: ${err.message}${colors.reset}`);
  }
}

console.log(`\n${colors.cyan}──────────────────────────────────────────────────${colors.reset}`);
console.log(`${colors.bright}${colors.green}🏁 Sequence Completed! Successfully created ${committedCount} commit(s).${colors.reset}\n`);
