const { chain } = require('../utils/chain')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client) => {
  const ctx = getBaseCtx(client, this.meta)

  return chain(setupActivity, fetchChannels, setupRoleMenus)(ctx)
    .then(ctx.onSuccess)
    .catch(ctx.onError)
}

async function setupActivity({ client: { user }, log }, next) {
  try {
    await next()
    await user.setActivity('The Office', { type: 'WATCHING' })
  } catch (err) {
    throw err
  }

  log(`ready as ${user.tag}`, '🦉')
}

async function fetchChannels({ client, settings, guild, log }, next) {
  if (settings.logs) {
    for (const key in settings.logs) {
      const id_name = settings.logs[key]

      if (!client.config.logs) {
        client.config.logs = {}
      }

      if (guild.channels.has(id_name)) {
        client.config.logs[key] = guild.channels.get(id_name)
        continue
      }

      client.config.logs[key] = guild.channels.find((c) => c.name === id_name) || undefined
    }
  }

  next()
}

async function setupRoleMenus({ client, log, settings }) {
  const guild = client.guilds.get(client.config.guildId)

  if (guild.available) {
    log(`setting up role menu for ${guild.name}`)

    if (settings.menus) {
      for (const menu of settings.menus) {
        const channel = guild.channels.get(menu.channel)
        const roles = Object.keys(menu.roles)
        const emojis = Object.values(menu.roles)

        channel.fetchMessage(menu.message)
          .then(async (message) => {
            try {
              for (const emoji of emojis) {
                await message.react(emoji)
              }
            } catch (err) {
              log('a reaction failed')
            }

            const filter = (r, user) => {
              if (emojis.includes(r.emoji.name) && !user.bot) {
                r.user = user
                return true
              }
              return false
            }

            const collector = message.createReactionCollector(filter)

            collector.on('collect', (r) => {
              const emoji = r.emoji.name
              const user = r.user.tag
              log('collect', `${user} reacted with emoji ${emoji}`)

              if (guild.available) {
                const member = guild.members.get(user)

                if (!member) return

                if (member.roles.some((r) => roles.includes(r.name))) {
                  return
                }

                const role = guild.roles.find((r) => r.name === roles[emojis.indexOf(emoji)])

                member.addRole(role).catch(log)
              }
            })
            collector.on('end', (c) => log('end', `collected ${c.size} items`))
          })
      }
    }
  }
}

exports.meta = {
  event: 'ready'
}
