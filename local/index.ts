/// <reference types="@google/local-home-sdk" />

import { onExecute, onIdentify, onReachableDevices } from "./app";

const smartHomeApp: smarthome.App = new smarthome.App("0.0.1");

smartHomeApp
  .onExecute(async (request) => await onExecute(smartHomeApp, request) as any)
  .onIdentify(async (request) => await onIdentify(request))
  .onReachableDevices(async (request) => await onReachableDevices(smartHomeApp, request))
  .listen()
  .then(() => {
    console.log("Ready");
  });