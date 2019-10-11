import { 
  SmartHomeV1QueryRequestDevices, 
  SmartHomeV1ExecuteRequestExecution,
  SmartHomeV1ExecuteStatus } from 'actions-on-google';
import { BaseCustomData } from '../model/google';
import { OpenhabItemType, OpenhabItem } from '../model/openhab';
import { api } from '../api';
import { getExecutor, getTargetItems } from '../traits';

export async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution) {
  // if we have exact item type, just push it through
  // if we don't have it, we must lookup all items and pass them as candidates to the function
  let targetItems: OpenhabItem[] = await getTargetItems(authToken, device, req.command);
  
  const customData = (device.customData as BaseCustomData);
  let type: OpenhabItemType = customData && (customData.itemType as OpenhabItemType);
  if (!type && targetItems.length === 1) {
    type = targetItems[0].type;
  }
  const executor = getExecutor(req.command);
  const executions = executor(authToken, device, req, type, targetItems);
  let hasErrors = false;
  for await( const  { value, deviceId }  of executions) {
    let targetDeviceId = device.id;
    if (deviceId) {
      targetDeviceId = deviceId
    } else if (targetItems && targetItems.length === 1) {
      // targetItems check is needed if we have an item under group
      targetDeviceId = targetItems[0].name
    }
    try {
      await api.updateState(authToken, targetDeviceId, value)
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
    status: (hasErrors ? 'ERROR' : 'SUCCESS') as SmartHomeV1ExecuteStatus
  })
}

