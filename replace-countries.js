const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./airton.shop');

let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace Monaco with Espagne
  content = content.replace(
    /flags--MC"[^>]*url\([^)]*mc\.svg[^)]*\)"><\/span>\s*Monaco/g,
    'flags--ES" style="--background-image: url(https://cdn.shopify.com/static/images/flags/es.svg?width=20)"></span>Espagne'
  );

  // Replace Luxembourg with Italie
  content = content.replace(
    /flags--LU"[^>]*url\([^)]*lu\.svg[^)]*\)"><\/span>\s*Luxembourg/g,
    'flags--IT" style="--background-image: url(https://cdn.shopify.com/static/images/flags/it.svg?width=20)"></span>Italie'
  );

  // Also fix native select dropdowns that might have Monaco/Luxembourg
  content = content.replace(/<option value="Monaco"[^>]*>Monaco<\/option>/g, '<option value="Spain" data-provinces="[]">Espagne</option>');
  content = content.replace(/<option value="Luxembourg"[^>]*>Luxembourg<\/option>/g, '<option value="Italy" data-provinces="[]">Italie</option>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
});

console.log(`Updated ${changed} files.`);
