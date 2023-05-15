import { 
    getRateList, addRate, updateRate, delRate,
    addQuarter, updateQuarter, delQuarter, 
    isActive, isUnActive, editRate,
    getTpl, applyTpl,
    getFeeRate, setFeeRate
} from '../services/billingService';

const initialState = {
    rateList:[],
    is_actived:false,
    rateInfo:{},
    feeRate:{},
    tplList:[],
    // 公司可配置多个计费方案，尖峰平谷时段跟温度相关联
    isLoading:false
};

export default {
    namespace:'billing',
    state:initialState,
    effects:{
        
        *fetchFeeRate(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            let data = yield call(getFeeRate, { companyId:company_id });
            if ( data && data.code === 200 ){
                yield put({ type:'getRateInfoResult', payload:{ data:data.data }});
            }
        },
        *setFeeRateAsync(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let { values, resolve, reject } = action.payload || {};
            
            values.companyId = userInfo.companyId;
            values.companyName = userInfo.companyName;
            let data = yield call(setFeeRate, values);
            if ( data && data.code === 200 ){
                yield put({ type:'fetchFeeRate'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        // 获取电力计费方案
        *fetchRateList(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject } = action.payload || {};
            yield put({ type:'toggleLoading'});
            let data = yield call(getRateList, { companyId:company_id });
            if ( data && data.code === 200 ) {
                yield put({type:'getRateListResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *addRateAsync(action, { select, call, put }){
            let { user:{ userInfo }} = yield select();
            let { values, forEdit, resolve, reject } = action.payload || {};
            values.companyId = userInfo.companyId;
            values.companyName = userInfo.companyName;
            let data = yield call(forEdit ? updateRate : addRate, values);
            if ( data && data.code === 200 ){
                yield put({ type:'fetchRateList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delRateAsync(action, { select, call, put }){
            let { rateId, resolve, reject }= action.payload || {};
            let data = yield call(delRate, { rateId });
            if ( data && data.code === 200 ){
                yield put({ type:'fetchRateList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            } 
        },
        *addQuarterAsync(action, { call, put, select}){
            let { values, forEdit, resolve, reject } = action.payload || {};
            let data = yield call(forEdit ? updateQuarter : addQuarter, { payload:values });
            if ( data && data.code === 200 ){
                yield put({ type:'fetchRateList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }      
        },
        *delQuarterAsync(action, { call, put }){
            let { resolve, reject, quarterId } = action.payload || { };
            let data = yield call(delQuarter, { quarterId });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchRateList' });
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *active(action, { call, put, select}){
            let { resolve, reject } = action.payload;
            let { user:{ company_id }, billing : { is_actived }} = yield select();
            if ( is_actived ) {
                // 取消激活
                let { data } = yield call(isUnActive, { company_id });
                if ( data && data.code === '0'){
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } else {
                // 激活
                let { data } = yield call(isActive, { company_id });
                if ( data && data.code === '0') {
                    if ( resolve ) resolve();
                } else {
                    if (reject) reject(data.msg);
                }
            }
        },
        
        *fetchTpl(action, { select, call, put }){
            let { currentPage } = action.payload || {};
            let data = yield call(getTpl, { page:1, pageSize:40 });
            if ( data && data.code === 200 ){
                yield put({ type:'getTplResult', payload:{ data:data.data }});
            }
        },
        *applyTplAsync(action, { select, call, put }){
            let { rateId, tmpId, resolve, reject } = action.payload || {};
            let data = yield call(applyTpl, { tmpId });
            if ( data && data.code === 200 ) {
                if ( resolve ) resolve();
                yield put({ type:'applyTplResult', payload:{ data:data.data, rateId }});
            } else {
                if ( reject ) reject(data.message);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getRateListResult(state, { payload:{ data }}){
            let rateList = [];
            if ( data && data.length ) {
                rateList = data[0].energyEleRateInfoVOList;
            }
            return { ...state, rateList, isLoading:false };
        },
        applyTplResult(state, { payload:{ data, rateId }}){
            let newArr = state.rateList.map(i=>{
                if ( i.rateId === rateId ) {
                    i.energyEleRateQuarterVOList = data;
                }
                return i;
            })
            return { ...state, rateList:newArr };
        },
        getRateInfoResult(state, { payload:{ data }}){
            return { ...state, rateInfo:data };
        },
        toggleActive(state){
            return { ...state, is_actived:!state.is_actived};
        },
        getFeeRate(state, { payload:{ data }}){
            return { ...state, feeRate:data };
        },
        getTplResult(state, { payload:{ data }}){
            return { ...state, tplList:data || [] };
        },
        reset(){
            return initialState;
        }
    }
}
