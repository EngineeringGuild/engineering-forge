const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/data/components.ts', 'utf8');

// Remove duplicate level properties
content = content.replace(/,\s*level:\s*\d+\s*,\s*level:\s*\d+/g, ', level: 1');

// Add level property to components that don't have it
const componentRegex = /(\s+description:\s*'[^']*'\.?)(\s*)(\s*},)/g;
content = content.replace(componentRegex, (match, description, whitespace, closing) => {
  if (!match.includes('level:')) {
    return description + ',' + whitespace + '    level: 1' + closing;
  }
  return match;
});

// Write back to file
fs.writeFileSync('src/data/components.ts', content);

console.log('Fixed components.ts');
