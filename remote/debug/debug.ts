import * as expressBasicAuth from 'express-basic-auth';
import { config } from "../config"
import { Request, Response } from 'express';
import { OpenhabItem, toGoogleDevice } from '@openhab-google-home/core';
import { readFileSync } from 'fs';
import { OpnehabApi } from '../api';

async function  debugHandler(req: Request, res: Response) {
  const result = [];
  let items: OpenhabItem[];
  // let's check if we can acess openhab
  try {
    const api = new OpnehabApi(undefined)
    items = await api.getAll()
    result.push({
      title: 'Openhab accessible',
      result: `Total items returned from openhab ${items.length}`
    })
  } catch (e) {
    result.push({
      title: 'Openhab accessible',
      result: `FAILED: ${e}`
    })
  }

  if (items && items.length) {
    const devices = [];
    items.forEach(item => {
      if (!item.metadata || !item.metadata.google) {
        return;
      }
  
      const googleDevice = toGoogleDevice(item, items);
      if (googleDevice) {
        devices.push(googleDevice);
      }
    })
    result.push({
      title: 'Openhab google items',
      result: JSON.stringify(devices, null, 4)
    })
  }

  try {
    const contents = readFileSync('/var/log/app.log', 'utf8');
    result.push({
      title: 'Log file',
      result: contents
    })
  }
  catch (e) {
    result.push({
      title: 'Log file',
      result: `Log file coud not be found/read ${e}`
    })
  }

  const resultPlain = result.reduce((a, r) => {
    a = a + `\n\r${r.title}:\n\r${r.result}`;
    return a
  }, '')


  res.status(200).header('Content-Type', 'text/plain').send(resultPlain);
}


const debugAuth = expressBasicAuth({
  users: { [config.standalone.auth.clientId]: config.standalone.auth.clientSecret },
  challenge: true,
})


export const debugEndpoint = [
  debugAuth,
  debugHandler
]