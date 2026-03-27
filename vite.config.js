import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import Airtable from 'airtable'
import dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-proxy-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/api')) {
            console.log(`DevProxy: [${req.method}] ${req.url}`);
          }
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = url.pathname;

          if (pathname === '/api/airtable') {
            console.log('DevProxy: Matching /api/airtable');
            (async () => {
              try {
                const table = url.searchParams.get('table');
                const fields = url.searchParams.get('fields');
                const sort = url.searchParams.get('sort');

                const base = new Airtable({ 
                  apiKey: process.env.VITE_AIRTABLE_ACCESS_TOKEN 
                }).base(process.env.VITE_AIRTABLE_BASE_ID);

                const selectOptions = {};
                if (fields) selectOptions.fields = JSON.parse(fields);
                if (sort) selectOptions.sort = JSON.parse(sort);

                const records = await base(table).select(selectOptions).firstPage();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(records.map(r => ({ id: r.id, fields: r.fields }))));
              } catch (err) {
                console.error('DevProxy: Airtable Error', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            })();
            return;
          }

          if (pathname === '/api/claude') {
            console.log('DevProxy: Matching /api/claude', req.method);
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
                      'anthropic-version': '2023-06-01',
                    },
                    body: body.replace('claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-20240620')
                  });
                  const data = await response.json();
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = response.status;
                  res.end(JSON.stringify(data));
                } catch (err) {
                  console.error('DevProxy: Claude Error', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
            return;
          }
          next();
        });
      }
    }
  ]
})
