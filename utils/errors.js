exports.FilterException = class FilterException extends Error {
  constructor(...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilterException)
    }

    this.name = 'FilterException'
    this.date = new Date()
  }
}
