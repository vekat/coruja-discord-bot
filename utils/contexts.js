const { getSettings } = require('./settings')

const baseCtx = {
  log(...msgs) {
    console.log(`[${this.meta.event}] :: ${msgs.join(' :: ')}`)
  },
  onSuccess(...extras) {
    this.log('resolved', ...extras)
  },
  onError(err) {
    this.log(err.message || err.toString())
  }
}

exports.getBaseCtx = function (client, meta, extra) {
  const ctx = {
    client,
    meta,
    guild: client.guilds.get(client.config.guildId),
    settings: getSettings(client),
    ...extra
  }

  for (const key in baseCtx) {
    if (baseCtx.hasOwnProperty(key)) {
      const fn = baseCtx[key];
      ctx[key] = fn.bind(ctx)
    }
  }

  return ctx
}
