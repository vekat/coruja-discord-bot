const fs = require('fs')
const path = require('path')

const Discord = require('discord.js')
const Enmap = require('enmap')

const defaults = require('./settings')
const { load: loadHandler } = require('./utils/handlers')

const { BOT_TOKEN: token, GUILD_ID: guildId, FOLDER_HANDLERS: handlersFolder } = process.env

const client = new Discord.Client({ partials: ['GUILD_MEMBER', 'REACTION'] })

client.config = {
  token,
  guildId,
  handlersFolder,
  defaults
}

client.settings = new Enmap({
  name: 'settings',
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
})

const handlers = fs.readdirSync(path.resolve(__dirname, handlersFolder))

for (const file of handlers) {
  loadHandler(client, file)
}

client.login(client.config.token)

process.once('SIGINT', () => {
  client.destroy()
})
