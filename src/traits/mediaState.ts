import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution, SmartHomeV1SyncDevices } from "actions-on-google";
import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { Trait } from "./model";

function sync(type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) {
  return device
}

async function * execute(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution, type: OpenhabItemType, targetItems?: OpenhabItem[]) {
  let value
  switch(req.command) {
    case 'action.devices.commands.mediaPause':
      value = 'PAUSE';
      break
    case 'action.devices.commands.mediaStop':
      value = 'STOP';
      break
    case 'action.devices.commands.mediaResume':
      value = 'PLAY';
      break
    case 'action.devices.commands.mediaNext':
      value = 'NEXT';
      break
    case 'action.devices.commands.mediaPrevious':
      value = 'PREVIOUS';
      break
    case 'action.devices.commands.mediaSeekRelative':
      value = 'FASTFORWARD';
      break
  }

  yield { value, states : {} };
}

async function query(item: OpenhabItem, device: SmartHomeV1QueryRequestDevices) {
  // state protocol is unknown.....
  return {
    online: true,
  }
}
// there is also action.devices.commands.mediaSeekToPosition which could probably ne implemented
// if used String instead of Player ?
export const mediaState: Trait = {
  name: 'action.devices.traits.MediaState',
  commands: [
    'action.devices.commands.mediaPause',
    'action.devices.commands.mediaResume',
    'action.devices.commands.mediaSeekRelative',
    'action.devices.commands.mediaNext',
    'action.devices.commands.mediaPrevious',
    'action.devices.commands.mediaStop'
  ],
  execute: {
    'action.devices.commands.mediaPause': execute,
    'action.devices.commands.mediaResume': execute,
    'action.devices.commands.mediaSeekRelative': execute,
    'action.devices.commands.mediaNext': execute,
    'action.devices.commands.mediaPrevious': execute,
    'action.devices.commands.mediaStop': execute
  },
  sync,
  query
}
