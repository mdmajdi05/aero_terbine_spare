module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    () => 'tsc --noEmit',
  ],
  '*.{json,css,md}': ['prettier --write'],
};
