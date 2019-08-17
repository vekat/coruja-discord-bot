const fs = require('fs')
const Discord = require('discord.js')

const client = new Discord.Client()

const { BOT_TOKEN: token, GUILD_ID: guildId } = process.env
let settings

try {
  const raw = fs.readFileSync('.settings')
  settings = JSON.parse(raw)
} catch (err) {
  throw err
}

client.config = { token, guildId, ...settings }

client.on('ready', async () => {
  console.log('🦉 ready to go')
})

client.on('messageDelete', async (msg) => {
  if (msg.type !== 'DEFAULT' || msg.author.bot) {
    return
  }

  if (client.config.whitelist) {
    if (!client.config.whitelist.some((v) => v === msg.channel.id)) {
      return
    }
  }

  const embed = new Discord.RichEmbed()
    .setDescription(
      `**message from ${msg.author} deleted in ${msg.channel}**
      > ${msg.cleanContent}`
    )
    .setAuthor(`${msg.author.tag} • ${msg.author.id}`, msg.author.displayAvatarURL)
    .setFooter(`• ID: ${msg.id}`)
    .setColor(16711680)
    .setTimestamp()

  client.config.logs.messages.send(embed)
})

client.on('messageUpdate', async (old, msg) => {
  if (msg.type !== 'DEFAULT' || msg.author.bot) {
    return
  }

  if (client.config.whitelist) {
    if (!client.config.whitelist.some((v) => v === msg.channel.id)) {
      return
    }
  }

  const embed = new Discord.RichEmbed()
    .setDescription(
      `**message edited in ${msg.channel}**
      [message link](${msg.url})`
    )
    .setAuthor(`${msg.author.tag} • ${msg.author.id}`, msg.author.displayAvatarURL)
    .addField('before', `> ${old.cleanContent}`)
    .addField('after', `> ${msg.cleanContent}`)
    .setFooter(`• ID: ${msg.id}`)
    .setColor(255)
    .setTimestamp()

  client.config.logs.messages.send(embed)
})

client.login(client.config.token)
  .then(() => {
    const guild = client.guilds.get(client.config.guildId)

    if (guild.available) {
      if (client.config.logs) {
        for (const key in client.config.logs) {
          const id = client.config.logs[key]
          client.config.logs[key] = guild.channels.get(id)
        }
      }

      if (client.config.menus) {
        for (const menu of client.config.menus) {
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
                console.error('a reaction failed')
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
                const user = r.user.id
                console.log(`collect: user '${user}' reacted with emoji ${emoji}`)

                if (guild.available) {
                  const member = guild.members.get(user)

                  if (!member) return

                  if (member.roles.some((r) => roles.includes(r.name))) {
                    return
                  }

                  const role = guild.roles.find((r) => r.name === roles[emojis.indexOf(emoji)])

                  member.addRole(role).catch(console.error)
                }
              })
              collector.on('end', (c) => console.log(`end: collected ${c.size} items`))
            })
        }
      }
    }
  })

process.once('SIGINT', () => {
  console.log('killing client with sigint')
  client.destroy()
})
