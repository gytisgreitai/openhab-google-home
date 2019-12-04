import { OpenhabItem } from "../model/openhab";
import { SmartHomeV1QueryRequestDevices } from "actions-on-google";

export type QueryHandler = (
  item: OpenhabItem,
  device: SmartHomeV1QueryRequestDevices
) => Promise<{[key: string]: any}>
