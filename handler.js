'use strict';

const querystring = require('querystring')
const commands = {
  alias: require('./alias'),
  defender: require('./defender'),
}

const SLACK_TOKEN = process.env.SLACK_TOKEN

module.exports.index = (event, context, callback) => {
  parse(event.body)
    .then(execute())
    .then(success(callback))
    .catch(failure(callback))
}

module.exports.alias = (event, context, callback) => {
  parse(event.body)
    .then(execute('alias'))
    .then(success(callback))
    .catch(failure(callback))
}

const respond = (payload, statusCode) => {
  return {
    statusCode: statusCode || 200,
    body: JSON.stringify(payload)
  }
}

const parse = (str) => {
  try {
    let qs = querystring.parse(str)
    console.log(qs)
    let op = {
      command: qs.command.replace(/(^[\/\s]+|\s+$)/, ''),
      args: qs.text.replace(/(^\s*|\s*$)/g, '').split(/\s+/),
      response_url: qs.response_url,
      team_id: qs.team_id,
      team_domain: qs.team_domain,
      channel_id: qs.channel_id,
      channel_name: qs.channel_name,
      user_id: qs.user_id,
      user_name: qs.user_name,
    }

    if (SLACK_TOKEN) {
      if (qs.token !== SLACK_TOKEN) {
        return Promise.reject(new Error("Invalid verification token"))
      }
    } else {
      console.log("Cannot verify request source because SLACK_TOKEN is not set")
    }

    return Promise.resolve(op)
  } catch (err) {
    return Promise.reject(err)
  }
}

const execute = (override) => {
  return (data) => {
    let func = commands[override || data.command]

    if (func) {
      console.log(data.user_name, 'called', data.command, 'in', data.channel_name)
      return func(data)
    } else {
      return Promise.reject(new Error("Unknown command"))
    }
  }
}

const success = (callback) => {
  return (payload) => callback(null, respond(payload, 200))
}

const failure = (callback) => {
  return (error) => {
    if (error instanceof Error) {
      callback(error, respond(error, 500))
    } else {
      callback(error, respond(error, 500))
    }
  }
}
