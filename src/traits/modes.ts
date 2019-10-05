import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";

export interface ModesParams {
  updateModeSettings: {
    [key: string]: string
  };
}

export interface ModesCustomData extends BaseCustomData {
}

export interface ModesTraitConfig {
  lang?: string;
  settings: string;
  ordered?: string;
  mode: string;
  commandMap?: string;
}

async function execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  const customData = device.customData as ModesCustomData;
  const { updateModeSettings } = req.params as ModesParams;
  const mode = Object.keys(updateModeSettings)[0];
  const modeValue = updateModeSettings[mode];
  let deviceType: OpenhabItemType, deviceId: string, value: string;

  // FIXME: extract to generic command lookup
  const targetItem = targetItems.find(i => {
    const config = i.metadata.google.config as ModesTraitConfig;
    const modeFromConfig = config.mode.split('=')[0];
    return config && config.mode && modeFromConfig === mode
  })

  if (targetItem) {
    deviceType = targetItem.type
    deviceId = targetItem.name
    const config = targetItem.metadata.google.config as ModesTraitConfig;
    // FIXME: extract to generic command lookup
    if (config.commandMap) {
      config.commandMap.split(',').forEach(c => {
        const parts = c.split('=')
        if (parts[0] === modeValue) {
          value = parts[1]
        }
      })
    }
  } else {
    deviceType = type
    deviceId = device.id
  }

  if (!value) {
    value = modeValue
  }

  switch(deviceType) {
    case OpenhabItemType.String:
    case OpenhabItemType.Number:
      break;
    default:
      throw new Error(`Cannot handle ${type} with SetModes trait`);
  }
  return { deviceId, value };
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as ModesTraitConfig;
  const customData = device.customData as ModesCustomData;

  if (!config || !config.settings) {
    return null;
  }
  let hasInvalidValue = false;

  const settings = config.settings.split(',').map(s => {
    const [command, synonyms] = s.split('=')
    hasInvalidValue = hasInvalidValue || ([OpenhabItemType.Number].includes(type) && isNaN(command as any))
    return {
      setting_name: command,
      setting_values: [
        {
          setting_synonym: synonyms.split(':'),
          lang: config.lang || 'en'
        }
      ]
    }
  })

  if (hasInvalidValue) {
    return null
  }

  // this is realy really complicated https://developers.google.com/actions/smarthome/reference/traits/modes
  const [name, nameSynonym] = config.mode.split('=')
  device.attributes.availableModes = device.attributes.availableModes || [];
  device.attributes.availableModes.push({
    name,
    name_values: [{
      name_synonym: nameSynonym.split(':'),
      lang: config.lang || 'en'
    }],
    settings,
    ordered: config.ordered === 'true'
  })

  if (item.metadata.autoupdate && item.metadata.autoupdate.value === 'false') {
    device.attributes.commandOnlyOnOff = true;
  }

  if (config.commandMap) {
    customData.lookupOnExecute = true;
  }

  return device
}

export const modes: Trait = {
  name: 'action.devices.traits.Modes',
  commands: ['action.devices.commands.SetModes'],
  execute: {
    'action.devices.commands.SetModes':  execute,
  },
  sync
}