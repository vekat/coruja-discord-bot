/**
 * Ignores non-user messages.
 */
exports.ignoreArtificial = async ({ message: m, filter }, next) => {
  return (m.type !== 'DEFAULT' || m.author.bot) ? filter('artificial message') : next()
}

/**
 * Ignores non-whitelisted channels.
 */
exports.ensureWhitelist = async ({ settings: s, message: m, filter }, next) => {
  return (s.whitelist && !s.whitelist.some((v) => v === m.channel.id)) ? filter('blacklisted channel') : next()
}
