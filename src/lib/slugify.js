export function slugify(text) {
  if (!text) return '';
  const trMap = {
    'ş':'s', 'Ş':'s', 'ı':'i', 'I':'i', 'İ':'i', 'ğ':'g', 'Ğ':'g',
    'ü':'u', 'Ü':'u', 'ö':'o', 'Ö':'o', 'ç':'c', 'Ç':'c'
  };
  let str = text.toString().toLowerCase();
  for (const key in trMap) {
    str = str.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return str
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with hyphen
    .replace(/-+/g, '-');     // Replace multiple hyphens
}
