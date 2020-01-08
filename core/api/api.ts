import { OpenhabItem } from "../model/openhab";

export const ApiParameters = {
  fields: 'editable,groupNames,groupType,name,label,metadata,stateDescription,tags,type',
  metadata: 'google,channel,synonyms,autoupdate'
}

export interface Api {
  getAll: () => Promise<OpenhabItem[]>
  get: (item: string) => Promise<OpenhabItem>
  updateState: (item: string, value: string) => Promise<any>
}