/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // Disable LightningCSS minify. Tailwind v4's optimizer has failed Vercel
    // builds while scanning non-UI files (*.test.ts) even when local next
    // build succeeds — see tailwindcss#16370 / next#76246.
    '@tailwindcss/postcss': {
      optimize: { minify: false },
    },
    autoprefixer: {},
  },
}
