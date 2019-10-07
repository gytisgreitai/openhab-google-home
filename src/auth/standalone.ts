import { Application, Router } from 'express';
import { createHash } from 'crypto';
import { config } from '../config';

// since we are handling only one user, this is sort of a poor man's optimistic fake auth
const getStandaloneCode = () => {
  const { clientId, clientSecret } = config.standalone.auth;
  return createHash('sha256').update(`${clientId}|${clientSecret}`).digest('hex');
}

export const getStandaloneToken = () => {
  const { clientSecret } = config.standalone.auth;
  return createHash('sha256').update(`${clientSecret}`).digest('hex');
}

export function standaloneAuth(app: Application) {

  const router = Router();
  app.use('/standalone-auth', router);

  router.get('/authorize', async (req, res) => {
    const redirectUri = decodeURIComponent(req.query.redirect_uri)
    const code = getStandaloneCode()
    const responseurl = `${redirectUri}?code=${code}&state=${req.query.state}`
    return res.redirect(responseurl)
  })

  router.all('/token', async (req, res) => {
    const grantType = req.query.grant_type ? req.query.grant_type : req.body.grant_type
    const code = req.query.code ? req.query.code : req.body.code
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;
    const { auth } = config.standalone

    const targetToken = getStandaloneToken();

    if (auth.clientId !== clientId || auth.clientSecret !== clientSecret) {
      console.log('clientId or clientSecret missmatched returning 403', auth, clientId, clientSecret);
      return res.sendStatus(403);
    }

    if (grantType === 'refresh_token' && req.body.refresh_token !== targetToken) {
      console.log('refresh_token missmatched returning 403', req.body.refresh_token, targetToken);
      return res.sendStatus(403);
    }
    if (grantType === 'authorization_code' && code !== getStandaloneCode()) {
      console.log('code  missmatched returning 403', code, getStandaloneCode());
      return res.sendStatus(403);
    }
    
    let response = {
      token_type: 'bearer',
      access_token: targetToken,
      expires_in: 60 * 60 * 24, // 24 hours in seconds,
      refresh_token: undefined
    }
    if (grantType === 'authorization_code') {
      response.refresh_token = targetToken;
    }
    console.log('token obj', response)
    res.status(200).json(response)
  })
}