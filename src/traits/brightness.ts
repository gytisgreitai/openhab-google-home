import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { Trait } from "./model";
import { BaseCustomData } from "../model/google";

export interface BrightnessAbsoluteParams {
  brightness: number;
}

export interface BrightnessConfig {
}

export interface BrightnessCustomData extends BaseCustomData {
}

async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const { brightness } = req.params as BrightnessAbsoluteParams;
  let value
  switch(type) {
    case OpenhabItemType.String:
    case OpenhabItemType.Dimmer:
    case OpenhabItemType.Number:
      value = `${brightness}`;
      break
    default:
      throw new Error(`Cannot handle ${type} with BrightnessAbsolute trait`);
  }
  return { value };
}


function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as BrightnessConfig;
  const customData = device.customData as BrightnessConfig;
  if (item.metadata.autoupdate && item.metadata.autoupdate.value === 'false') {
    device.attributes.commandOnlyBrightness = true;
  }
  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const brightness = Number(item.state);
  const errorCode = isNaN(brightness) ? "deviceNotReady" : undefined;
  return {
    online: true,
    brightness,
    errorCode: errorCode
  }
}

export const brightness: Trait = {
  name: 'action.devices.traits.Brightness',
  commands: ['action.devices.commands.BrightnessAbsolute'],
  execute: {
    'action.devices.commands.BrightnessAbsolute': execute
  },
  sync,
  query
}
