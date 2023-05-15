import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 能源成本管理接口
export function getMeasureCost(data={}){
    return request.get('/client/energyCosts/electricityCosts', { data, baseURL }).catch(err=>console.log(err));
}
export function getBaseCost(data={}){
    return request.get('/client/energyCosts/baseCost', { data, baseURL }).catch(err=>console.log(err));
}
export function getAdjustCost(data = {}){
    return request.get('/client/energyCosts/adjustCost', { data, baseURL }).catch(err=>console.log(err)); 
}







