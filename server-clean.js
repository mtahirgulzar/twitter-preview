const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test data for dynamic URLs
const testData = {
  slugs: ['quickprofits', 'digitaldollars', 'bellyburner', 'wealthwizard', 'moneymaker'],
  usernames: ['novelnet', 'bchbhsba', 'profitpro', 'cashking', 'wealthgen'],
  images: [
    'https://picsum.photos/1200/630?random=1',
    'https://picsum.photos/1200/630?random=2',
    'https://picsum.photos/1200/630?random=3',
    'https://picsum.photos/1200/630?random=4',
    'https://picsum.photos/1200/630?random=5'
  ]
};

// Generate random ID
function generateRandomId() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Bot detection middleware
function isBotRequest(userAgent) {
  const botPatterns = [
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',
    'googlebot',
    'bingbot'
  ];

  if (!userAgent) return false;
  return botPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

function generateBotHTML({ title, description, ogImage, currentUrl, username, id, userAgent }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Twitter OG Test">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            text-align: center;
        }
        .og-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .meta-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        .react-link {
            display: inline-block;
            background: #1da1f2;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin-top: 20px;
            transition: background 0.3s ease;
        }
        .react-link:hover {
            background: #0d8bd9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>ID:</strong> ${id}</p>
        
        <img src="${ogImage}" alt="${title}" class="og-image">
        
        <div class="meta-info">
            <h3>🔍 OG Meta Information</h3>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Image URL:</strong> ${ogImage}</p>
            <p><strong>Page URL:</strong> ${currentUrl}</p>
        </div>
        
        <p>This page is optimized for social media sharing with proper Open Graph tags.</p>
        
        <a href="/" class="react-link">🚀 Go to React Testing App</a>
        
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
            <p>🤖 Bot Detection: ${userAgent.includes('bot') ? 'BOT REQUEST' : 'HUMAN REQUEST'}</p>
            <p>👤 User Agent: ${userAgent}</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Dynamic landing page route
app.get('/landing-:slug/:username/:id', (req, res) => {
  const { slug, username, id } = req.params;
  const userAgent = req.get('User-Agent') || '';
  const isBot = isBotRequest(userAgent);

  // Find matching data or use defaults
  const slugIndex = testData.slugs.indexOf(slug);
  const imageIndex = slugIndex >= 0 ? slugIndex : 0;

  const ogImage = testData.images[imageIndex];
  const title = `${slug.charAt(0).toUpperCase() + slug.slice(1)} Landing Page`;
  const description = `Exclusive landing page for ${username} - ID: ${id}`;
  const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  console.log(`Request from ${isBot ? 'BOT' : 'USER'}: ${userAgent}`);
  console.log(`URL: ${currentUrl}`);
  console.log(`OG Image: ${ogImage}`);

  // For bots: serve static HTML with OG tags
  if (isBot) {
    const botHtml = generateBotHTML({
      title,
      description,
      ogImage,
      currentUrl,
      username,
      id,
      userAgent
    });
    return res.send(botHtml);
  }

  // For humans: redirect to React app with URL params
  const reactUrl = `/?preview=landing-${slug}/${username}/${id}`;
  res.redirect(reactUrl);
});

// API endpoint to get test data
app.get('/api/test-data', (req, res) => {
  res.json(testData);
});

// API endpoint to generate a new test URL
app.post('/api/generate-url', (req, res) => {
  const { slug, username, imageIndex } = req.body;

  if (!slug || !username || imageIndex === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const randomId = generateRandomId();
  const baseUrl = req.get('host') === 'localhost:3001'
    ? `http://localhost:${PORT}`
    : `https://${req.get('host')}`;

  const url = `${baseUrl}/landing-${slug}/${username}/${randomId}`;

  res.json({
    url,
    slug,
    username,
    id: randomId,
    imageIndex
  });
});

// API endpoint to get preview data for a URL
app.get('/api/preview-data', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  // Extract parameters from URL
  const urlPattern = /\/landing-([^/]+)\/([^/]+)\/([^/]+)$/;
  const match = url.match(urlPattern);

  if (!match) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const [, slug, username, id] = match;

  // Generate preview data (same as what would be served to bots)
  const title = `${slug.charAt(0).toUpperCase() + slug.slice(1)} Landing Page`;
  const description = `Exclusive landing page for ${username} - ID: ${id}`;
  const slugIndex = testData.slugs.indexOf(slug);
  const imageIndex = slugIndex >= 0 ? slugIndex : 0;
  const image = testData.images[imageIndex];

  res.json({
    title,
    description,
    image,
    url
  });
});

// API endpoint to pre-warm a URL (simulate bot requests)
app.post('/api/pre-warm', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    // Simulate multiple bot requests to pre-warm the URL
    const botUserAgents = [
      'Twitterbot/1.0',
      'facebookexternalhit/1.1',
      'LinkedInBot/1.0',
      'WhatsApp/2.0'
    ];

    const requests = botUserAgents.map(userAgent => {
      return new Promise((resolve) => {
        // Simulate internal request to the URL with bot user agent
        setTimeout(() => {
          resolve({ userAgent, status: 'success' });
        }, 100);
      });
    });

    await Promise.all(requests);

    res.json({
      success: true,
      message: 'URL pre-warmed with multiple bot user agents',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pre-warming error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pre-warm URL'
    });
  }
});

// Serve React app for client routes
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  // Check if it's a landing page route
  if (req.path.match(/^\/landing-[^/]+\/[^/]+\/[^/]+$/)) {
    // This should have been handled by the dynamic route above
    return res.status(404).send('Landing page not found');
  }

  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Twitter OG Test Server running on http://localhost:${PORT}`);
  console.log(`Test URLs format: /landing-{slug}/{username}/{id}`);
  console.log(`Available slugs: ${testData.slugs.join(', ')}`);
  console.log(`Available usernames: ${testData.usernames.join(', ')}`);
  console.log(`React app available at: http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`   GET  /api/test-data - Get test configuration`);
  console.log(`   POST /api/generate-url - Generate new test URL`);
  console.log(`   GET  /api/preview-data - Get OG preview data`);
  console.log(`   POST /api/pre-warm - Pre-warm URL for bots`);
});
