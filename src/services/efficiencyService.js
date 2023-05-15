import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 能效管理接口

export function getIndexInfo(data={}){
    return request.get('/client/energyEfficiency/getEnergyEfficiencyHomeByFillTypeTotal', { data, baseURL }).catch(err=>console.log(err));
}
export function getSankeyChart(data={}){
    return request.get('/client/energyEfficiency/getEnergyEfficiencyHomeByAttr', { data, baseURL }).catch(err=>console.log(err));
}
export function getFillTypeChart(data={}){
    return request.get('/client/energyEfficiency/getEnergyEfficiencyByFillType', { data, baseURL }).catch(err=>console.log(err));
}
export function getEnergyQuotaInfo(data={}){
    return request.get('/client/energyEfficiency/getEnergyConsumptionFixed', { data, baseURL }).catch(err=>console.log(err));
}
export function getQuotaByEnergy(data={}){
    return request.get('/client/energyEfficiency/getEnergyConsumptionFixedByEnergyType' + '?requestId=' + data.requestId, { data, baseURL }).catch(err=>console.log(err));
}
