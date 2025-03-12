// worker.js
export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            const path = url.pathname;

            // 处理 API 请求（可选）
            if (path.startsWith('/api/')) {
                return handleAPI(request);
            }

            // 托管静态资源
            return handleStaticAssets(request, env);
        } catch (err) {
            return new Response('Server Error', { status: 500 });
        }
    }
};

// 静态资源处理
async function handleStaticAssets(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // 默认返回 index.html 以支持 SPA 路由
    if (path === '/' || !/\.[a-z0-9]+$/i.test(path)) {
        path = '/index.html';
    }

    // 从 KV 获取文件（需提前配置 wrangler.toml）
    const asset = await env.ASSETS.get(path);

    if (!asset) {
        return new Response('Page Not Found', {
            status: 404,
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // 设置 Content-Type
    const contentType = getContentType(path);

    return new Response(asset.body, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=604800' // 7天缓存
        }
    });
}

// MIME 类型映射
function getContentType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const mime = {
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        svg: 'image/svg+xml'
    };
    return mime[ext] || 'text/plain';
}

// API 处理示例
async function handleAPI(request) {
    return new Response(JSON.stringify({ message: 'API Response' }), {
        headers: { 'Content-Type': 'application/json' }
    });
}