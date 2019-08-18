const path = require('path')

/**
 * Loads a handler file.
 * @param {Client} client
 * @param {string} filename
 */
exports.load = (client, filename) => {
  console.log(`loading handler file: ${filename}`)
  if (!filename.endsWith('.js')) {
    console.log('invalid file extension')
    return false
  }

  const handler = require(`../${client.config.handlersFolder}/${filename}`)
  handler.meta = {
    event: filename.split('.')[0],
    ...handler.meta,
    file: filename
  }

  client.on(handler.meta.event, handler.run.bind(null, client))

  console.log(`handler registered: ${handler.meta.event} (${handler.meta.file})`)
  return true
}
