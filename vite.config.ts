import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'portrait-upload-handler',
        configureServer(server) {
          server.middlewares.use('/api/upload-portrait', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const base64Data = body.replace(/^data:image\/\w+;base64,/, '');
                  const buffer = Buffer.from(base64Data, 'base64');
                  const targets = [
                    'public/lokeshvaran_portrait.png',
                    'public/file_000000000fb481fd88d25030105a69ed.png',
                    'public/image.png',
                    'dist/lokeshvaran_portrait.png',
                    'dist/file_000000000fb481fd88d25030105a69ed.png',
                    'dist/image.png',
                    'lokeshvaran_portrait.png',
                    'file_000000000fb481fd88d25030105a69ed.png',
                    'image.png'
                  ];
                  targets.forEach(t => {
                    try {
                      fs.writeFileSync(t, buffer);
                    } catch (e) {
                      // ignore directory issues
                    }
                  });
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, bytes: buffer.length }));
                } catch (err) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: String(err) }));
                }
              });
            } else {
              res.writeHead(405);
              res.end();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
