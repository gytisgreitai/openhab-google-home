import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem, BaseGoogleConfig } from "../model/openhab";
import { Trait } from "./model";
import { BaseCustomData } from "../model/google";

export interface SetFanSpeedParams {
  fanSpeed: string;
}

export interface FanSpeedCustomData extends BaseCustomData {
}

export interface FanSpeedConfig extends BaseGoogleConfig {
  lang?: string;
  speeds: string;
  ordered?: string;
}

async function * execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as FanSpeedCustomData;
  const { fanSpeed } = req.params as SetFanSpeedParams;
  let value;

  switch(type) {
    case OpenhabItemType.String: 
    case OpenhabItemType.Dimmer:
    case OpenhabItemType.Number:
      value = fanSpeed
      break;
    default:
      throw new Error(`Cannot handle ${type} with SetFanSpeed trait`);
  }
  yield { value }; 
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as FanSpeedConfig;
  const customData = device.customData as FanSpeedCustomData;
  if (!config || !config.speeds) {
    return null;
  }
  let hasInvalidValue = false;
  const speeds = config.speeds.split(',').map(s => {
    const [internalName, synonyms] = s.split('=')
    hasInvalidValue = hasInvalidValue || ([OpenhabItemType.Number, OpenhabItemType.Dimmer].includes(type) && isNaN(internalName as any))
    return {
      speed_name: internalName,
      speed_values: [
        {
          speed_synonym: synonyms.split(':'),
          lang: config.lang || 'en'
        }
      ]
    }
  })

  if (hasInvalidValue) {
    return null
  }
  device.attributes.availableFanSpeeds =  {
    speeds,
    ordered: config.ordered === 'true'
  }
  device.attributes.reversible = false;

  if (item.metadata.autoupdate && item.metadata.autoupdate.value === 'false') {
    device.attributes.commandOnlyOnOff = true;
  }

  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const errorCode = item.state === 'NULL' ? "deviceNotReady" : undefined;
  return {
    online: true,
    currentFanSpeedSetting: item.state,
    errorCode: errorCode
  }
}

export const fanSpeed: Trait = {
  name: 'action.devices.traits.FanSpeed',
  commands: ['action.devices.commands.SetFanSpeed'],
  execute: {
    'action.devices.commands.SetFanSpeed': execute
  },
  sync,
  query
}
