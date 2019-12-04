import { SmartHomeV1QueryRequestDevices, SmartHomeV1ExecuteRequestExecution } from "actions-on-google";

import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { Api } from "../api/api";

export type ExecuteHandler = (
  api: Api, 
  device: SmartHomeV1QueryRequestDevices, 
  req: SmartHomeV1ExecuteRequestExecution,
  devicetype: OpenhabItemType,
  targetItems?: OpenhabItem[]
) => AsyncGenerator<ExecutorResult, void, void>

export interface ExecutorResult {
  value: string;
  states: { [key: string]: any }
  deviceId?: string;
}