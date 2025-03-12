
// worker.js
addEventListener('fetch', event => {
    console.log('执行成功')
    event.respondWith(handleRequest(event.request));
  });
  
  // 定义前端资源映射（需通过构建脚本自动生成）
  const assetManifest = {
    "/": "index.html",
    "/index.html": "index.html",
    "/app.js": "app.abc123.js",
    "/style.css": "style.def456.css",
    "/404.html": "404.html"
  };
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
  
    // 匹配静态资源
    const assetPath = assetManifest[path] || assetManifest[path + '/index.html'];
    
    if (assetPath) {
      // 从 Cloudflare KV 或内置存储获取文件
      const response = await fetch(`https://your-storage-domain.com/${assetPath}`);
      return new Response(response.body, {
        headers: {
          'Content-Type': getContentType(assetPath),
          'Cache-Control': getCachePolicy(assetPath)
        }
      });
    }
  
    // 处理前端路由（如 React/Vue 的 history 模式）
    if (isFrontendRoute(path)) {
      return fetch(`https://your-storage-domain.com/index.html`);
    }
  
    // 404 处理
    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // 辅助函数
  function getContentType(path) {
    const types = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      png: 'image/png',
      jpg: 'image/jpeg'
    };
    return types[path.split('.').pop()] || 'text/plain';
  }
  
  function getCachePolicy(path) {
    return path.endsWith('.html') ? 
      'no-cache, max-age=0' : 
      'public, max-age=31536000, immutable';
  }
  
  function isFrontendRoute(path) {
    return !path.includes('.') && path !== '/favicon.ico';
  }
  


// export default {
//     async fetch(request, env) {
//       return new Response("Hello world")
//     }
//   }