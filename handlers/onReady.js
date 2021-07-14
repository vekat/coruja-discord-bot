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
  if (guild.available && settings.menus) {
    log(`setting up role menus for ${guild.name}`)

    await guild.roles.fetch()

    for (const menu of settings.menus) {
      const channel = guild.channels.cache.get(menu.channel)
      const roles = menu.roles
      const emojis = menu.emojis

      const message = await channel.messages.fetch(menu.message)

      try {
        for (const emoji of emojis) {
          await message.react(emoji)
        }
      } catch (err) {
        log('failed reaction', err.message)
      }

      const filter = (r, u) => !u.bot && emojis.includes(r.emoji.name)

      const collector = message.createReactionCollector(filter)

      collector.on('end', (c) => log('end', `collected ${c.size} items`))
      collector.on('collect', async (r, u) => {
        TAG = 'collect'
        if (!guild.available) return

        const emoji = r.emoji.name

        log(TAG, `${u.tag} reacted to '${menu.name}' with emoji ${emoji}`)

        const member = await guild.members.fetch({ user: u.id, force: true })

        if (!member) return

        const reactionRole = guild.roles.cache.get(roles[emojis.indexOf(emoji)])

        if (!reactionRole) return

        for (const required of menu.require) {
          if (member.roles.cache.some((role) => required.roles.includes(role.id))) continue

          try {
            const defaultRole = guild.roles.cache.get(required.default)
            await member.roles.add(defaultRole, `add default role of ${menu.name}`)
          } catch (err) {
            log(TAG, err)
          }
        }

        for (const removeRoleId of menu.remove) {
          if (!member.roles.cache.has(removeRoleId)) continue

          try {
            const removeRole = guild.roles.cache.get(removeRoleId)
            await member.roles.remove(removeRole, `remove excluding role of ${menu.name}`)
          } catch (err) {
            log(TAG, err)
          }
        }

        try {
          await member.roles.add(reactionRole, `add role of ${menu.name}`)
        } catch (err) {
          log(TAG, err)
        }
      })

      log(`menu '${menu.name}' has been setup`)
    }
  }
}

exports.meta = {
  event: 'ready'
}
