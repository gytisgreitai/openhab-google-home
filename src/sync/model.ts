import { OpenhabItemType, OpenhabItem } from "../model/openhab";
import { SmartHomeV1SyncDevices } from "actions-on-google";

export type SyncHandler = (type: OpenhabItemType, item: OpenhabItem, device: Partial<SmartHomeV1SyncDevices>) => Partial<SmartHomeV1SyncDevices>