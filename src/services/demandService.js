import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 需量管理接口
export function getDemandInfo(data={}){
    return request.get('/client/powerMonitoring/getDemandManagement', { data, baseURL }).catch(err=>console.log(err));
}




