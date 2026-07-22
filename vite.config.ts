import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        server: {
            host: '0.0.0.0',
            origin: env.VITE_ORIGIN || undefined,
            hmr: env.VITE_HMR_HOST
                ? {
                      host: env.VITE_HMR_HOST,
                      clientPort: 443,
                      protocol: 'wss',
                  }
                : true,
            allowedHosts: ['localhost', '127.0.0.1', '.ngrok-free.app', '.ngrok-free.dev'],
        },
    }
})

