import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8888';
let baseURL = '';
// 设备管理接口
export function getModelList(data={}){
    return request.get('/equipment/meter/getMeterModelList', { data, baseURL }).catch(err=>console.log(err));
}
export function getMeters(data={}){
    return request.get('/equipment/meter/getMeter', { data, baseURL }).catch(err=>console.log(err));
}
export function addMeter(data = {}){
    return request.post('/equipment/meter/addMeter', { data, baseURL }).catch(err=>console.log(err)); 
}

export function updateMeter(data = {}){
    return request.put('/equipment/meter/updateMeter', { data, baseURL }).catch(err=>console.log(err)); 
}

export function delMeter(data = {}){
    return request.delete('/equipment/meter/deleteMeter', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}






