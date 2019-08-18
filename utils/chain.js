/**
 * Creates a new array with all array elements concatenated into it.
 * @param {any[]} input Input array
 * @returns {any[]} New flattened array.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat}
 */
exports.flatten = function flatten (input) {
  const stack = [...input]
  const res = []
  while (stack.length) {
    // pop value from stack
    const next = stack.pop()
    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next)
    } else {
      res.push(next)
    }
  }
  // reverse to restore input order
  return res.reverse()
}

/**
 * Chains a set of functions to share a context.
 * @param {Function[]} fns Function array
 * @returns {Function}
 */
exports.chain = function chain (...fns) {
  fns = exports.flatten(fns)

  for (const fn of fns) {
    if (typeof fn !== 'function') {
      throw new Error('input must only contain functions')
    }
  }

  return function run (context, next) {
    let lastIndex = -1
    function dispatch (index) {
      if (index <= lastIndex) return Promise.reject(new Error('next() called multiple times'))
      lastIndex = index
      let fn = fns[index]
      if (index === fns.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, index + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}
