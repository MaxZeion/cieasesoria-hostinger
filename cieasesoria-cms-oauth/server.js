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

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    const tokenParams = {
      code,
      redirect_uri: `${originPattern}/callback`,
    };

    const accessToken = await client.getToken(tokenParams);
    const token = accessToken.token.access_token;

    console.log('Token obtained successfully');

    // Standard Netlify/Decap CMS OAuth callback format
    const postMsgContent = JSON.stringify({
      token: token,
      provider: 'github'
    });

    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Authorizing...</title>
  </head>
  <body>
    <p>Autorización completada. Volviendo al CMS...</p>
    <script>
      (function() {
        function recieveMessage(e) {
          console.log("recieveMessage %o", e);
          
          // Send success message back to opener
          window.opener.postMessage(
            "authorization:github:success:" + ${JSON.stringify(postMsgContent)},
            e.origin
          );
          
          window.removeEventListener("message", recieveMessage, false);
        }
        
        window.addEventListener("message", recieveMessage, false);
        
        // Send initial message to opener to trigger the handshake
        console.log("Sending authorizing message to opener");
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Auth Error</title>
  </head>
  <body>
    <p>Error: ${error.message}</p>
    <script>
      (function() {
        window.opener.postMessage(
          "authorization:github:error:" + ${JSON.stringify(JSON.stringify({ error: error.message }))},
          "*"
        );
      })();
    </script>
  </body>
</html>`);
  }
});

app.get('/health', (req, res) => res.send('OK'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OAuth server running on port ${port}`));
