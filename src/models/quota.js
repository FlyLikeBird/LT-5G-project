import { 
    getQuotaList, getQuotaTypes, fillQuota,
    exportTpl, importTpl
} from '../services/quotaService';

const initialState = {
    currentType:{ typeId:1, typeCode:'ele', typeName:'电费', unit:'元' },
    // 1月/2年
    mode:2,
    year:new Date().getFullYear(),
    currentPage:1,
    total:0,
    fillTypes:[],
    fillList:[],
    isLoading:true,
};

export default {
    namespace:'quota',
    state:initialState,
    effects:{
        *init(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchQuotaTypes'});
            yield put({ type:'fetchQuotaList'});
        },
        *fetchQuotaTypes(action, { call, select, put }){
            let data = yield call(getQuotaTypes);
            if ( data && data.code === 200 ){                
                yield put({ type:'getQuotaTypesResult', payload:{ data: data.data }});
            }
        },
        *fetchQuotaList(action, { call, put, select }){
            let { fields:{ currentAttr }, quota:{ currentType, year, mode }} = yield select();
            let data = yield call(getQuotaList, { typeId:currentType.typeId, attrId:currentAttr.key, timeType:mode, year, page:1, pageSize:1000 });
            if ( data && data.code === 200 ) {
                let result = data.data || [];               
                initTableData(currentAttr, mode, result);             
                // console.log(result);
                yield put({ type:'getQuotaListResult', payload:{ data:result }});
            }
        },
        *fillQuotaAsync(action, { call, put, select }){
            let { user:{ userInfo }, quota:{ year, currentType, currentPage, mode }} = yield select();
            let { values, resolve, reject } = action.payload;
            let { attrId, attrName, fillId, fillValue, month } = values;
            let data = yield call(fillQuota, { 
                typeId:currentType.typeId, typeName:currentType.typeName, typeUnit:currentType.uniName, 
                companyId:userInfo.companyId, companyName:userInfo.companyName, 
                year, timeType:mode, month, attrId, attrName, fillId, fillValue:fillValue || 0, 
            });
            if ( data && data.code === 200 ){
                if ( resolve ) resolve();
                yield put({ type:'fetchQuotaList', payload:{ currentPage }});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *exportTplAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentField, currentAttr }, quota:{ mode, currentType, year }} = yield select();
            yield call(exportTpl, { companyId:userInfo.companyId, typeId:currentType.typeId, fieldId:currentField.fieldId, attrId:currentAttr.key, year, typeName:currentType.typeName, timeType:mode });
        },
        *importTplAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }, quota:{ currentType }} = yield select();
            let { resolve, reject, file } = action.payload;
            let data = yield call(importTpl, { file, companyId:userInfo.companyId, attrId:currentAttr.key, typeId:currentType.typeId });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchQuotaList'});
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
        getQuotaTypesResult(state, { payload:{ data }}){
            let temp = data && data.length ? data[0] : {}
            return { ...state, fillTypes:data, currentType:temp };
        },
        getQuotaListResult(state, { payload:{ data  }}){
            return { ...state, fillList:data };
        },
        setYear(state, { payload }){
            return { ...state, year:payload };
        },
        setCurrentType(state, { payload }){
            return { ...state, currentType:payload };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        reset(){
            return initialState;
        }
    }
}
const months = [];
for ( var i=1;i<=12;i++){
    months.push(i);
}
function initTableData(currentAttr, mode, arr){
    if ( currentAttr.attrId ) {
        if ( mode === 1 ) {
            // 月定额模式
            // 去重
            if ( !arr.map(i=>i.attrId).includes(currentAttr.attrId)) {
                arr.push({
                    attrId:currentAttr.attrId,
                    attrName:currentAttr.attrName,
                })
            }
        } else {
            // 年定额模式
            if ( !arr.map(i=>i.attrId).includes(currentAttr.attrId)) {
                arr.push({ attrId:currentAttr.attrId, attrName:currentAttr.attrName, fillValue:0 });
            }
        }
        if ( currentAttr.children && currentAttr.children.length ) {
            currentAttr.children.forEach(item=>{
                initTableData(item, mode, arr);
            })
        }
    }
}
