import { OpenhabItem, OpenhabItemType } from '../model/openhab';
import { SmartHomeV1SyncDevices } from 'actions-on-google';
import { getSynonyms } from './utils';
import { BaseCustomData, TFAType } from '../model/google';
import { getSyncer, lookupTraits, defaultDeviceToTraitMap } from '../traits';

const supportedDevices = Object.keys(defaultDeviceToTraitMap)

export function toGoogleDevice(item: OpenhabItem, allItems: OpenhabItem[]): SmartHomeV1SyncDevices {
  const { config, value : device } = item.metadata.google
  // means that this is part of a group, and will be handled with a group
  if (!device || !supportedDevices.includes(device)) {
    return
  }

  let discoveredItems: { type: OpenhabItemType, item: OpenhabItem}[] = [];
  let itemsMustHaveTraits = false;
  let itemType: OpenhabItemType;
  if (item.type === OpenhabItemType.Group) {
    // all group items have same type under the hood
    if (config && config.groupType) {
      itemType = config.groupType as OpenhabItemType;
      discoveredItems.push({type: config.groupType as OpenhabItemType, item})
    } else {
      // this is a virtual group, so check for traits on grouped devices
      itemsMustHaveTraits = true;
      discoveredItems = allItems.filter(({groupNames}) => groupNames.includes(item.name)).map(i => ({ type: i.type, item: i}));
    }
  } else {
    itemType = item.type;
    discoveredItems.push({type: item.type, item})
  }

  let googleDevice: Partial<SmartHomeV1SyncDevices> = {
    id: item.name,
    type: device,
    traits: [],
    name: {
      defaultNames: [item.label],
      name: item.label,
      nicknames: [item.label, ...getSynonyms(item.metadata)]
    },
    roomHint: config && config.roomHint,
    willReportState: false,
    customData: { 
      itemType,
    } as BaseCustomData,
    attributes: { }
  }

  if (config && (config.tfaAck || config.tfaPin)){
    (googleDevice.customData as BaseCustomData).tfa = config.tfaAck  ? TFAType.ack : TFAType.pin;
  }

  let atleastOneMatched = false
  for (const {type, item: discoveredItem } of discoveredItems) {
    
    const traits : string[] = lookupTraits(discoveredItem.metadata.google, itemsMustHaveTraits ? null : device);
    
    for (const trait of traits) {
      let enriched = getSyncer(trait)(type, discoveredItem, googleDevice);
      if (enriched) {
        atleastOneMatched = true;
        
        googleDevice = enriched;
        if (!googleDevice.traits.includes(trait)) {
          googleDevice.traits.push(trait);
        }
      }
    }
    const { config: googleConfig } = discoveredItem.metadata.google
   
  }

  return atleastOneMatched ?  googleDevice as SmartHomeV1SyncDevices : null;
}