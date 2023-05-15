import { 
    getModelList, getMeters, addMeter, updateMeter, delMeter
} from '../services/machService';

const initialState = {
    modelList:[],
    meterList:[],
    checkedRowKeys:[],
    isLoading:true,
    currentPage:1,
    total:0,
};

export default {
    namespace:'meter',
    state:initialState,
    effects:{
        *fetchModelList(action, { call, put, select }){
            let data = yield call(getModelList);
            if ( data && data.code === 200 ) {
                yield put({ type:'getModelListResult', payload:{ data:data.data }});
            }
        },
        *fetchMeters(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { currentPage, meterName, registerCode, isGateway } = action.payload || {};
            currentPage = currentPage || 1;
            yield put({ type:'toggleLoading'});
            let data = yield call(getMeters, { meterName, registerCode, isGateway, companyId:company_id, page:currentPage, pageSize:14 });
            if ( data && data.code === 200 ) {
                yield put({ type:'getMetersResult', payload:{ data:data.data }});
            }
        },
        *addMeterAsync(action, { call, put, select }){
            let { user:{ userInfo }, meter:{ currentPage }} = yield select();
            let { values, forEdit, resolve, reject } = action.payload || {};
            values.companyId = userInfo.companyId;
            values.companyName = userInfo.companyName;
            let data = yield call( forEdit ? updateMeter : addMeter, values);
            if ( data && data.code == 200 ) {
                yield put({ type:'fetchMeters', payload:{ currentPage }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delMeterAsync(action, { call, put, all, select }){
            let { meter:{ checkedRowKeys }} = yield select();
            let { machId, resolve, reject, isPatch } = action.payload;
            let data = yield call(delMeter, { payload: isPatch ? checkedRowKeys : [machId] });
            if ( data && data.code === 200){
                resolve();
                yield put({ type:'fetchMeters'});
                yield put({ type:'setCheckedRowKeys', payload:[] });
            } else {
                reject(data.message);
            }
        },
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getModelListResult(state, { payload:{ data }}){
            return { ...state, modelList:data };
        },
        getMetersResult(state, { payload:{ data }}){
            return { ...state, meterList:data, isLoading:false };
        },
        setCheckedRowKeys(state, { payload }){
            return { ...state, checkedRowKeys:payload };
        },
        reset(){
            return initialState;
        }
    }
}
