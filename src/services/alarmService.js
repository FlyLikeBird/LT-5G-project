import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';
// 告警首页功能模块

export function getAlarmIndex(data={}){
    return request.get('/client/energyWarningRecord/getEnergyWarningHomeDayMonthYear', { data, baseURL }).catch(err=>console.log(err));
}
export function getAttrAlarmList(data={}){
    return request.get('/client/energyWarningRecord/getEnergyWarningHome', { data, baseURL }).catch(err=>console.log(err));
}

// 告警处理功能模块接口
export function getAlarmList(data={}){
    return request.get('/client/energyWarningRecord/getEnergyWarningRecordList', { data, baseURL }).catch(err=>console.log(err));
}
export function getActionList(data={}){
    return request.get('/client/energyWarningRecord/getEnergyWarningActionTypeList', { data, baseURL }).catch(err=>console.log(err));
}
export function addAction(data={}){
    return request.post('/client/energyWarningRecord/addEnergyWarningAction', { data, transformToJson:true }).catch(err=>console.log(err));
}
export function excuteAlarm(data={}){
    return request.put('/client/energyWarningRecord/updateEnergyWarningRecordStatus', { data }).catch(err=>console.log(err));
}
export function getAlarmHistory(data={}){
    return request.get('/client/energyWarningRecord/getEnergyWarningActionLog', { data, baseURL }).catch(err=>console.log(err));
}
export function uploadImg(data={}){
    return request.post('/client/energyWarningRecord/energyWarningRecordPhotoUpload' + '?requestId=' + data.requestId, { data, baseURL }).catch(err=>console.log(err));
}
// 告警设置接口
export function getRuleList(data={}){
    return request.get('/client/energyWarningSetting/getEnergyWarningRuleSettingList', { data, baseURL }).catch(err=>console.log(err));
}
export function getRuleTypes(data={}){
    return request.get('/client/energyWarningSetting/getEnergyWarningType', { data, baseURL }).catch(err=>console.log(err));
}
export function getRuleDetail(data={}){
    return request.get('/client/energyWarningSetting/getEnergyWarningRuleSettingByRuleId', { data, baseURL }).catch(err=>console.log(err));
}
export function addRule(data={}){
    return request.post('/client/energyWarningSetting/editEnergyWarningRuleSetting', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}
export function delRule(data={}){
    return request.delete('/client/energyWarningSetting/deleteEnergyWarningRuleSetting', { data, baseURL }).catch(err=>console.log(err));
}








