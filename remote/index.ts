import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { config } from './config'
import { smartHomeApp } from './smarthome'
import { standaloneAuth } from '../remote/auth'
import { debugEndpoint } from './debug/debug';
import { localDiscovery } from '@openhab-google-home/local-discovery'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('trust proxy', 1)

standaloneAuth(app);

app.post('/smarthome', smartHomeApp)

app.get('/am-i-working', debugEndpoint)

app.get('/', (req, res) => {
  res.send('OK').status(200)
})

app.use((req, res) => {
  console.log('route not found', req.path, req.url);
  res.sendStatus(404)
})

if (config.localDiscovery.enabled) {
  localDiscovery({
    port: config.localDiscovery.port,
    discoveryPacket: config.localDiscovery.discoveryPacket,
    openhabUrl: config.openhab.host,
    openhabItemsPath: config.openhab.itemsPath
  });
}


app.listen(config.port, () => {
  console.log(`OpenHAB Google Home Integration listening on ${config.port}`);
});