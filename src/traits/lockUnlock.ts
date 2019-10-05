import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";

export interface LockUnlockCustomData extends BaseCustomData {
  lockCommand?: string;
  unlockCommand?: string;
}

export interface LockUnlockParams {
  lock: boolean;
}

export interface LockUnlockConfig {
  lockCommand?: string;
  unlockCommand?: string;
}

async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as LockUnlockCustomData;
  const { lock } = req.params as LockUnlockParams;
  let value: string;

  switch(type) {
    case OpenhabItemType.String: 
      value = lock ? customData.lockCommand || 'ON' : customData.unlockCommand || 'OFF'; 
      break;
    case OpenhabItemType.Switch:
      value = lock ?  'ON' : 'OFF'; 
      break;
    default:
      throw new Error(`Cannot handle ${type} with LockUnlock trait`);
  }
  return { value };
}


function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as LockUnlockConfig;
  const customData = device.customData as LockUnlockCustomData;
  customData.lockCommand = config && config.lockCommand;
  customData.unlockCommand = config && config.unlockCommand;
  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const customData = device.customData as LockUnlockCustomData;
  return {
    online: true,
    isLocked:  item.state === customData.lockCommand || item.state === 'ON',
    isJammed: false
  }
}


export const lockUnlock: Trait = {
  name: 'action.devices.traits.LockUnlock',
  commands: ['action.devices.commands.LockUnlock'],
  execute: {
    'action.devices.commands.LockUnlock':  execute
  },
  sync,
  query
}