export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  if (url.pathname === '/') {
    return new Response(
      '此地址只用于为astrbot提供更快速的github访问服务',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }

  const targetUrlString = decodeURIComponent(url.pathname.slice(1));

  if (
    !targetUrlString ||
    (!targetUrlString.startsWith('http://') &&
      !targetUrlString.startsWith('https://'))
  ) {
    return new Response('用法：/目标URL', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const res = await fetch(targetUrlString, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(res.headers);

    // CORS
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders });
    }

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response('代理请求失败', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
