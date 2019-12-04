import { SmartHomeV1ExecuteRequestExecution, SmartHomeV1QueryRequestDevices, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";
import { Api } from "../api/api";

export interface SceneTraitConfig {
  activateCommand?: string;
  deactivateCommand?: string;
  reversible?: string;
}

export interface SceneParams {
  deactivate: boolean;
}

export interface SceneCustomData extends BaseCustomData {
  activateCommand?: string;
  deactivateCommand?: string;
}

async function * execute(api: Api, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as SceneCustomData;
  const { deactivate } = req.params as SceneParams;
  let value;

  switch(type) {
    case OpenhabItemType.String: 
      value = deactivate ? customData.deactivateCommand || 'OFF' : customData.activateCommand || 'ON'; 
      break;
    case OpenhabItemType.Switch:
    case OpenhabItemType.Dimmer:
      value = deactivate ?  'OFF' : 'ON'; 
      break;
    default:
      throw new Error(`Cannot handle ${type} with Scene trait`);
  }
  yield { value, states: { } };
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as SceneTraitConfig;
  const customData = device.customData as SceneCustomData;
  customData.deactivateCommand = config && config.deactivateCommand;
  customData.activateCommand = config && config.activateCommand;
  if (config && config.reversible === 'true') {
    device.attributes.sceneReversible = true;
  }

  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const { state } = item
  return {
    online: true,
  }
}

export const scene: Trait = {
  name: 'action.devices.traits.Scene',
  commands: ['action.devices.commands.ActivateScene'],
  execute: {
    'action.devices.commands.ActivateScene':  execute
  },
  sync,
  query
}
