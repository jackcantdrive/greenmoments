import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [nodePolyfills()],
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    base: mode === 'production' ? '/vechain-dapp-kit/vanilla/' : '/',
    preview: {
        port: 5003,
        strictPort: true,
    },
    server: {
        port: 443,
        strictPort: true,
        host: true,
        origin: 'https://0.0.0.0:5003',
        https: {
        key: fs.readFileSync(path.resolve(__dirname, '../backend/self-signed-key/privkey.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '../backend/self-signed-key/fullchain.pem'))
        }
    },
}));
