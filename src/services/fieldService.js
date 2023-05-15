import request from '../utils/request';
// let baseURL = 'http://192.168.20.35:8866';
let baseURL = '';

// 维度管理
export function getFieldList(data = {}){
    return request.get('/client/energyField/getEnergyFiledList', { data, baseURL }).catch(err=>console.log(err)); 
}

export function addField(data = {}){
    return request.post('/client/energyField/addEnergyFiled', { data, baseURL }).catch(err=>console.log(err)); 
}

export function updateField(data = {}){
    return request.put('/client/energyField/updateEnergyFiled', { data, baseURL }).catch(err=>console.log(err)); 
}

export function delField(data = {}){
    return request.delete('/client/energyField/deleteEnergyFiledById', { data, baseURL }).catch(err=>console.log(err)); 
}
// 维度属性管理
export function getFieldAttrs(data = {}){
    return request.get('/client/energyFieldAttr/getEnergyFieldAttrList', { data, baseURL }).catch(err=>console.log(err)); 
}

export function addAttr(data = {}){
    return request.post('/client/energyFieldAttr/addEnergyFieldAttr', { data, baseURL }).catch(err=>console.log(err)); 
}

export function updateAttr(data = {}){
    return request.put('/client/energyFieldAttr/updateEnergyFieldAttr', { data, baseURL }).catch(err=>console.log(err)); 
}

export function delAttr(data = {}){
    return request.delete('/client/energyFieldAttr/deleteEnergyFieldAttrById', { data, baseURL }).catch(err=>console.log(err)); 
}
// 维度属性挂载设备
export function getAttrMeter(data = {}){
    return request.get('/client/energyFieldDetail/getFieldMeterList', { data, baseURL }).catch(err=>console.log(err));
}

export function addAttrMeter(data = {}){
    return request.post('/client/energyFieldDetail/addFieldMeter', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}
export function delAttrMeter(data = {}){
    return request.delete('/client/energyFieldDetail/deleteFieldMeter', { data, baseURL, transformToJson:true }).catch(err=>console.log(err));
}


// 查询虚拟节点运算公式
export function getCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/getcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/addcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/updatecalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/delcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}