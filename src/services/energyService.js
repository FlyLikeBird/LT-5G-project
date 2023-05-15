import request from '../utils/request';

// 能源成本管理接口
export function getCostInfo(data = {}){
    return request.get('/client/energyCosts/getDayMonthYearCostInfo', { data }).catch(err=>console.log(err)); 
}

export function getLocalMonth(data = {}){
    return request.get('/client/energyCosts/getLocalMonthCostInfo', { data }).catch(err=>console.log(err)); 
}
export function getTotalCost(data = {}){
    return request.get('/client/energyCosts/getTotalCostDetail' + '?requestId=' + data.requestId, { data }).catch(err=>console.log(err)); 
}
// 成本透视接口
export function getCostAnalysis(data={}){
    return request.post('/client/energyCosts/getCostsPerspective', { data, transformToJson:true }).catch(err=>console.log(err));
}






