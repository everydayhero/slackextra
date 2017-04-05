'use strict';

const slack = require('./slack')

module.exports = (data) => {
  const alias = data.args[0]
  const user_id = data.user_id

  if (!alias) {
    return slack.ephemeralResponse('No alias provided')
  }

  return assignAliasToUser(alias, user_id)
}

const assignAliasToUser = (alias, user_id) => {
  let users = [user_id]

  return findUsergroupByHandle(alias).then(usergroup => {
    if (typeof(usergroup) === 'object') {
      return ensureUsergroupIsEnabled(usergroup)
        .then(replaceUsersInUsergroup(users))
    } else {
      return createUsergroup(alias, users)
    }
  })
}

const findUsergroupByHandle = (handle) => {
  return slack('usergroups.list', { include_disabled: true }).then(payload => {
    return payload.usergroups.filter(ug => ug.handle === handle)[0]
  })
}

const replaceUsersInUsergroup  = (users) => {
  return (usergroup) => {
    return slack('usergroups.users.update', { usergroup: usergroup.id, users: users })
      .then(res => slack.ephemeralResponse(['You are now aliased as', usergroup.handle].join(' ')))
  }
}

const createUsergroup = (name, users) => {
  return slack('usergroups.create', { name: name, handle: name })
    .then(res => { replaceUsersInUsergroup(users, res.usergroup) })
}

const ensureUsergroupIsEnabled = (usergroup) => {
  if (!usergroup.deleted_by) {
    return Promise.resolve(usergroup)
  } else {
    return enableUsergroup(usergroup)
  }
}

const enableUsergroup = (usergroup) => {
  return slack('usergroups.enable', { usergroup: usergroup.id }).then(res => res.usergroup)
}
