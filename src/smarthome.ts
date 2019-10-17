import {
  smarthome,
  SmartHomeV1ExecuteResponseCommands,
  Headers,
  SmartHomeV1SyncDevices,
} from 'actions-on-google'
import { getAuthTokenOrFail } from './auth';
import { api } from './api';
import { toGoogleDevice } from './sync';
import { execute } from './execute';
import { query } from './query/query';
import { TFAError } from './tfa/tfa';


export const smartHomeApp = smarthome({
  debug: true,
})

// SmartHomeV1SyncDevices

smartHomeApp.onSync(async (body, headers) => {
  
  const authToken = getAuthTokenOrFail(headers);

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
  const authToken = getAuthTokenOrFail(headers);

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
            let errRes: any  = {
              ids: [device.id],
              status: 'ERROR',
            }
            if (e instanceof TFAError) {
              errRes.errorCode = 'challengeNeeded';
              errRes.challengeNeeded = {
                type: e.tfaType
              }
            } else {
               // TODO: https://developers.google.com/actions/smarthome/reference/errors-exceptions
              errRes.errorCode = 'hardError'
            }
            results.push(errRes);
  
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
  const authToken = getAuthTokenOrFail(headers);

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