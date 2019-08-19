const { RichEmbed } = require('discord.js')

const { chain } = require('../utils/chain')
const { ignoreArtificial, ensureWhitelist } = require('../utils/helpers')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client, message) => {
  const ctx = getBaseCtx(client, this.meta, { message })

  return chain(ensureWhitelist, ignoreArtificial, logMessage)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function logMessage({ client, message: msg }) {
  const embed = new RichEmbed()
    .setDescription(
      `**message from ${msg.author} deleted in ${msg.channel}**\n>>> ${msg.cleanContent}`
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
