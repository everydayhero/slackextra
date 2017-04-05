'use strict';

const alias = require('./alias')
const slack = require('./slack')

const announce = (data) => {
  const alias = data.args[0]
  const user = ['<@', data.user_id, '|', data.user_name, '>'].join('')

  return () => {
    return slack.inChannelResponse([user, 'is now', alias].join(' '))
  }
}

module.exports = (data) => {
  data.args = ['defender']
  return alias(data).then(announce(data))
}
