import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution } from "actions-on-google";
import { BaseCustomData, TFAType } from "../model/google";
import { api } from "../api";


export class TFAError extends Error {
  tfaType: string;
  constructor(tfaType) {
      super();
      this.tfaType = tfaType;
      Object.setPrototypeOf(this, TFAError.prototype);
  }
}

export async function verifyTFA(authToken: string, device: SmartHomeV1QueryRequestDevices, req: SmartHomeV1ExecuteRequestExecution) {
  const customData = (device.customData as BaseCustomData);
  
  if (!customData.tfa) {
    return null;
  }

  if(!req.challenge) {
    throw new TFAError(customData.tfa === TFAType.ack ? 'ackNeeded' : 'pinNeeded')
  }

  if (customData.tfa === TFAType.ack && !req.challenge.ack) {
    throw new TFAError('ackNeeded');
  }

  const item = await api.getItem(authToken, device.id);
  const { config } = item.metadata.google
  if (customData.tfa === TFAType.pin && req.challenge.pin !== config.tfaPin) {
    throw new TFAError('challengeFailedPinNeeded');
  }

  return null;
}