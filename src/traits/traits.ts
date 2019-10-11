import { brightness } from "./brightness";
import { fanSpeed } from "./fanSpeed";
import { openClose } from "./openClose";
import { lockUnlock } from "./lockUnlock";
import { onOff } from "./onOff";
import { startStop } from "./startStop";
import { modes } from "./modes";
import { GoogleMeta, OpenhabItem, OpenhabItemType } from "../model/openhab";
import { SmartHomeV1QueryRequestDevices } from "actions-on-google";
import { BaseCustomData } from "../model/google";
import { api } from "../api";
import { groupItemsOfSameType } from "../model/selectors";
import { volume } from "./volume";
import { mediaState } from "./mediaState";
import { toggles } from "./toggles";

export const traits = [
  brightness,
  fanSpeed,
  lockUnlock,
  modes,
  onOff,
  openClose,
  startStop,
  volume,
  mediaState,
  toggles
]

export const defaultDeviceToTraitMap = {
  'action.devices.types.GATE':            ['action.devices.traits.OpenClose'],
  'action.devices.types.SWITCH':          ['action.devices.traits.OnOff'],
  'action.devices.types.GARAGE':          ['action.devices.traits.OpenClose'],
  'action.devices.types.DOOR':            ['action.devices.traits.OpenClose'],
  'action.devices.types.LOCK':            ['action.devices.traits.LockUnlock'],
  'action.devices.types.FAN':             ['action.devices.traits.FanSpeed'],
  'action.devices.types.WASHER':          ['action.devices.traits.OnOff'],
  'action.devices.types.BLINDS':          ['action.devices.traits.OpenClose'],
  'action.devices.types.LIGHT':           ['action.devices.traits.OnOff','action.devices.traits.Brightness'],
  'action.devices.types.SPEAKER':         ['action.devices.traits.Volume'],
  'action.devices.types.SOUNDBAR':        ['action.devices.traits.Volume'],
  'action.devices.types.TV':              ['action.devices.traits.OnOff'],
  'action.devices.types.REMOTECONTROL':   ['action.devices.traits.MediaState'],
}

export function lookupTraits(meta: GoogleMeta, device: string) {
  let traits: string[] = [];
  const { config, value : deviceOrTrait } = meta
  if (config && config.traits) {
    traits = config.traits.split(',')
  } else if (deviceOrTrait.includes('action.devices.traits')) { // regular item when part of group with different items
    traits = deviceOrTrait.split(',')
  } else if (device) {
    traits = defaultDeviceToTraitMap[device]
  }
  return traits;
}

export function getTraitByCommand(command: string) {
  return traits.find(({commands}) => commands.includes(command)).name
}

export function getExecutor(command: string) {
  return traits.find(({commands}) => commands.includes(command)).execute[command];
}

export function getSyncer(traitName: string) {
  return traits.find(({name}) => name === traitName).sync;
}

export function getStateQuery(traitName: string) {
  return traits.find(({name}) => name === traitName).query;
}

export async function getTargetItems(authToken: string, device: SmartHomeV1QueryRequestDevices, command: string) {
  let targetItems: OpenhabItem[] = []
  const customData = (device.customData as BaseCustomData);
  if (!customData || !customData.itemType || customData.lookupOnExecute) {
    const item = await api.getItem(authToken, device.id)
    if (item.type === OpenhabItemType.Group && !groupItemsOfSameType(item)) {
      const wantedTrait = getTraitByCommand(command);
      targetItems = item.members.filter(i => {
        const traits = lookupTraits(i.metadata.google, i.metadata.google.value);
        return traits.includes(wantedTrait);
      })
    } else {
      targetItems = [item]
    }
  }
  return targetItems;
}