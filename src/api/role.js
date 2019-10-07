import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/role/find',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/role/insert',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/role/delete',
    method: 'delete',
    params: {
      'id': id
    }
  })
}

export function getUserByRole(id) {
  return request({
    url: '/assign/find',
    method: 'get',
    params: {
      'roleId': id
    }
  })
}

export function assignRole(data) {
  return request({
    url: '/assign/insert',
    method: 'post',
    data
  })
}

export function deleteUserRole(id) {
  return request({
    url: '/assign/delete',
    method: 'delete',
    params: {
      'id': id
    }
  })
}
