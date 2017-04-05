'use strict';

const url = require('url')
const fetch = require('node-fetch')

const SLACK_URL = 'https://slack.com/api/'

module.exports = (method, args) => {
  const token = process.env.SLACK_API_TOKEN

  if (!token) {
    throw "Slack API Token isn't defined. Ensure SLACK_API_TOKEN is set."
  }

  const query = Object.assign({}, args || {}, { token: token })
  const urlObject = url.parse(SLACK_URL + method)

  urlObject.query = query

  const requestUrl = url.format(urlObject)
  return fetch(requestUrl)
    .then(res => res.json())
    .then(checkResponse)
}

module.exports.inChannelResponse = (msg, attachments) => {
  return {
    text: msg,
    attachments: attachments,
    response_type: 'in_channel',
  }
}

module.exports.ephemeralResponse = (msg, attachments) => {
  return {
    text: msg,
    attachments: attachments,
    response_type: 'ephemeral',
  }
}

const checkResponse = (res) => {
  if (res.ok) {
    return Promise.resolve(res)
  } else {
    return Promise.reject(new Error(res.error))
  }
}
