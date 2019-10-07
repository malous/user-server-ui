import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getUsers(data) {
  return request({
    url: '/user/find',
    method: 'get',
    params: {
      'name': data.name,
      'pageNum': data.pageNum,
      'pageSize': data.pageSize
    }
  })
}

export function addUser(data) {
  return request({
    url: '/user/insert',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/delete',
    method: 'delete',
    params: {
      'id': id
    }
  })
}
