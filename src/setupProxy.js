const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CRA proxy configuration for two backend services:
 *  - GreenCityUser  → http://localhost:8065  (auth, user profile)
 *  - GreenCityMVP   → http://localhost:8085  (news, habits, events, search)
 */
module.exports = function (app) {
  const setAllowedOriginHeader = (proxyReq) => {
    proxyReq.setHeader('origin', 'http://localhost:4205');
  };

  // GreenCityUser (port 8065)
  const userProxy = createProxyMiddleware({
    target: 'http://localhost:8065',
    changeOrigin: true,
    onProxyReq: setAllowedOriginHeader
  });
  app.use('/ownSecurity', userProxy);
  app.use('/user', userProxy);
  app.use('/googleSecurity', userProxy);
  app.use('/googleSecurityHeader', userProxy);

  // GreenCityMVP (port 8085) — strip /mvp prefix
  app.use(
    '/mvp',
    createProxyMiddleware({
      target: 'http://localhost:8085',
      changeOrigin: true,
      pathRewrite: { '^/mvp': '' },
      onProxyReq: setAllowedOriginHeader
    })
  );
};
