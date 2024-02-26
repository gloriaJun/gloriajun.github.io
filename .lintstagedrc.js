module.exports = {
  '*.{js,jsx,ts,tsx,json,md,mdx}': ['prettier --write', 'git add'],
  '*.{js,jsx,ts,tsx}': [
    () => 'pnpm run lint -- --fix',
    // "yarn run cspell",
    'git add',
  ],
};
