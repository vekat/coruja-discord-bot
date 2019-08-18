/**
 * Returns the guild settings.
 * @param {Client} client
 * @returns {object} Settings object
 */
exports.getSettings = function getSettings(client) {
  const { guildId, defaults } = client.config

  const conf = client.settings.ensure(guildId, defaults)

  return conf
}
