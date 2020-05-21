const { chain } = require('../utils/chain')
const { getBaseCtx } = require('../utils/contexts')

exports.run = async (client) => {
  const ctx = getBaseCtx(client, this.meta)

  return chain(setupActivity, fetchWebhooks, setupRoleMenus)(ctx)
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

async function fetchWebhooks({ client, settings, guild }, next) {
  if (settings.logs) {
    for (const key in settings.logs) {
      const json = settings.logs[key]

      if (!client.config.logs) {
        client.config.logs = {}
      }

      const guildHooks = await guild.fetchWebhooks()

      const hook = guildHooks.get(json.id)

      client.config.logs[key] = hook || undefined
    }
  }

  next()
}

async function setupRoleMenus({ log, settings, guild }) {
  if (guild.available) {
    log(`setting up role menu for ${guild.name}`)

    if (settings.menus) {
      for (const menu of settings.menus) {
        const channel = guild.channels.cache.get(menu.channel)
        const roles = Object.keys(menu.roles)
        const emojis = Object.values(menu.roles)

        channel.messages.fetch(menu.message)
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
                const member = guild.members.cache.get(r.user.id)

                if (!member) return

                if (member.roles.cache.some((role) => roles.includes(role.name))) {
                  return
                }

                const role = guild.roles.cache.find((role) => role.name === roles[emojis.indexOf(emoji)])

                member.roles.add(role).catch(log)
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
