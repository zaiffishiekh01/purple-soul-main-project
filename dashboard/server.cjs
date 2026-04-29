const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

async function fetchSupabaseFunction(functionName, req) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const data = await response.json();
    return {
      status: response.status,
      data: data,
    };
  } catch (error) {
    console.error(`Error fetching ${functionName}:`, error);
    return {
      status: 500,
      data: {
        success: false,
        error: 'Failed to fetch data from backend',
        message: error.message,
      },
    };
  }
}

app.get('/api/catalog/navigation', async (req, res) => {
  try {
    const result = await fetchSupabaseFunction('get-catalog-navigation', req);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error in /api/catalog/navigation:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

app.get('/api/catalog/taxonomy', async (req, res) => {
  try {
    const result = await fetchSupabaseFunction('get-catalog-taxonomy', req);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error in /api/catalog/taxonomy:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

app.get('/api/catalog/facets', async (req, res) => {
  try {
    const result = await fetchSupabaseFunction('get-catalog-facets', req);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Error in /api/catalog/facets:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

app.get('/api/*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    available_endpoints: [
      '/api/health',
      '/api/catalog/navigation',
      '/api/catalog/taxonomy',
      '/api/catalog/facets',
    ],
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path,
    });
    return;
  }

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - http://localhost:${PORT}/api/health`);
  console.log(`  - http://localhost:${PORT}/api/catalog/navigation`);
  console.log(`  - http://localhost:${PORT}/api/catalog/taxonomy`);
  console.log(`  - http://localhost:${PORT}/api/catalog/facets`);
});
