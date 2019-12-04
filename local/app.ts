/// <reference types="@google/local-home-sdk" />

import App = smarthome.App;
import Constants = smarthome.Constants;
import DataFlow = smarthome.DataFlow;
import Execute = smarthome.Execute;
import Intents = smarthome.Intents;

import IntentFlow = smarthome.IntentFlow;
import HttpResponseData = smarthome.DataFlow.HttpResponseData;

import * as cbor from 'cbor';
import { LocalDiscoveryData } from '@openhab-google-home/local-discovery';
import { OpenhabItem, toGoogleDevice } from '@openhab-google-home/core';

export async function execute(app: App, request: IntentFlow.CloudRequest<IntentFlow.ExecuteRequestPayload>) {
  console.log('execute request', request);
  return {};
}

export async function identify(request: IntentFlow.RequestInterface<IntentFlow.LocalIdentifiedDevice, {}>) {
  console.debug('identify request', request);
  const device = request.inputs[0].payload.device;
  console.debug('identify device', device);

  const udpScanData = Buffer.from(device.udpScanData.data, "hex");
  console.debug("udpScanData:", udpScanData);

  const discoveryData: LocalDiscoveryData = await cbor.decodeFirst(udpScanData);
  console.debug("discoveryData:", discoveryData);

  const response: IntentFlow.IdentifyResponse = {
    intent: Intents.IDENTIFY,
    requestId: request.requestId,
    payload: {
      device: {
        id: discoveryData.deviceId,
        isLocalOnly: true,
        isProxy: true
      },
    },
  };
  console.debug('seding identify response', response)
  return response;
}

// https://github.com/NabuCasa/home-assistant-google-assistant-local-sdk
export async function reachableDevices (app: App, request: IntentFlow.ReachableDevicesRequest) {
    console.debug('reachableDevices', request);
    // // Reference to the local proxy device
    // const proxyDevice = request.inputs[0].payload.device.proxyDevice;

    // const udpScanData = Buffer.from(proxyDevice.udpScanData, "hex");
    // console.debug("udpScanData:", udpScanData);

    // const discoveryData: LocalDiscoveryData = await cbor.decodeFirst(udpScanData);
    // console.debug("discoveryData:", discoveryData);

    const command = new DataFlow.HttpRequestData();
    command.method = Constants.HttpOperation.GET;
    command.requestId = request.requestId;
    command.deviceId = 'openhab-local', // proxyDevice.id;
    command.isSecure = false;
    command.port = 8089 // discoveryData.port;
    command.path = '/rest/items?fields=editable,groupNames,groupType,name,label,metadata,stateDescription,tags,type&metadata=google,channel,synonyms,autoupdate' //discoveryData.itemPath;
    command.dataType = "application/json";

    const deviceManager = app.getDeviceManager();

    const resp =await deviceManager.send(command) as HttpResponseData;
    console.log(request.requestId, "Raw Response", resp);

    const items = JSON.parse(resp.httpResponse.body as string) as OpenhabItem[];
    console.log('Got response', items);

    // { verificationId: "local-device-id-2" },
    const devices = items.map(item => {
      if (!item.metadata || !item.metadata.google) {
        return;
      }
  
      return toGoogleDevice(item, items);
    })
    .filter(i => !!i)
    .map(({id}) => ({ id }))

    console.log('reachableDevices', devices);
    // Return a response
    const response: IntentFlow.ReachableDevicesResponse = {
      intent: Intents.REACHABLE_DEVICES,
      requestId: request.requestId,
      payload: {
        devices
      },
    };
    return response;
  };
