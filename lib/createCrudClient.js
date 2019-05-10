const assertObjectShape = require('assert-object-shape')

module.exports = function(requestModule) {
  return (config = {}) => {
    assertObjectShape(config, ['adapter', 'headers'])
    const { adapter, headers, errorProcessor } = config

    if (errorProcessor && typeof errorProcessor !== 'function') {
      throw new Error('Provided error processor must be a function.')
    }

    function request(method) {
      return (url, requestConfig = {}) => {
        return requestModule(url, { ...requestConfig, method, headers })
          .then(adapter)
          .catch(error => {
            if (!errorProcessor) return Promise.reject(error)
            return errorProcessor(error)
          })
      }
    }

    return {
      post: request('POST'),
      put: request('PUT'),
      patch: request('PATCH'),
      get: request('GET'),
      delete: request('DELETE')
    }
  }
}
