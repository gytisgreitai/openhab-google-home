import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { BaseCustomData } from "../model/google";
import { Trait } from "./model";
import { Api } from "../api/api";

export interface TogglesParams {
  updateToggleSettings: {
    [key: string]: boolean;
  };
}

export interface TogglesCustomData extends BaseCustomData {
  toggleOnCommand?: string;
  toggleOffCommand?: string;
}

export interface TogglesTraitConfig {
  lang?: string;
  toggle: string;
  toggleOnCommand?: string;
  toggleOffCommand?: string;
}

async function * execute(api: Api, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {

  const { updateToggleSettings } = req.params as TogglesParams;
  const toggles = Object.keys(updateToggleSettings);
  let currentToggleSettings = {};
  for (const toggle of toggles) {
    let toggleOn = Boolean(updateToggleSettings[toggle])
    currentToggleSettings[toggle] = toggleOn;
    let deviceType: OpenhabItemType, deviceId: string, value: string;
    // FIXME: extract to generic command lookup
    const targetItem = targetItems.find(i => {
      const config = i.metadata.google.config as TogglesTraitConfig;
      return config && config.toggle && config.toggle.split('=')[0].toLowerCase() === toggle.toLowerCase();
    })
    if (targetItem) {
      deviceType = targetItem.type
      deviceId = targetItem.name
      const config = targetItem.metadata.google.config as TogglesTraitConfig;
      if (config.toggleOnCommand && toggleOn) {
        value = config.toggleOnCommand;
      } else if (config.toggleOffCommand && !toggleOn) {
        value = config.toggleOffCommand;
      }
    } else {
      deviceType = type
      deviceId = device.id
    }
  
    switch(deviceType) {
      case OpenhabItemType.String:
      case OpenhabItemType.Switch:
      case OpenhabItemType.Dimmer:
        value = value || (toggleOn ? 'ON' : 'OFF')
        break;
      default:
        throw new Error(`Cannot handle ${type} with SetModes trait`);
    }
    yield { deviceId, value, states: { currentToggleSettings } };
  }
}

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  const config = item.metadata.google.config as TogglesTraitConfig;
  const customData = device.customData as TogglesCustomData;

  if (!config || !config.toggle) {
    return null;
  }

  const [command, synonyms] = config.toggle.split('=')
  device.attributes.availableToggles = device.attributes.availableToggles || [];
  const settings = {
    name: command,
    name_values: [
      {
        name_synonym: synonyms.split(':'),
        lang: config.lang || 'en'
      }
    ]
  }
  device.attributes.availableToggles.push(settings)

  if (item.metadata.autoupdate && item.metadata.autoupdate.value === 'false') {
    device.attributes.commandOnlyToggles = true;
  }

  if (config.toggleOffCommand || config.toggleOnCommand) {
    customData.lookup = true;
  }

  return device
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  const config = item.metadata.google.config as TogglesTraitConfig;

  const toggleOn = (config.toggleOnCommand && config.toggleOnCommand === item.state) || item.state === 'ON'
 
  return {
    online: true,
    currentToggleSettings: {
      [config.toggle.split('=')[0]] : toggleOn
    }
  }
}

export const toggles: Trait = {
  name: 'action.devices.traits.Toggles',
  commands: ['action.devices.commands.SetToggles'],
  execute: {
    'action.devices.commands.SetToggles':  execute,
  },
  sync,
  query
}