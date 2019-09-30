const { RichEmbed, Attachment } = require('discord.js')

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
  if (client.config.logs['messages']) {
    const embed = new RichEmbed()
      .setDescription(
        `**message from ${msg.author} deleted in ${msg.channel}**\n>>> ${msg.cleanContent || "NO TEXT"}`
      )
      .setAuthor(`${msg.author.tag} • ${msg.author.id}`, msg.author.displayAvatarURL)
      .setFooter(`• ID: ${msg.id}`)
      .setColor(16711680)
      .setTimestamp()

    const opts = { embed }
    if (msg.attachments.size > 0) {
      msg.attachments.tap((v, _) => {
        embed.addField(`attachment: *${v.filename}*`, `${v.proxyURL}`)
      })
    }

    client.config.logs.messages.send(opts)
  }
}

exports.meta = {
  event: 'messageDelete'
}
