import * as expressBasicAuth from 'express-basic-auth';
import { config } from "../config"
import { Request, Response } from 'express';
import { api } from '../api';
import { OpenhabItem } from '../model/openhab';
import { toGoogleDevice } from '../sync';
import { readFileSync } from 'fs';

async function  debugHandler(req: Request, res: Response) {
  const result = [];
  let items: OpenhabItem[];
  // let's check if we can acess openhab
  try {
    items = await api.getAll(null)
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
      result: devices
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

  res.status(200).json(result);
}


const debugAuth = expressBasicAuth({
  users: { [config.standalone.auth.clientId]: config.standalone.auth.clientSecret },
  challenge: true,
})


export const debugEndpoint = [
  debugAuth,
  debugHandler
]