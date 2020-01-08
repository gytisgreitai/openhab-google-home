/// <reference types="@google/local-home-sdk" />

import App = smarthome.App;

import Execute = smarthome.Execute;
import Intents = smarthome.Intents;

import IntentFlow = smarthome.IntentFlow;


import * as cbor from 'cbor';
import { LocalDiscoveryData } from '@openhab-google-home/local-discovery';
import { toGoogleDevice, execute } from '@openhab-google-home/core';
import { LocalApiProxy } from './localApiProxy';


let lastDiscoveryData: LocalDiscoveryData ; //hack? No way to get port in REACHABLE_DEVICES and EXEC;

export async function onExecute(app: App, request: IntentFlow.CloudRequest<IntentFlow.ExecuteRequestPayload>) {
  
  const response = new Execute.Response.Builder().setRequestId(request.requestId);
  
  for (const r of request.inputs) {
    for (const c of r.payload.commands) {
      const { devices, execution } = c;
      for (const device of devices) {
        for (const e of execution) {
          try {
            const api = new LocalApiProxy(app, request.requestId, {...lastDiscoveryData, deviceId: device.id});
            const result = await execute(api, device, e);
            response.setSuccessState(result.ids[0], result.states);
          } catch(e) {
            console.error(e);
          }
        }
      }
    }
  }
  return response.build()
}


export async function onIdentify(request: IntentFlow.RequestInterface<IntentFlow.LocalIdentifiedDevice, {}>) {
  const device = request.inputs[0].payload.device;
  const udpScanData = Buffer.from(device.udpScanData.data, "hex");
  const discoveryData: LocalDiscoveryData = await cbor.decodeFirst(udpScanData);

  lastDiscoveryData = discoveryData;
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
  return response;
}

export async function onReachableDevices (app: App, request: IntentFlow.ReachableDevicesRequest) {
    const api = new LocalApiProxy(app, request.requestId, lastDiscoveryData);
    const items = await api.getAll();
    const devices = items.map(item => {
      if (!item.metadata || !item.metadata.google) {
        return;
      }
  
      return toGoogleDevice(item, items);
    })
    .filter(i => !!i)
    .map(({id}) => ({ id }))
    const response: IntentFlow.ReachableDevicesResponse = {
      intent: Intents.REACHABLE_DEVICES,
      requestId: request.requestId,
      payload: {
        devices
      },
    };
    return response;
  };
