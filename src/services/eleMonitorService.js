import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 电气监控模块接口
export function getEleMonitor(data={}){
    return request.get('/client/powerMonitoring/getElectricMonitoring', { data, baseURL }).catch(err=>console.log(err));
}
// 高压进线模块接口
export function getHighVolInfo(data={}){
    return request.get('/client/powerMonitoring/getIncomingManagementNow', { data }).catch(err=>console.log(err));
}
export function getHighVolChart(data={}){
    return request.get('/client/powerMonitoring/getIncomingManagementByCondition', { data }).catch(err=>console.log(err));
}
// 终端监控模块接口
export function getMeterTypes(data={}){
    return request.get('/client/powerMonitoring/getTerminalMonitoringMachInfo', { data }).catch(err=>console.log(err));
}
export function getMeterList(data={}){
    return request.get('/client/powerMonitoring/getTerminalMonitoring', { data }).catch(err=>console.log(err));
}
export function getMeterDetail(data={}){
    return request.get('/client/powerMonitoring/getMachMonitoring', { data }).catch(err=>console.log(err));
}
// 需量管理接口
export function getDemandInfo(data={}){
    return request.get('/client/powerMonitoring/getDemandManagement', { data, baseURL }).catch(err=>console.log(err));
}





