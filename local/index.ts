/// <reference types="@google/local-home-sdk" />

import { execute, identify, reachableDevices } from "./app";

const smartHomeApp: smarthome.App = new smarthome.App("0.0.1");

const basehandlers = smartHomeApp
  .onExecute(async (request) => await execute(smartHomeApp, request) as any)
  .onIdentify(async (request) => await identify(request))
  .onReachableDevices(async (request) => await reachableDevices(smartHomeApp, request));

(basehandlers as any)
  .onProxySelected(req => {
    console.log('on proxy select called', req)
    return {};
  })
  .onIndicate(req => console.log("Indicate", JSON.stringify(req, null, 2)))
  .onParseNotification(req =>
    console.log("ParseNotification", JSON.stringify(req, null, 2))
  )
  .onProvision(req => console.log("Provision", JSON.stringify(req, null, 2)))
  .onQuery(req => console.log("Query", JSON.stringify(req, null, 2)))
  .onRegister(req => console.log("Register", JSON.stringify(req, null, 2)))
  .onUnprovision(req =>
    console.log("Unprovision", JSON.stringify(req, null, 2))
  )
  .onUpdate(req => console.log("Update", JSON.stringify(req, null, 2)))
  .listen()
  .then(() => {
    console.log("Ready");
  });