import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";
import { Api } from "../api/api";

export interface OpenCloseParams {
  openPercent: number;
  openDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'IN' | 'OUT'
}

export interface OpenCloseConfig {
  directions?: string;
  directionMap?: string;
  inverted?: string;
}

export interface OpenCloseCustomData extends BaseCustomData {
  inverted?: boolean;
}

const getStateOnOffFromType = (type: OpenhabItemType) => {
  return [
    type === OpenhabItemType.Rollershutter ? 'UP' : 'ON',
    type === OpenhabItemType.Rollershutter ? 'DOWN' : 'OFF'
  ];
}

export async function * execute(api: Api, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as OpenCloseCustomData;
  const params = req.params as OpenCloseParams;
  let value;

  let openPercent = params.openPercent

  if (customData.inverted && typeof openPercent !== 'undefined') {
    openPercent = 100 - openPercent;
  } 
  
  switch(type) {
    case OpenhabItemType.String: 
      value = `${openPercent}` 
      break;
    case OpenhabItemType.Switch:
    case OpenhabItemType.Rollershutter:
    case OpenhabItemType.Dimmer:
      const supportsPercentage = type !== OpenhabItemType.Switch;
      const [on, off] = getStateOnOffFromType(type);
      if (supportsPercentage && (openPercent > 0 && openPercent < 100)) {
        value = `${openPercent}`
      } else if (openPercent === 0) {
        value = customData.inverted ? off : on
      } else {
        value = customData.inverted ? on : off
      }
      break;
    default:
      throw new Error(`Cannot handle ${type} with OpenClose trait`);
  }
  yield { value, states: { openPercent } };
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as OpenCloseConfig;
  const customData = device.customData as OpenCloseCustomData;
  if (!config) {
    return device;
  }
  
  if (config.inverted) {
    customData.inverted = config.inverted === 'true'
  }
  if (config.directions) {
    device.attributes.openDirection = config.directions.split(',')
  }

  return device
}


async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  let openPercent: number = isNaN(item.state as any) ? 0 : Number(item.state);
  const customData = device.customData as OpenCloseCustomData;
  if (customData.inverted) {
    openPercent = 100 - openPercent;
  }
  const [on, off]  = getStateOnOffFromType(item.type);

  switch(item.type) {
    case OpenhabItemType.Switch:
    case OpenhabItemType.Dimmer:
    case OpenhabItemType.Rollershutter:
      if (item.state === on || item.state === off) {
        openPercent = item.state === on && !customData.inverted ? 100 : 0;
      }
      break;
  }
  return {
    online: true,
    openPercent,
  }
}


export const openClose: Trait = {
  name: 'action.devices.traits.OpenClose',
  commands: ['action.devices.commands.OpenClose'],
  execute: {
    'action.devices.commands.OpenClose':  execute
  },
  sync,
  query
}
