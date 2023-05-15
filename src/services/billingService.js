import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';

// 计费方案
export function getRateList(data={}){
    return request.get('/client/energyEleRate/getEnergyEleRate', { data, baseURL }).catch(err=>console.log(err)); 
}

export function addRate(data = {}){
    return request.post('/client/energyEleRate/addEnergyEleRate', { data, baseURL }).catch(err=>console.log(err));
}

export function updateRate(data = {}){
    return request.put('/client/energyEleRate/updateEnergyEleRate', { data, baseURL }).catch(err=>console.log(err)); 
}

export function delRate(data = {}){
    return request.delete('/client/energyEleRate/deleteEnergyEleRateById', { data, baseURL }).catch(err=>console.log(err));
}
// 具体的计费规则
export function addQuarter(data={}){
    return request.post('/client/energyEleRate/addEnergyEleRateQuarter', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}
export function updateQuarter(data={}){
    return request.put('/client/energyEleRate/updateEnergyEleRateQuarter', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}
export function delQuarter(data={}){
    return request.delete('/client/energyEleRate/deleteEnergyEleRateQuarterById', { data, baseURL }).catch(err=>console.log(err));
}

// 获取模板
export function getTpl(data = {}){
    return request.get('/admin/eleRateTmp/getEleRateTmpList', { data }).catch(err=>console.log(err));
}

export function applyTpl(data = {}){
    return request.get('/admin/eleRateTmp/getEleRateQuarterTmpByTmpId', { data }).catch(err=>console.log(err));
}
// 获取和设置能源费率信息
export function getFeeRate(data={}){
    return request.get('/client/energyRateInfo/getRateInfo', { data, baseURL }).catch(err=>{ throw err })
}
export function setFeeRate(data={}){
    return request.post('/client/energyRateInfo/addRateInfo', { data, baseURL }).catch(err=>console.log(err))
}

export function isActive(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/activerate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function isUnActive(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/unactive', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

