import * as dgram from "dgram";
import * as cbor from "cbor";
import { LocalDiscoveryData } from "./model";

import { URL } from 'url';

export interface DiscoveryConfig {
  port: number;
  discoveryPacket: string;
  openhabUrl: string;
  openhabItemsPath: string;
}

// Taken from https://github.com/actions-on-google/smart-home-local/blob/master/device/server.ts
export function localDiscovery(config: DiscoveryConfig) {
  const socket = dgram.createSocket('udp4');
  
  socket
  .on('message', async (msg, info) => {
    console.log('local discovery message', msg, info)
    const resp = await handleDiscoveryRequest(config, msg, info);
    if (resp) {
      const responsePacket = cbor.encode(resp);
      socket.send(responsePacket, info.port, info.address, (error) => {
        if (error !== null) {
          console.error("failed to send ack:", error);
          return;
        }
        console.log(`sent discovery response: `,resp, 'to:', info);
      });
    }
  })
  .on('listening', () => {
    console.log("localDiscovery listening", socket.address());
  })
  .bind(config.port);
}

async function handleDiscoveryRequest(config: DiscoveryConfig, msg: Buffer, info: dgram.RemoteInfo) {
  
  const discoveryPacketRaw = Buffer.from(config.discoveryPacket, "hex");
  if (msg.compare(discoveryPacketRaw) !== 0) {
    console.warn("received unknown payload:", msg, "from:", info);
    return;
  }

  return {
    deviceId: 'openhab-local',
    port: Number(new URL(config.openhabUrl).port),
    itemPath: config.openhabItemsPath,
  } as LocalDiscoveryData
}