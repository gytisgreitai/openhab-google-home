import { api } from "../api";
import { OpenhabItem, OpenhabItemType } from "../model/openhab";
import { groupItemsOfSameType } from "../model/selectors";
import { lookupTraits, getStateQuery } from "../traits";
import { SmartHomeV1QueryRequestDevices } from "actions-on-google";
import * as deepmerge from 'deepmerge';

export async function query(authToken: string, device: SmartHomeV1QueryRequestDevices) {
  let targetItems: OpenhabItem[] = []
  const item = await api.getItem(authToken, device.id);
  if (item.type !== OpenhabItemType.Group || groupItemsOfSameType(item)) {
    targetItems = [item]
  } else {
    targetItems = item.members
  }
  let deviceData = {};
  for (const targetItem of targetItems) {
    const traits = lookupTraits(targetItem.metadata.google, targetItem.metadata.google.value);
    for (const trait of traits) {
      const queryResult = await getStateQuery(trait)(targetItem, device)
      console.log('Trait ', trait, ' returned result ', queryResult);
      // deepmerge needed for mode traits. this might be bad in the long run and source of complex bugs
      deviceData = deepmerge(deviceData, queryResult)
    }
    
  }
  return deviceData;
}