/**
 * Serverless Function: GitHub OAuth Token Exchange
 *
 * This function securely exchanges an OAuth authorization code for an access token.
 * The GitHub client secret is kept secure on the server (never exposed to browser).
 *
 * Compatible with: Vercel, Netlify, Cloudflare Workers
 *
 * Environment Variables Required:
 * - GITHUB_CLIENT_ID: Your GitHub OAuth App Client ID
 * - GITHUB_CLIENT_SECRET: Your GitHub OAuth App Client Secret
 */

module.exports = async (req, res) => {
  // CORS headers - Allow requests from your extension
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set to your extension ID
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { code, redirect_uri } = req.body;

    // Validate input
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    // Check environment variables
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      console.error('Missing environment variables');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    console.log('[TokenExchange] Exchanging code for token...');

    // Exchange code for access token with GitHub
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GHClip-Extension'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TokenExchange] GitHub API error:', response.status, errorText);
      res.status(response.status).json({
        error: 'Failed to exchange token',
        details: errorText
      });
      return;
    }

    const data = await response.json();

    // Check for errors in response
    if (data.error) {
      console.error('[TokenExchange] OAuth error:', data.error, data.error_description);
      res.status(400).json({
        error: data.error,
        error_description: data.error_description
      });
      return;
    }

    // Success!
    console.log('[TokenExchange] Successfully exchanged token');
    res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope
    });

  } catch (error) {
    console.error('[TokenExchange] Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
