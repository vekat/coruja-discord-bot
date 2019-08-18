/**
 * Ignores non-user messages.
 */
exports.ignoreArtificial = async ({ message: m }, next) => {
  return (m.type !== 'DEFAULT' || m.author.bot) ? 'artificial message' : next()
}

/**
 * Ignores non-whitelisted channels.
 */
exports.ensureWhitelist = async ({ settings: s, message: m }, next) => {
  return (s.whitelist && !s.whitelist.some((v) => v === m.channel.id)) ? 'blacklisted channel' : next()
}
