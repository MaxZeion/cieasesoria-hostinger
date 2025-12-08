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

    // Return the token to the CMS
    const responseData = JSON.stringify({ token, provider: 'github' });
    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage", e);
            window.opener.postMessage(
              'authorization:github:success:${responseData}',
              e.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `;
    res.send(script);
  } catch (error) {
    console.error('OAuth Error:', error);
    const errorData = JSON.stringify({ error: error.message });
    res.status(500).send(`
      <script>
        (function() {
          window.opener.postMessage(
            'authorization:github:error:${errorData}',
            '*'
          );
        })();
      </script>
    `);
  }
});

app.get('/health', (req, res) => res.send('OK'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OAuth server running on port ${port}`));
