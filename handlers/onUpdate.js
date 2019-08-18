const { RichEmbed } = require('discord.js')

const { chain } = require('../utils/chain')
const { ignoreArtificial } = require('../utils/helpers')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client, oldMessage, message) => {
  const ctx = getBaseCtx(client, this.meta, { oldMessage, message })

  return chain(ignoreArtificial, ignoreUnchanged, logMessage)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function ignoreUnchanged({ oldMessage: o, message: m }, next) {
  return (o.cleanContent === m.cleanContent) ? 'unchanged content' : next()
}

async function logMessage({ client, settings, oldMessage: old, message: msg }) {
  if (settings.whitelist) {
    if (!settings.whitelist.some((v) => v === msg.channel.id)) {
      return
    }
  }

  const embed = new RichEmbed()
    .setDescription(
      `**message edited in ${msg.channel}**
      [message link](${msg.url})`
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
