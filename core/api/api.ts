import { OpenhabItem } from "../model/openhab";

export interface Api {
  getAll: () => Promise<OpenhabItem[]>
  get: (item: string) => Promise<OpenhabItem>
  updateState: (item: string, value: string) => Promise<any>
}