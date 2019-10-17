export interface BaseCustomData {
  itemType?: string;
  lookup?: boolean;
  tfa?: TFAType;
}
 export enum TFAType {
   ack = 'ack',
   pin = 'pin'
 }