import {
  smarthome,
  SmartHomeV1ExecuteResponseCommands,
  Headers,
  SmartHomeV1SyncDevices,
} from 'actions-on-google'
import { getAuthToken } from './auth';
import { api } from './api';
import { toGoogleDevice } from './sync';
import { execute } from './execute';
import { query } from './query/query';


export const smartHomeApp = smarthome({
  debug: true,
})

// SmartHomeV1SyncDevices

smartHomeApp.onSync(async (body, headers) => {
  const authToken = getAuthToken(headers);
  if (!authToken) {
    throw new Error('missing authorization header');
  }

  const devices: SmartHomeV1SyncDevices[] = []; 
  const items = await api.getAll(authToken)
  items.forEach(item => {
    if (!item.metadata || !item.metadata.google) {
      return;
    }

    const googleDevice = toGoogleDevice(item, items);
    if (googleDevice) {
      devices.push(googleDevice);
    }
  })

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: '',
      devices : devices
    },
  }
})

smartHomeApp.onExecute(async (body, headers) => {
  const authToken = getAuthToken(headers);
  if (!authToken) {
    throw new Error('missing authorization header');
  }

  const results: SmartHomeV1ExecuteResponseCommands[] = [];
  for (const r of body.inputs) {
    for (const c of r.payload.commands) {
      const { devices, execution } = c;
      for (const device of devices) {
        for (const e of execution) {
          try {
            const result = await execute(authToken, device, e)
            results.push(result);
          } catch(e) {
            console.log(e);
            results.push({
              ids: [device.id],
              status: 'ERROR',
              errorCode: 'hardError'// TODO: https://developers.google.com/actions/smarthome/reference/errors-exceptions
            })
          }
        }
      }
    }
  }
  return {
    requestId: body.requestId,
    payload: {
      commands: results
    }
  }
})


smartHomeApp.onQuery(async (body, headers) => {
  const authToken = getAuthToken(headers);
  if (!authToken) {
    throw new Error('missing authorization header');
  }
  const devices : { [key: string] : any} = {};
  for (const r of body.inputs) {
    for (const device of r.payload.devices) {
      const state = await query(authToken, device);
      devices[device.id] = state;
    }
  }
  return {
    requestId: body.requestId,
    payload: {
      devices
    }
  }
})