/// <reference types="@google/local-home-sdk" />
import Constants = smarthome.Constants;
import DataFlow = smarthome.DataFlow;
import HttpResponseData = smarthome.DataFlow.HttpResponseData;

import { Api, OpenhabItem, ApiParameters } from "@openhab-google-home/core";

export interface Config {
  port: number;
  itemPath: string;
  deviceId: string;
}

export class LocalApiProxy implements Api {
  
  constructor(
    private app: smarthome.App,
    private requestId: string,
    private config: Config) {
  }

  getAll() {
    return this.execute<OpenhabItem[]>(this.getItemUriWithParams(), Constants.HttpOperation.GET);
  }
  
  get(item: string) {
    return this.execute<OpenhabItem>(this.getItemUriWithParams(item), Constants.HttpOperation.GET);
  }

  updateState(item: string, value: string) {
    return this.execute<unknown>(this.getItemUriWithParams(item), Constants.HttpOperation.POST, value);
  }

  private getItemUriWithParams(itemName?: string) {
    return `${this.config.itemPath}${itemName ?  itemName : ''}?fields=${ApiParameters.fields}&metadata=${ApiParameters.metadata}`
  }

  private async execute<T>(uri: string, method: Constants.HttpOperation, data?: string) {

    const isPost = method === Constants.HttpOperation.POST;
    const command = new DataFlow.HttpRequestData();
    command.method = method;
    command.requestId = this.requestId;
    command.deviceId = this.config.deviceId;
    command.isSecure = false;
    command.port = this.config.port
    command.path = uri
    command.headers
    command.data = data
    command.dataType = isPost ? "text/plain" : "application/json";

    const deviceManager = this.app.getDeviceManager();

    const resp = await deviceManager.send(command) as HttpResponseData;
    return isPost ? null : JSON.parse(resp.httpResponse.body as string) as T;
  }

}