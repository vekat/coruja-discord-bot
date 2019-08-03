const Discord = require('discord.js')
const fs = require('fs')

const client = new Discord.Client()

let settings
const { BOT_TOKEN: token, GUILD_ID: guildId } = process.env

try {
  const raw = fs.readFileSync('.settings')
  settings = JSON.parse(raw)
} catch (err) {
  throw err
}

client.config = { token, guildId, ...settings }

client.login(client.config.token)
  .then(() => {
    const guild = client.guilds.get(client.config.guildId)

    if (guild.available && client.config.menus) {
      for (const menu of client.config.menus) {
        const channel = guild.channels.get(menu.channel)
        const roles = Object.keys(menu.roles)
        const emojis = Object.values(menu.roles)

        channel.fetchMessage(menu.message)
          .then((message) => {
            Promise.all(emojis.map((v) => message.react(v))).catch(() => console.error('a reaction failed'))

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
  })

process.once('SIGINT', () => {
  console.log('killing client with sigint')
  client.destroy()
})
