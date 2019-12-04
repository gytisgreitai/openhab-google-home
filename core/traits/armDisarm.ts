import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";
import { Api } from "../api/api";

export interface ArmDisarmCustomData extends BaseCustomData {
  disarm?: string;
  arm?: string;
  levels?: boolean;
}

export interface ArmDisarmConfig {
  ordered?: string;
  availableArmLevels?: string;
  disarmCommand?: string;
  armCommand?: string;
}


export interface ArmDisarmParams {
  arm: boolean;
  cancel: boolean;
  armLevel?: string;
}

async function * execute(api: Api, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const { arm, cancel, armLevel } = req.params as ArmDisarmParams;
  const customData = device.customData as ArmDisarmCustomData;
  let value
  let states;
  switch(type) {
    case OpenhabItemType.String:
      if (arm) {
        value = armLevel || customData.arm || 'ON';
        states = {
          isArmed: true,
          currentArmLevel: armLevel
        }
      } else if (cancel) {
        value = customData.disarm || 'OFF'
        states = {
          isArmed: false
        }
      }
      break
    case OpenhabItemType.Switch:
      value = arm ? 'ON' : 'OFF';
      states = {
        isArmed: arm
      }
      break;
    default:
      throw new Error(`Cannot handle ${type} with ArmDisarm trait`);
  }
  yield  { value, states };
}


function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as ArmDisarmConfig;
  const customData = device.customData as ArmDisarmCustomData;
  if (!config) {
    return device;
  }
  if (config.availableArmLevels) {
    const levels = [];
    config.availableArmLevels.split(',').forEach(level => {
      const [level_name, synonyms] = level.split('=')
      levels.push({
        level_name,
        level_values: [{
          level_synonym: synonyms.split(':'),
          lang: 'en'
        }]
      })
    })

    device.attributes.availableArmLevels = {
      ordered: config.ordered === 'true',
      levels
    }
    customData.levels = true;
  }
  customData.arm = config.armCommand;
  customData.disarm = config.disarmCommand
  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  let isArmed = false, currentArmLevel = undefined
  const customData = device.customData as ArmDisarmCustomData;

  switch(item.type) {
    case OpenhabItemType.Switch:
      isArmed = item.state === 'ON';
      break
    case OpenhabItemType.String:
      if (item.state === 'OFF' || item.state === customData.disarm) {
        isArmed = false
      } else {
        isArmed = true
        currentArmLevel = customData.levels ? item.state : undefined
      }
      break;
  }
  return {
    online: true,
    isArmed,
    currentArmLevel
  }
}

export const armDisarm: Trait = {
  name: 'action.devices.traits.ArmDisarm',
  commands: [
    'action.devices.commands.ArmDisarm'
  ],
  execute: {
    'action.devices.commands.ArmDisarm': execute
  },
  sync,
  query
}
