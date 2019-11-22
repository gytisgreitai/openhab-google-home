import { SmartHomeV1ExecuteRequestExecution, SmartHomeV1QueryRequestDevices, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";

export interface OnOffTraitConfig {
  onCommand?: string;
  offCommand?: string;
}

export interface OnOffParams {
  on: boolean;
}

export interface OnOffCustomData extends BaseCustomData {
  onCommand?: string;
  offCommand?: string;
}

async function * execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as OnOffCustomData;
  const { on } = req.params as OnOffParams;
  let value;

  switch(type) {
    case OpenhabItemType.String: 
      value = on ? customData.onCommand || 'ON' : customData.offCommand || 'OFF'; 
      break;
    case OpenhabItemType.Switch:
    case OpenhabItemType.Dimmer:
      value = on ?  'ON' : 'OFF'; 
      break;
    case OpenhabItemType.Rollershutter:
      value = on ?  'UP' : 'DOWN'; 
      break;
    default:
      throw new Error(`Cannot handle ${type} with OnOff trait`);
  }
  yield { value, states: { on } };
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as OnOffTraitConfig;
  const customData = device.customData as OnOffCustomData;
  customData.offCommand = config && config.offCommand;
  customData.onCommand = config && config.onCommand;
  if (item.metadata.autoupdate && item.metadata.autoupdate.value === 'false') {
    device.attributes.commandOnlyOnOff = true;
  }

  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const { state } = item
  const customData = device.customData as OnOffCustomData;
  let on = !isNaN(state as any) ? Number(state as any) > 0 : ['UP','ON',customData.onCommand].includes(state);
  return {
    online: true,
    on,
  }
}

export const onOff: Trait = {
  name: 'action.devices.traits.OnOff',
  commands: ['action.devices.commands.OnOff'],
  execute: {
    'action.devices.commands.OnOff':  execute
  },
  sync,
  query
}
