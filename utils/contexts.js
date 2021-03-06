const { getSettings } = require('./settings')
const { FilterException } = require('./errors')

const baseCtx = {
  log(...msgs) {
    console.log(`[${this.meta.event}] :: ${msgs.join(' :: ')}`)
  },
  filter(...params) {
    throw new FilterException(...params)
  },
  onSuccess(...extras) {
    if (process.env.NODE_ENV !== 'development') return
    extras = extras.filter((v) => v !== undefined)
    if (extras.length) {
      this.log('resolved', ...extras)
    } else {
      this.log('resolved', 'OK')
    }
  },
  onError(err) {
    if (process.env.NODE_ENV !== 'development') return
    this.log('rejected', err)
  }
}

exports.getBaseCtx = function (client, meta, extra) {
  const ctx = {
    client,
    meta,
    guild: client.guilds.cache.get(client.config.guildId),
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
