const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy only API and websocket/health requests to the backend.
  // This prevents the dev server from trying to proxy static assets when backend is down.
  const target = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  app.use(
    ['/api', '/auth', '/users', '/games', '/health', '/socket.io'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'warn',
    })
  );
};
