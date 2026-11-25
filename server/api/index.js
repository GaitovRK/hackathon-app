// Vercel entry: one function serves the whole Nest app from the compiled `dist/` (built by `pnpm run build`).
const { createApp } = require('../dist/main');

let server;

module.exports = async (req, res) => {
  if (!server) {
    const app = await createApp();
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server(req, res);
};
