const assertObjectShape = require('assert-object-shape')

module.exports = function(requestModule) {
  return (config = {}) => {
    assertObjectShape(config, ['headers', 'adapter'])
    const { headers, adapter, baseUrl, errorProcessor } = config
    let formattedBaseUrl = ''

    if (errorProcessor && typeof errorProcessor !== 'function') {
      throw new Error('Provided error processor must be a function.')
    }

    if (baseUrl) {
      formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    }

    function request(method) {
      return (url, requestConfig = {}) => {
        const formattedUrl = url.startsWith('/') ? url : '/' + url
        const absoluteUrl = formattedBaseUrl
          ? formattedBaseUrl + formattedUrl
          : formattedUrl
        return requestModule(absoluteUrl, { ...requestConfig, method, headers })
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
