import api from './request'

export function getFlightInfos(){
  return api({
    method:'get',
    url:"hbxq",
  })
}

export function getGuaranteeStatistics(){
  return api({
    method:'get',
    url:"hbzcl",
  })
}

export function searchGoodsInfo(params){
  return api({
    method:'get',
    url:"getCargo",
    params
  })
}

export function getOperation(params){
  return api({
    method:'get',
    url:"getOperation",
    params
  })
}
export function updateUserInfo(data){
  return api({
    method:"post",
    url:"upRyxx",
    data
  })
}

export function getTianqi(){
  return api({
    method:'get',
    url:'https://tianqiapi.com/api?version=v1&appid=47685899&appsecret=Lsbc8SUr&city=%E6%AD%A6%E6%B1%89'
  })
}