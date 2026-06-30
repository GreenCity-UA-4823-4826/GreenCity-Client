const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CRA proxy configuration for two backend services:
 *  - GreenCityUser  → http://localhost:8060  (auth, user profile)
 *  - GreenCityMVP   → http://localhost:8080  (news, habits, events, search)
 */
module.exports = function (app) {
  // GreenCityUser (port 8060)
  const userProxy = createProxyMiddleware({
    target: 'http://localhost:8060',
    changeOrigin: true
  });
  app.use('/ownSecurity', userProxy);
  app.use('/user', userProxy);
  app.use('/googleSecurity', userProxy);
  app.use('/googleSecurityHeader', userProxy);

  // GreenCityMVP (port 8080) — strip /mvp prefix
  app.use(
    '/mvp',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/mvp': '' }
    })
  );
};
