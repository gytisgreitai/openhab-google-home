import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { Trait } from "./model";
import { BaseCustomData } from "../model/google";
import { getTargetItems } from "./traits";

export interface SetVolumeParams {
  volumeLevel: number;
}

export interface VolumeRelative {
  volumeRelativeLevel: number;
}

export interface VolumeConfig {
  volumeIncrementStep?: string;
}

export interface VolumeCustomData extends BaseCustomData {
  volumeIncrementStep?: number;
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as VolumeConfig;
  const customData = device.customData as VolumeCustomData;
  if (config && config.volumeIncrementStep) {
    customData.volumeIncrementStep = Number(config.volumeIncrementStep);
  }
  return device
}

async function executeSetVolume(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const { volumeLevel } = req.params as SetVolumeParams;
  let value
  switch(type) {
    case OpenhabItemType.String:
    case OpenhabItemType.Dimmer:
    case OpenhabItemType.Number:
      value = `${volumeLevel}`;
      break
    default:
      throw new Error(`Cannot handle ${type} with executeSetVolume command`);
  }
  return { value };
}

async function executeVolumeRelative(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  let items = targetItems;
  if (!items || !items.length) {
    items = await getTargetItems(authToken, device, req.command);
  }
  const customData = device.customData as VolumeCustomData;
  const currentVolume = isNaN(items[0].state as any) ? 0 : Number(items[0].state);
  const { volumeRelativeLevel } = req.params as VolumeRelative;
  const newVolume = currentVolume + volumeRelativeLevel * (customData.volumeIncrementStep || 0);
  let value
  switch(type) {
    case OpenhabItemType.String:
    case OpenhabItemType.Dimmer:
    case OpenhabItemType.Number:
      value = `${Math.max(0, Math.min(newVolume, 100))}`;
      break
    default:
      throw new Error(`Cannot handle ${type} with executeSetVolume command`);
  }
  return { value };
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const currentVolume = isNaN(item.state as any) ? 0 : Number(item.state);
  return {
    online: true,
    isMuted: currentVolume === 0,
    currentVolume,
  }
}

export const volume: Trait = {
  name: 'action.devices.traits.Volume',
  commands: [
    'action.devices.commands.setVolume',
    'action.devices.commands.volumeRelative'
  ],
  execute: {
    'action.devices.commands.setVolume': executeSetVolume,
    'action.devices.commands.volumeRelative': executeVolumeRelative,
  },
  sync,
  query
}
