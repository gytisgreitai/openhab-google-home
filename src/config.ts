export const config = {
  port: process.env.PORT || 3000,
  openhab: {
    host: process.env.OPENHAB_URL || 'http://localhost:8080',
    itemsPath: '/rest/items/'
  }
}