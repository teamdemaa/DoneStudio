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

          if (pathname === '/api/gemini') {
            console.log('DevProxy: Matching /api/gemini', req.method);
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  const model = 'gemini-2.5-flash';
                  const apiKey = process.env.VITE_GEMINI_API_KEY;
                  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedBody.payload)
                  });
                  const data = await response.json();
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = response.status;
                  res.end(JSON.stringify(data));
                } catch (err) {
                  console.error('DevProxy: Gemini Error', err);
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
