import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';

// 进线功能管理
export function getIncomingList(data = {}){
    return request.get('/client/IncomingLine/getIncomingLine', { data, baseURL }).catch(err=>console.log(err)); 
}

export function addIncoming(data = {}){
    return request.post('/client/IncomingLine/addIncomingLine', { data, baseURL }).catch(err=>console.log(err)); 
}

export function updateIncoming(data = {}){
    return request.put('/client/IncomingLine/updateIncomingLine', { data, baseURL }).catch(err=>console.log(err)); 
}

export function delIncoming(data = {}){
    return request.delete('/client/IncomingLine/deleteIncomingLine', { data, baseURL }).catch(err=>console.log(err)); 
}


