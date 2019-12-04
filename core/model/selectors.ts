import { OpenhabItem } from "./openhab";

export function groupItemsOfSameType(item: OpenhabItem) {
  return item.metadata.google && item.metadata.google.config && item.metadata.google.config.groupType;
}