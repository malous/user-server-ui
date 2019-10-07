import request from '@/utils/request'

export function getDept() {
  return request({
    url: '/dept/find',
    method: 'get'
  })
}
