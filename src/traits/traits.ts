import { brightness } from "./brightness";
import { fanSpeed } from "./fanSpeed";
import { openClose } from "./openClose";
import { lockUnlock } from "./lockUnlock";
import { onOff } from "./onOff";
import { startStop } from "./startStop";
import { modes } from "./modes";
import { GoogleMeta } from "../model/openhab";

export const traits = [
  brightness,
  fanSpeed,
  lockUnlock,
  modes,
  onOff,
  openClose,
  startStop
]

const defaultDeviceToTraitMap = {
  'action.devices.types.GATE': ['action.devices.traits.OpenClose'],
  'action.devices.types.SWITCH': ['action.devices.traits.OnOff'],
  'action.devices.types.GARAGE': ['action.devices.traits.OpenClose'],
  'action.devices.types.DOOR': ['action.devices.traits.OpenClose'],
  'action.devices.types.LOCK': ['action.devices.traits.LockUnlock'],
  'action.devices.types.FAN': ['action.devices.traits.FanSpeed'],
  'action.devices.types.WASHER': ['action.devices.traits.OnOff'],
  'action.devices.types.BLINDS': ['action.devices.traits.OpenClose'],
  'action.devices.types.LIGHT': ['action.devices.traits.OnOff','action.devices.traits.Brightness'],
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