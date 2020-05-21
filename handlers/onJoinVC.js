const { chain } = require('../utils/chain')
const { getBaseCtx } = require('../utils/contexts')

exports.meta = {
  event: 'voiceStateUpdate'
}

exports.run = async (client, oldState, newState) => {
  const ctx = getBaseCtx(client, this.meta, { oldState, newState })

  return chain(checkJoin, delay, isConnected, assignRole)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function checkJoin({ newState: n, settings, filter }, next) {
  return (settings.voiceWhitelist && n.channel && settings.voiceWhitelist.includes(n.channel.parentID)) ? next() : filter('not joining')
}

async function delay(_, next) {
  await timeout(5000)
  return next()
}

async function isConnected({ newState: n, filter }, next) {
  if (n.channel) {
    return next()
  }
  filter('not connected')
}

async function assignRole({ newState: n, settings, guild }) {
  if (!settings.voicerole) return

  const roleID = settings.voicerole
  const role = guild.roles.cache.get(roleID)
  if (!role) return

  const member = n.member
  if (!member) return
  if (member.roles.cache.has(roleID)) return

  member.roles.add(role, 'joined voice chat')
}

function timeout(ms) {
  return new Promise((res) => setTimeout(res, ms))
}
