import {
  smarthome,
  SmartHomeV1ExecuteResponseCommands,
  SmartHomeV1SyncDevices,
} from 'actions-on-google'
import { 
  execute,
  toGoogleDevice,
  query,
  TFAError
} from '@openhab-google-home/core';
import { getAuthTokenOrFail } from './auth';
import { OpnehabApi } from './api';



export const smartHomeApp = smarthome({
  debug: true,
})

// SmartHomeV1SyncDevices

smartHomeApp.onSync(async (body, headers) => {
  
  const authToken = getAuthTokenOrFail(headers);
  const api = new OpnehabApi(authToken);

  const devices: SmartHomeV1SyncDevices[] = []; 
  const items = await api.getAll()
  
  try {
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
  } catch (e) {
    console.log('sync error', e)
    return {
      requestId: body.requestId,
      payload: {
        errorCode: 'hardError',
        devices: []
      }
    }
  }
 
})

smartHomeApp.onExecute(async (body, headers) => {
  const authToken = getAuthTokenOrFail(headers);
  const api = new OpnehabApi(authToken);
  const results: SmartHomeV1ExecuteResponseCommands[] = [];
  for (const r of body.inputs) {
    for (const c of r.payload.commands) {
      const { devices, execution } = c;
      for (const device of devices) {
        for (const e of execution) {
          try {
            const result = await execute(api, device, e)
            results.push(result);
          } catch(e) {
            console.error('Execute error', e)
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
  const api = new OpnehabApi(authToken);
  const devices : { [key: string] : any} = {};
  for (const r of body.inputs) {
    for (const device of r.payload.devices) {
      const state = await query(api, device);
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

smartHomeApp.onDisconnect(() => {
  return {
    
  }
})