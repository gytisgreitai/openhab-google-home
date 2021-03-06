import { 
  SmartHomeV1QueryRequestDevices, 
  SmartHomeV1ExecuteRequestExecution,
  SmartHomeV1ExecuteStatus } from 'actions-on-google';
import { BaseCustomData } from '../model/google';
import { OpenhabItemType, OpenhabItem } from '../model/openhab';
import { getExecutor, getTargetItems } from '../traits';
import { verifyTFA } from '../tfa/tfa';
import deepmerge = require('deepmerge');
import { Api } from '../api/api';

export async function execute(api: Api, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution) {

  await verifyTFA(api, device, req)

  // if we have exact item type, just push it through
  // if we don't have it, we must lookup all items and pass them as candidates to the function
  let targetItems: OpenhabItem[] = await getTargetItems(api, device, req.command);
  
  const customData = (device.customData as BaseCustomData);

  let type: OpenhabItemType = customData && (customData.itemType as OpenhabItemType);
  if (!type && targetItems.length === 1) {
    type = targetItems[0].type;
  }
  const executor = getExecutor(req.command);
  const executions = executor(api, device, req, type, targetItems);
  let hasErrors = false;
  let states = {}
  for await( const  { value, deviceId, states : execState }  of executions) {
    let targetDeviceId = device.id;
    if (deviceId) {
      targetDeviceId = deviceId
    } else if (targetItems && targetItems.length === 1) {
      // targetItems check is needed if we have an item under group
      targetDeviceId = targetItems[0].name
    }
    try {
      await api.updateState(targetDeviceId, value)
      states = deepmerge(states, execState)
    } catch(e){
      console.log('Failed executing', targetDeviceId, e)
      hasErrors = true;
    }
  }

  return Promise.resolve({
    ids: [
      device.id
    ],
    // if one fails, shall all fail?
    status: (hasErrors ? 'ERROR' : 'SUCCESS') as SmartHomeV1ExecuteStatus,
    states
  })
}

