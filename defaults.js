/**
 * Default passthru auth option if one is not provided by the generator
 * @method  auth
 * @async
 * @private
 * @param   {string} host hostname
 * @param   {integer} port port
 * @param   {integer} iteration client number
 * @param   {function} postAuth the post-auth method
 * @returns {object} undefined
 */
exports.auth = function (host, port, iteration, postAuth) {
  postAuth(null, host, port)
}

exports.getMessage = function () {
  return {}
}
