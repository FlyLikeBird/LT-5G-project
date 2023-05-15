import { 
    getFieldList, addField, updateField, delField, 
    getFieldAttrs, addAttr, updateAttr, delAttr,
    getAttrMeter, addAttrMeter, delAttrMeter
} from '../services/fieldService';
const initialState = {
    // 能源类型
    // energyTypes:{
    //     0:{ type_name:'总', type_code:'total', type_id:0, unit:'tce' },
    //     1:{ type_name:'电', type_code:'ele', type_id:1, unit:'kwh' },
    //     2:{ type_name:'水', type_code:'water', type_id:2, unit:'m³'},
    //     3:{ type_name:'气', type_code:'gas', type_id:3, unit:'m³'},
    //     7:{ type_name:'燃气', type_code:'combust', type_id:7, unit:'m³'},
    //     4:{ type_name:'热', type_code:'hot', type_id:4, unit:'GJ' },
    //     8:{ type_name:'压缩空气', type_code:'compressed', type_id:8, unit:'m³'},
    // },
    energyTypes:{},
    // 默认能源类型为电
    currentEnergy:'',
    // [
    //     { energyType:1, energyFieldList:[] },
    //     { energyType:2, energyFieldList:[] },
    // ]            
    allFields:[],
    fieldType:[
        { field_type:1, code_name: "支路", gateway_need: 1, name: "branch" },
        { field_type:2, code_name: "区域", gateway_need: 1, name: "region" },
        { field_type:0, code_name:'其他' }
    ],
    // {
    //     fieldId1:treeData,
    //     fieldId2:treeData
    // }
    allFieldAttrs:{},
    //  当前维度
    currentField:{},
    //  当前维度属性
    currentAttr:{},
    isLoading:false,
    expandedKeys:[],
    //  属性树加载状态
    treeLoading:false,
    currentPage:1,
    total:0,
    bindMeters:[]
};

export default {
    namespace:'fields',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        
        *cancelAll(action, { put }){
            yield put({ type:'reset'});
        },
        *init(action, { call, put, select }){
            let { needsUpdate, resolve, reject, typeCode } = action.payload || {};
            let currentField = {};  
            yield put.resolve({ type:'fetchField', payload:{ needsUpdate }});
            let { fields:{ allFields, currentEnergy }} = yield select();
            // 此处可根据传入的能源标识码typeCode先判断能源类型；
            currentEnergy =  currentEnergy || allFields[0].energyType;
            if ( typeCode ){
                if ( typeCode === 'total') {
                    currentEnergy = 0;
                } else {
                    let temp = allFields.filter(i=>i.typeCode === typeCode )[0];
                    currentEnergy = temp && temp.energyType;
                }
            }    
            // allFields只有基础能源类型，总能源特殊处理
            let fieldEnergy = currentEnergy === 0 ? 1 : currentEnergy; 
            allFields.forEach(i=>{
                if ( i.energyType === fieldEnergy ) {
                    let energyFields = i.energyFieldList;
                    currentField = energyFields && energyFields.length ? energyFields[0] : {};
                }
            });    
            yield put.resolve({ type:'setCurrentField', payload:currentField });
            yield put.resolve({ type:'setEnergyType', payload:currentEnergy });
            yield put.resolve({ type:'fetchFieldAttrs', payload:{ needsUpdate, resolve, reject }});
        },
        // *fetchFieldType(action, { call, put}){
        //     let { data } = yield call(getFieldType);
        //     if ( data&& data.code ==0){
        //         yield put({type:'getFieldType', payload:{data:data.data}});
        //     }
        // },
        *fetchField(action, { call, put, select}){       
            try {
                let { user:{ userInfo }, fields:{ currentField }} = yield select();
                let { resolve, reject, needsUpdate } = action.payload || {};
                //  初始化维度列表
                // needsUpdate字段是维度源数据变化时强制更新, 否则从缓存中读取维度属性和属性树状态不变
                if ( needsUpdate || !currentField.fieldId ) {            
                    yield put({type:'toggleLoading'}); 
                    let data = yield call(getFieldList, { companyId:userInfo.companyId });
                    if ( data && data.code == 200 ){
                        yield put({type:'getFieldsResult', payload:{ data:data.data }}); 
                        //  默认以第一个维度为当前维度
                        if ( resolve && typeof resolve === 'function') resolve();
                    } else {
                        if ( reject ) reject(data.message);
                    }
                } else {
                    yield put({ type:'updateFieldCache'});
                    if ( resolve && typeof resolve === 'function') resolve();
                }
            } catch(err){
                console.log(err);
            }         
        },
        *addFieldAsync(action, { call, put, select }){
            let { values, resolve, reject } = action.payload || {};
            let { user:{ userInfo }, fields:{ currentEnergy }} = yield select();
            values.companyId = userInfo.companyId;
            values.companyName = userInfo.companyName;
            values.energyType = currentEnergy;
            let data = yield call(addField, values);
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchField', payload:{ needsUpdate:true }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *updateFieldAsync(action, { call, put, select }){
            let { resolve, reject, fieldId, fieldName } = action.payload || {};
            let data = yield call(updateField, { fieldId, fieldName });
            if ( data && data.code === 200 ) {
                if ( resolve ) resolve();
                yield put({ type:'fetchField', payload:{ needsUpdate:true }});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delFieldAsync(action, { call, put }){
            let { resolve, reject, fieldId } = action.payload;
            let data = yield call(delField, { fieldId });
            if ( data && data.code === 200 ) {
                if ( resolve ) resolve();
                yield put({ type:'fetchField', payload:{ needsUpdate:true }});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchFieldAttrs(action, { call, put, select}){
            // resolve 用于定额管理 确保先获取fieldAttrs的异步控制
            let { needsUpdate, resolve, reject } = action.payload || {};
            let { fields: { currentField, allFieldAttrs } } = yield select();
            // 如果维度列表为空
            if ( !currentField.fieldId ) {
                if ( resolve && typeof resolve === 'function' ) resolve();
                return ;
            }
            // 强制更新或者allFieldAttrs缓存数据里没有对应的Attr才请求
            if ( needsUpdate || !allFieldAttrs[currentField.fieldId] ) {
                if ( !needsUpdate ) {
                    yield put({type:'toggleTreeLoading'});
                }
                let data = yield call(getFieldAttrs, { fieldId : currentField.fieldId });       
                if ( data && data.code === 200 ){
                    // console.log('field-attrs');
                    //  以维度属性树的第一个节点为当前属性节点 
                    yield put({type:'getFieldAttrsResult', payload:{ data:data.data, fieldId:currentField.fieldId }});         
                    if ( resolve ) resolve(data.data);
                } else {
                    if ( reject ) reject(data.message);
                }
            } else {
                // console.log('c');
                // 如果某个维度属性树已经存在，则当前节点更新为树的根节点
                let fieldAttrs = allFieldAttrs[currentField.fieldId] || [];
                let result = fieldAttrs && fieldAttrs.length ? fieldAttrs[0] : {}; 
                yield put({ type:'setCurrentAttr', payload:result });
                // 更新折叠状态
                let arr = [];
                getExpendKeys(fieldAttrs, arr);
                yield put({ type:'setExpandedKeys', payload:arr });
                if ( resolve ) resolve(fieldAttrs);
            }        
        },
        *addAttrAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentEnergy, currentAttr }} = yield select();
            if ( currentAttr.attrId ) {
                let { fieldId, fieldType, fieldName, level, attrId, parentId } = currentAttr;
                let { attrName, isChild, resolve, reject } = action.payload;
                let params = { 
                    companyId:userInfo.companyId, companyName:userInfo.companyName, energyType:currentEnergy, 
                    fieldId, fieldName, fieldType, level: isChild ? level + 1 : level, parentId: isChild ? attrId : parentId, attrName
                }  
                let data = yield call(addAttr, params);
                if ( data && data.code === 200 ) {
                    yield put({ type:'fetchFieldAttrs', payload:{ needsUpdate:true }});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.message);
                }
            }
        },
        *updateAttrAsync(action, { call, put, select }){
            let { resolve, reject, fieldAttrId, fieldAttrName } = action.payload;
            let data = yield call(updateAttr, { fieldAttrId, fieldAttrName });
            if ( data && data.code === 200) {
                yield put({ type:'fetchFieldAttrs', payload:{ needsUpdate:true }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delAttrAsync(action, { call, put, select }){
            let { resolve, reject, fieldAttrId } = action.payload;
            let data = yield call(delAttr, { fieldAttrId });
            if ( data && data.code === 200) {
                yield put({ type:'fetchFieldAttrs', payload:{ needsUpdate:true }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchAttrMeters(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }} = yield select();
            let { isLinked, meterName, currentPage } = action.payload || {};
            currentPage = currentPage || 1;
            yield put({ type:'toggleLoading'});
            let data = yield call(getAttrMeter, { companyId:userInfo.companyId, attrId:currentAttr.key, isLinked, meterName, page:currentPage, pageSize:10 })
            if ( data && data.code === 200 ) {
                yield put({ type:'getAttrMeterResult', payload:{ data:data.data, currentPage, total:data.total }});
            }
        },
        *addAttrMeterAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }} = yield select();
            let { resolve, reject, checkedRowKeys } = action.payload;
            let data = yield call(addAttrMeter, { payload:{ companyId:userInfo.companyId, attrId:currentAttr.key, machIds:checkedRowKeys } });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchAttrMeters', payload:{ isLinked:0 }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delAttrMeterAsync(action, { call, put, select }){
            let { resolve, reject, detailIds } = action.payload;
            let data = yield call(delAttrMeter, { payload:detailIds });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchAttrMeters', payload:{ isLinked:0 }})
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleTreeLoading(state){
            return { ...state, treeLoading:true }
        },
        getFieldsResult(state, { payload:{ data }} ){ 
            let obj = data.reduce((sum, cur)=>{
                sum[cur.energyType] = { energyType:cur.energyType, typeName:cur.typeName, unit:cur.unit, typeCode:cur.typeCode };
                return sum;
            }, {}); 
            obj['0'] = { typeName:'总', typeCode:'total', energyType:0, unit:'tce' };
            return { ...state, allFields:data, energyTypes:obj, isLoading:false };
        },
        updateFieldCache(state){
            // 更新能源类型时切换当前维度状态
            let temp = state.allFields.filter(i=>i.energyType === state.currentEnergy)[0];
            let currentField = temp && temp.energyFieldList && temp.energyFieldList.length ? temp.energyFieldList[0] : {};
            let fieldAttrs = state.allFieldAttrs[currentField.fieldId];
            let currentAttr = fieldAttrs && fieldAttrs.length ? fieldAttrs[0] : {};
            return { ...state, currentField, currentAttr };
        },
        getFieldAttrsResult(state, { payload:{ data, fieldId }}){
            let currentAttr = null;
            let expandedKeys = [];
            if ( data && data.length ) {
                formatTreeData(data, expandedKeys);
                currentAttr = data[0];
            }
            let temp = { ...state.allFieldAttrs, [fieldId]:data };
            return { ...state, allFieldAttrs:temp, expandedKeys, currentAttr:currentAttr || {}, treeLoading:false };
        },
        getAttrMeterResult(state, { payload:{ data, currentPage, total }}){
            let bindMeters = [];
            if ( data && data.length ) {
                bindMeters = data[0].linkedMeter;
            }
            return { ...state, bindMeters, currentPage, total, isLoading:false };
        },
        setEnergyType(state, { payload }){
            return { ...state, currentEnergy:payload };
        },
        setCurrentField(state, { payload }){   
            return { ...state, currentField:payload, currentAttr:payload.fieldId ? state.currentAttr : {} };
        },
        setCurrentAttr(state, { payload }){
            return { ...state, currentAttr:payload };
        },
        setExpandedKeys(state, { payload }){
            return { ...state, expandedKeys:payload };
        },
        reset(state){
            return initialState;
        }
    }
}

function getExpendKeys(data, result, deep = 0 ){
    ++deep;
    if ( deep === 2 ){
        return ;
    }
    data.forEach(item=>{
        if ( item.children && item.children.length ){
            result.push(item.key);
            getExpendKeys(item.children, result, deep);
        }
    })
}

function formatTreeData(data, expandedKeys, deep = 0){
    ++deep;
    data.forEach(node=>{
        node.title = node.attrName;
        node.key = node.attrId;
        if ( deep <= 2 ) {
            expandedKeys.push(node.attrId);
        }
        if ( node.subEnergyFieldAttr && node.subEnergyFieldAttr.length ) {
            formatTreeData(node.subEnergyFieldAttr, expandedKeys, deep);
        }
        node.children = node.subEnergyFieldAttr;
    })
}
