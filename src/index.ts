import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { config } from './config'
import { smartHomeApp } from './smarthome'
import { standaloneAuth } from './auth'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('trust proxy', 1)

standaloneAuth(app);

app.post('/smarthome', smartHomeApp)

app.get('/', (req, res) => {
  res.send('OK').status(200)
})
app.use((req, res) => {
  console.log('route not found', req.path, req.url);
  res.sendStatus(404)
})

app.listen(config.port, () => {
  console.log(`OpenHAB Google Home Integration listening on ${config.port}`);
});