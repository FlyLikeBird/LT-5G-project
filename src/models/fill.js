import { getFillInfoList, addFillInfo, exportFillTpl, importFillTpl } from '../services/quotaService';
import moment from 'moment';

let fillTypes = [
    {type_id: 1, type_name: "人数", type_code: "population", type_desc: "人数", unit: "人", unit_name: "人" },
    {type_id: 2, type_name: "产值", type_code: "output_value", type_desc: "产值", unit: "万元", unit_name: "万元" },
    {type_id: 4, type_name: "面积", type_code: "area", type_desc: "面积", unit: "m²", unit_name: "平方米"}, 
    {type_id: 5, type_name: "产量", type_code: "product_num", type_desc: "产量", unit: "台", unit_name: "台" }
];

const initialState = {
    fillTypes,
    currentType:fillTypes[0],
    // 1-日 2-月 3-年
    mode:3,
    currentDate:moment(new Date()),
    currentPage:1,
    total:0,
    fillList:[],
    isLoading:true,
};

export default {
    namespace:'fill',
    state:initialState,
    effects:{
        *init(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchFillInfoList'});
        },
        *fetchFillInfoList(action, { call, select, put }){
            let { user:{ userInfo }, fields:{ currentAttr }, fill:{ currentType, mode, currentDate }} = yield select();
            if ( currentAttr.key ) {
                let dateArr = currentDate.format('YYYY-MM-DD').split('-');
                let params = { companyId:userInfo.companyId, typeId:currentType.type_id, typeName:currentType.type_name, attrId:currentAttr.key, timeType:mode, page:1, pageSize:5000 };
                if ( mode === 2 || mode === 3 ) {
                    params.year = dateArr[0];
                }
                if ( mode === 1 ){
                    params.year = dateArr[0];
                    params.month = dateArr[1];
                }
                let data = yield call(getFillInfoList, params);
                if ( data && data.code === 200 ){    
                    let result = data.data || [];                   
                    initTableData(currentAttr, mode, result);             
                    yield put({ type:'getFillInfoResult', payload:{ data:result }});
                }
            }     
        },
        *addFillAsync(action, { call, put, select }){
            let { user:{ userInfo }, fill:{ currentDate, currentType, mode }} = yield select();
            let { values, resolve, reject } = action.payload;
            let { attrId, attrName, fillId, fillValue, month, day } = values;
            let dateArr = currentDate.format('YYYY-MM-DD').split('-');
            let params = {
                typeId:currentType.type_id, typeName:currentType.type_name, typeUnit:currentType.unit_name, 
                companyId:userInfo.companyId, companyName:userInfo.companyName, 
                timeType:mode, attrId, attrName, fillId, fillValue:fillValue || 0, 
            };
            // 年填报
            if ( mode === 3 ) {
                params.year = dateArr[0];
            }
            // 月填报
            if ( mode === 2 ) {
                params.year = dateArr[0];
                params.month = month;
            }
            // 日填报
            if ( mode === 1 ) {
                params.year = dateArr[0];
                params.month = dateArr[1];
                params.day = day;
            }
            let data = yield call(addFillInfo, params);
            
            if ( data && data.code === 200 ){
                if ( resolve ) resolve();
                yield put({ type:'fetchFillInfoList' });
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *exportTplAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentField, currentAttr }, fill:{ mode, currentType, currentDate }} = yield select();
            let dateArr = currentDate.format('YYYY-MM-DD').split('-');
            yield call(exportFillTpl, { companyId:userInfo.companyId, typeId:currentType.type_id, attrId:currentAttr.key, year:dateArr[0], typeName:currentType.type_name });
        },
        *importTplAsync(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }, fill:{ currentType, currentDate }} = yield select();
            let { resolve, reject, file } = action.payload;
            let dateArr = currentDate.format('YYYY-MM-DD').split('-');
            let data = yield call(importFillTpl, { file, companyId:userInfo.companyId, attrId:currentAttr.key, typeId:currentType.type_id, year:dateArr[0] });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchFillInfoList'});
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
        getFillInfoResult(state, { payload:{ data }}){
            return { ...state, fillList:data };
        },
        getQuotaListResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, fillList:data, currentPage, total };
        },
        setCurrentDate(state, { payload }){
            return { ...state, currentDate:payload };
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
        if ( !arr.map(i=>i.attrId).includes(currentAttr.attrId)) {
            arr.push({
                attrId:currentAttr.attrId,
                attrName:currentAttr.attrName,
            })
        }
        if ( currentAttr.children && currentAttr.children.length ) {
            currentAttr.children.forEach(item=>{
                initTableData(item, mode, arr);
            })
        }
    }
}