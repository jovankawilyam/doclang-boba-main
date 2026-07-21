import http from 'node:http'
import httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
})

const BACKENDS = {
  laravel: { host: 'localhost', port: 8000 },
  vite:    { host: 'localhost', port: 5173 },
  wa:      { host: 'localhost', port: 3001 },
}

function route(path) {
  if (
    path.startsWith('/api/send-message') ||
    path.startsWith('/api/admin')
  ) return BACKENDS.wa
  if (
    path.startsWith('/@vite/') ||
    path.startsWith('/@react-refresh') ||
    path.startsWith('/node_modules/') ||
    path.startsWith('/resources/') ||
    path.startsWith('/build/assets/')
  ) return BACKENDS.vite
  return BACKENDS.laravel
}

const server = http.createServer((req, res) => {
  const target = route(req.url)
  proxy.web(req, res, { target: `http://${target.host}:${target.port}` })
})

server.on('upgrade', (req, socket, head) => {
  const target = route(req.url)
  proxy.ws(req, socket, head, { target: `http://${target.host}:${target.port}` })
})

const PORT = 9000
server.listen(PORT, () => {
  console.log(`ngrok proxy listening on :${PORT}`)
  console.log('Laravel:  8000 | Vite: 5173 | WhatsApp: 3001')
})
