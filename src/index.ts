import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { config } from './config'
import { smartHomeApp } from './smarthome'


const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('trust proxy', 1)


app.post('/smarthome', smartHomeApp)

app.use((req, res) => {
  res.sendStatus(404)
})

app.listen(config.port, () => {
  console.log('listening');
});