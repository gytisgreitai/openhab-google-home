import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";

export type ExecuteHandler = (
  authToken: string, 
  device: SmartHomeV1QueryRequestDevices, 
  req: SmartHomeV1ExecuteRequestExecution,
  devicetype: OpenhabItemType,
  targetItems?: OpenhabItem[]
) => AsyncGenerator<ExecutorResult, void, void>

export interface ExecutorResult {
  value: string;
  deviceId?: string;
}