const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');
const randomstring = require('randomstring');
const cors = require('cors');

const app = express();
app.use(cors());

const client = new AuthorizationCode({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
});

const originPattern = process.env.ORIGIN || 'http://localhost:3000';

// Auth endpoint: redirects to GitHub
app.get('/auth', (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${originPattern}/callback`,
    scope: 'repo,user',
    state: randomstring.generate(32),
  });
  res.redirect(authorizationUri);
});

// Callback endpoint: exchanges code for token
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenParams = {
      code,
      redirect_uri: `${originPattern}/callback`,
    };

    const accessToken = await client.getToken(tokenParams);
    const token = accessToken.token.access_token;

    // Simplified callback script for Decap CMS
    res.send(`<!DOCTYPE html>
<html>
<head><title>Auth Complete</title></head>
<body>
<script>
(function() {
  const token = "${token}";
  const provider = "github";
  
  function sendMessage() {
    const message = "authorization:" + provider + ":success:" + JSON.stringify({token: token, provider: provider});
    if (window.opener) {
      window.opener.postMessage(message, "*");
      setTimeout(function() { window.close(); }, 1000);
    }
  }
  
  // Send immediately and also on message
  sendMessage();
  window.addEventListener("message", sendMessage);
})();
</script>
<p>Autenticación completada. Esta ventana se cerrará automáticamente...</p>
</body>
</html>`);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send(`<!DOCTYPE html>
<html>
<head><title>Auth Error</title></head>
<body>
<script>
(function() {
  const message = "authorization:github:error:" + JSON.stringify({error: "${error.message}"});
  if (window.opener) {
    window.opener.postMessage(message, "*");
  }
})();
</script>
<p>Error de autenticación: ${error.message}</p>
</body>
</html>`);
  }
});

app.get('/health', (req, res) => res.send('OK'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OAuth server running on port ${port}`));
