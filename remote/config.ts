export const config = {
  port:  Number(process.env.PORT) || 3000,
  openhab: {
    host: process.env.OPENHAB_URL || 'http://localhost:8080',
    itemsPath: '/rest/items/'
  },
  standalone: {
    enabled: process.env.STANDALONE === 'true',
    auth: {
      clientId: process.env.STANDALONE_CLIENT_ID,
      clientSecret: process.env.STANDALONE_CLIENT_SECRET,
    }
  },
  localDiscovery: {
    enabled: process.env.LOCAL_DISCOVERY === 'true',
    discoveryPacket: '4F50454E484142',
    port: 3311,
  }
}