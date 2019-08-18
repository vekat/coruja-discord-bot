const { getSettings } = require('./settings')

const baseCtx = {
  log(...msgs) {
    console.log(`[${this.meta.event}] :: ${msgs.join(' :: ')}`)
  },
  onSuccess() {
    this.log('done')
  },
  onError(err) {
    this.log(err.message || err.toString())
  }
}

exports.getBaseCtx = function (client, meta, extra) {
  const ctx = { client, meta, ...extra, settings: getSettings(client), guild: client.guilds.get(client.config.guildId) }

  for (const key in baseCtx) {
    if (baseCtx.hasOwnProperty(key)) {
      const fn = baseCtx[key];
      ctx[key] = fn.bind(ctx)
    }
  }

  return ctx
}
