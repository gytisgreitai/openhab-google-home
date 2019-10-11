import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";

export interface StartStopCustomData extends BaseCustomData {
}

export interface StartStopConfig {
  pausable?: string;
  zones?: string;
}


export interface StartStopParams {
  start: boolean;
  zone?: string;
}

export interface PauseUnpauseParams {
  pause: boolean;
}


async function * executeStartStop(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as StartStopCustomData;
  const { zone, start } = req.params as StartStopParams;
  let value
  switch(type) {
    case OpenhabItemType.String:
      value = start ? 'START' : 'STOP'
      if (zone) {
        value += ` ${zone}`
      }
      break
    case OpenhabItemType.Switch:
      value = start ? 'ON' : 'OFF';
      break;
    default:
      throw new Error(`Cannot handle ${type} with StartStop trait`);
  }
  yield  { value };
}

async function * executePauseUnpause(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as StartStopCustomData;
  const { pause } = req.params as PauseUnpauseParams;
  let value
  switch(type) {
    case OpenhabItemType.String:
      value = pause ? 'PAUSE' : 'RESUME'
      break
    case OpenhabItemType.Switch:
      value = pause ? 'OFF' : 'ON';
      break;
    default:
      throw new Error(`Cannot handle ${type} with PauseUnpause trait`);
  }
  yield { value }
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as StartStopConfig;
  const customData = device.customData as StartStopCustomData;
  device.attributes.pausable = config && config.pausable === 'true';
  device.attributes.zones = config && config.zones ? config.zones.split(",") : undefined
  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  let isRunning = false, isPaused = false;

  switch(item.type) {
    case OpenhabItemType.Switch:
      isRunning = item.state === 'ON';
      break
    case OpenhabItemType.String:
      isRunning = item.state === 'ON' || item.state === 'RESUME';
      isPaused = item.state === 'PAUSE';
      break;
  }
  return {
    online: true,
    isRunning,
    isPaused
  }
}

export const startStop: Trait = {
  name: 'action.devices.traits.StartStop',
  commands: [
    'action.devices.commands.StartStop',
    'action.devices.commands.PauseUnpause'
  ],
  execute: {
    'action.devices.commands.StartStop': executeStartStop,
    'action.devices.commands.PauseUnpause':  executePauseUnpause,
  },
  sync,
  query
}
