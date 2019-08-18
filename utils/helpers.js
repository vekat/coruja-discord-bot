/**
 * Ignores non-user messages.
 */
exports.ignoreArtificial = async ({ message: m }, next) => {
  return (m.type !== 'DEFAULT' || m.author.bot) ? 'artificial message' : next()
}
