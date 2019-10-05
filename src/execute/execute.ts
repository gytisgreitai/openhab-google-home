import { 
  SmartHomeV1QueryRequestDevices, 
  SmartHomeV1ExecuteRequestExecution,
  SmartHomeV1ExecuteStatus } from 'actions-on-google';
import { BaseCustomData } from '../model/google';
import { OpenhabItemType, OpenhabItem } from '../model/openhab';
import { api } from '../api';
import { groupItemsOfSameType } from '../model/selectors';
import { getTraitByCommand, getExecutor, lookupTraits } from '../traits';


async function optimisticUpdate(authToken: string, value: string, deviceId: string) {
  const res = await api.updateState(authToken, deviceId, value)
  return Promise.resolve({
    ids: [
      deviceId
    ],
    status:'SUCCESS' as SmartHomeV1ExecuteStatus
  })
}

export async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution) {
  // if we have exact item type, just push it through
  // if we don't have it, we must lookup all items and pass them as candidates to the function
  let targetItems: OpenhabItem[] = []
  const customData = (device.customData as BaseCustomData);
  if (!customData || !customData.itemType || customData.lookupOnExecute) {
    const item = await api.getItem(authToken, device.id)
    if (item.type === OpenhabItemType.Group && !groupItemsOfSameType(item)) {
      const wantedTrait = getTraitByCommand(req.command);
      targetItems = item.members.filter(i => {
        const traits = lookupTraits(i.metadata.google, i.metadata.google.value);
        return traits.includes(wantedTrait);
      })
    } else {
      targetItems = [item]
    }
  }

  let type: OpenhabItemType = customData && (customData.itemType as OpenhabItemType);
  if (!type && targetItems.length === 1) {
    type = targetItems[0].type;
  }
  console.log('getting executor', req.command);
  const executor = getExecutor(req.command);
  const { value, deviceId } = await executor(authToken, device, req, type, targetItems);

  let targetDeviceId = device.id;
  if (deviceId) {
    targetDeviceId = deviceId
  } else if (targetItems && targetItems.length === 1) {
    // targetItems check is needed if we have an item under group
    targetDeviceId = targetItems[0].name
  }
  
  // FIXME: wrong deviceId will be returned if we have group with different items under the hood
  return optimisticUpdate(authToken, value, targetDeviceId);
}

