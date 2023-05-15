import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 能源成本管理接口
export function getCostCalendar(data={}){
    return request.get('/client/energyCosts/getCostCalendar', { data, baseURL }).catch(err=>console.log(err));
}

export function getWaterCost(data={}){
    return request.get('/client/energyCosts/getWaterOrGasFeeCost', { data }).catch(err=>console.log(err));
}

export function getTimeRate(data={}){
    return request.get('/client/energyEleRate/getCompanyRateTimeByDate', { data }).catch(err=>console.log(err));
}

export function getDocumentInfo(data={}){
    return request.get('/client/energyCosts/getCostBilling', { data }).catch(err=>console.log(err));
}
// 成本趋势接口
export function getCostTrend(data={}){
    return request.get('/client/energyCosts/getCostTrend' + '?requestId=' + data.requestId , { data }).catch(err=>console.log(err));
}

export function getCostQuota(data={}){
    return request.get('/client/energyCosts/getCostTrendQuota', { data }).catch(err=>console.log(err));
}




