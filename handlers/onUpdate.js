const { RichEmbed } = require('discord.js')

const { chain } = require('../utils/chain')
const { ignoreArtificial, ensureWhitelist } = require('../utils/helpers')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client, oldMessage, message) => {
  const ctx = getBaseCtx(client, this.meta, { oldMessage, message })

  return chain(ensureWhitelist, ignoreArtificial, ignoreUnchanged, logMessage)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function ignoreUnchanged({ oldMessage: o, message: m, filter }, next) {
  return (o.cleanContent === m.cleanContent) ? filter('unchanged content') : next()
}

async function logMessage({ client, oldMessage: old, message: msg }) {
  const embed = new RichEmbed()
    .setDescription(
      `**message from ${msg.author} edited in ${msg.channel}**\n[jump to message](${msg.url})`
    )
    .setAuthor(`${msg.author.tag} • ${msg.author.id}`, msg.author.displayAvatarURL)
    .addField('before', `>>> ${old.cleanContent}`)
    .addField('after', `>>> ${msg.cleanContent}`)
    .setFooter(`• ID: ${msg.id}`)
    .setColor(255)
    .setTimestamp()

  if (client.config.logs['messages']) {
    client.config.logs.messages.send(embed)
  }
}

exports.meta = {
  event: 'messageUpdate'
}
