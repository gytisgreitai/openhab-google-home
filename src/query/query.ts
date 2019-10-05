import { BaseCustomData } from "../model/google";
import { api } from "../api";
import { OpenhabItem, OpenhabItemType } from "../model/openhab";
import { groupItemsOfSameType } from "../model/selectors";
import { lookupTraits, getStateQuery } from "../traits";
import { SmartHomeV1QueryRequestDevices } from "actions-on-google";

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
      deviceData = {...deviceData, ...queryResult}
    }
    
  }
  return deviceData;
}