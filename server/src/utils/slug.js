const crypto = require('crypto');

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ӣ: 'i', ӯ: 'u', ҷ: 'ch',
  ғ: 'gh', қ: 'q', ҳ: 'h', тоҷикӣ: 'tojiki',
};

function transliterate(str) {
  return str
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('');
}

function slugify(name) {
  return transliterate(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'cafe';
}

// Appends a short random suffix so two cafes named identically don't collide.
function slugifyUnique(name) {
  const base = slugify(name);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

module.exports = { slugify, slugifyUnique };
