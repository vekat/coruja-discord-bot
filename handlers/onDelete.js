const { RichEmbed } = require('discord.js')

const { chain } = require('../utils/chain')
const { ignoreArtificial } = require('../utils/helpers')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client, message) => {
  const ctx = getBaseCtx(client, this.meta, { message })

  return chain(ignoreArtificial, logMessage)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function logMessage({ client, settings, message: msg }) {
  if (settings.whitelist) {
    if (!settings.whitelist.some((v) => v === msg.channel.id)) {
      return
    }
  }

  const embed = new RichEmbed()
    .setDescription(
      `**message from ${msg.author} deleted in ${msg.channel}**
      >>> ${msg.cleanContent}`
    )
    .setAuthor(`${msg.author.tag} • ${msg.author.id}`, msg.author.displayAvatarURL)
    .setFooter(`• ID: ${msg.id}`)
    .setColor(16711680)
    .setTimestamp()

  if (client.config.logs['messages']) {
    client.config.logs.messages.send(embed)
  }
}

exports.meta = {
  event: 'messageDelete'
}
