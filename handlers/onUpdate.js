const { RichEmbed } = require('discord.js')

const { chain } = require('../utils/chain')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client, oldMessage, newMessage) => {
  const ctx = getBaseCtx(client, this.meta, { oldMessage, newMessage })

  return chain(logMessage)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function logMessage({ client, settings, oldMessage: old, newMessage: msg }) {
  if (msg.type !== 'DEFAULT' || msg.author.bot) {
    return
  }

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
