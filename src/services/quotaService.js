import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 定额管理接口
export function getQuotaTypes(data={}){
    return request.get('/client/quotaType/getType', { data, baseURL }).catch(err=>console.log(err));
}
export function getQuotaList(data={}){
    return request.get('/client/quotaFill/getQuoTaFillList', { data, baseURL }).catch(err=>console.log(err));
}
export function fillQuota(data={}){
    return request.post('/client/quotaFill/editQuotaFill', { data, baseURL }).catch(err=>console.log(err));
}
export function exportTpl(data = {}){
    return request.get('/client/quotaFill/exportTemplate', { data, baseURL, isBlob:true }).catch(err=>console.log(err)); 
}
export function importTpl(data = {}){
    return request.post('/client/quotaFill/importExcel', { data, baseURL }).catch(err=>console.log(err)); 
}
// 手工填报接口
export function getFillInfoList(data={}){
    return request.get('/client/infoFill/getInfoFillList', { data, baseURL }).catch(err=>console.log(err));
}
export function addFillInfo(data={}){
    return request.post('/client/infoFill/editInfoFill', { data, baseURL }).catch(err=>console.log(err));
}

export function exportFillTpl(data = {}){
    return request.get('/client/infoFill/exportTemplate', { data, baseURL, isBlob:true }).catch(err=>console.log(err)); 
}
export function importFillTpl(data = {}){
    return request.post('/client/infoFill/importExcel', { data, baseURL }).catch(err=>console.log(err)); 
}






