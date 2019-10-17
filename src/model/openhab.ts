

export enum OpenhabItemType {
  Number = 'Number',
  Image = 'Image',
  String = 'String',
  Group = 'Group',
  Player = 'Player',
  Switch = 'Switch',
  Dimmer = 'Dimmer',
  Rollershutter = 'Rollershutter'
}
export interface BaseGoogleConfig {
  roomHint?: string;
  groupType?: string;
  traits?: string;
  tfaAck?: string;
  tfaPin?: string;
}

export interface GoogleMeta {
  value: string;
  config?: BaseGoogleConfig;
}

export interface MetaValue {
  value: string;
}

export interface OpenhabMetaData {
  google?: GoogleMeta;
  synonyms?: MetaValue;
  autoupdate?: MetaValue;
}

export interface OpenhabItem {
  link: string;
  state: string;
  stateDescription: { 
    pattern:string;
    readOnly: boolean; 
    options: any[];
  },
  editable: boolean;
  type: OpenhabItemType;
  name: string;
  label: string;
  tags: string[];
  groupNames: string[]; 
  metadata: OpenhabMetaData
  members?: OpenhabItem[];
}
