const fs = require('fs');
const path = require('path');

const directories = ['src/app', 'src/components'];

const replacements = {
  '#4F46E5': '#0d9488',
  '#4338CA': '#0f766e',
  '#6366F1': '#0369a1',
  '#EEF2FF': '#f0fdfa',
  '#C7D2FE': '#99f6e4', // Adding tailwind indigo-200 -> teal-200
  'rgba(79,70,229': 'rgba(13,148,136'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

directories.forEach(directory => {
  const files = walk(directory);

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    Object.keys(replacements).forEach(key => {
      if (content.includes(key)) {
        content = content.split(key).join(replacements[key]);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  });
});
