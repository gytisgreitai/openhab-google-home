import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";

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
  directionMap?: { [key: string]: string }
}

export async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as OpenCloseCustomData;
  const params = req.params as OpenCloseParams;
  let value;

  let command: string = params.openDirection;
  let openPercent = params.openPercent

  if (customData.inverted && typeof openPercent !== 'undefined') {
    openPercent = 100 - openPercent;
  } 
  
  switch(type) {
    case OpenhabItemType.String: 
      if (customData.directionMap && command) {
        command = customData.directionMap[command] || command;
      }
      value = command ? `${command} ${openPercent}` : `${openPercent}`
      break;
    case OpenhabItemType.Switch:
    case OpenhabItemType.Rollershutter:
    case OpenhabItemType.Dimmer:
      const supportsPercentage = type !== OpenhabItemType.Switch;
      const on  = type === OpenhabItemType.Rollershutter ? 'UP' : 'ON'
      const off = type === OpenhabItemType.Rollershutter ? 'DOWN' : 'OFF'
      if (supportsPercentage && (openPercent > 0 && openPercent < 100)) {
        value = `${openPercent}`
      } else if (['UP','LEFT', 'IN'].indexOf(command) > -1 || openPercent === 0) {
        value = customData.inverted ? off : on
      } else {
        value = customData.inverted ? on : off
      }
      break;
    default:
      throw new Error(`Cannot handle ${type} with OpenClose trait`);
  }
  return { value };
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as OpenCloseConfig;
  const customData = device.customData as OpenCloseCustomData;
  if (!config) {
    return device;
  }
  
  if (config.directionMap) {
    customData.directionMap = config.directionMap.split(',').reduce((acc, mapping) => {
      const dmap = mapping.split('=')
      acc[dmap[0]] = dmap[1]
      return acc;
    }, {})
  }
  if (config.inverted) {
    customData.inverted = config.inverted === 'true'
  }
  if (config.directions) {
    device.attributes.openDirection = config.directions.split(',')
  }

  return device
}


export const openClose: Trait = {
  name: 'action.devices.traits.OpenClose',
  commands: ['action.devices.commands.OpenClose'],
  execute: {
    'action.devices.commands.OpenClose':  execute
  },
  sync
}
