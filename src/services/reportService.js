import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 数据报表接口
export function getMeterReport(data={}){
    return request.get('/client/energyStatsReport/getMeterRecord', { data, baseURL }).catch(err=>console.log(err));
}
export function getCostReport(data={}){
    return request.get('/client/energyStatsReport/getCostReport', { data, baseURL }).catch(err=>console.log(err));
}
export function getAdjoinReport(data={}){
    return request.get('/client/energyStatsReport/getYoyChainReport', { data, baseURL }).catch(err=>console.log(err));
}





