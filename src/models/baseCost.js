import { 
    getMeasureCost, getBaseCost, getAdjustCost
} from '../services/baseCostService';

const initialState = {
    activeKey:'measure',
    measureCostInfo:{
    },
    baseCostInfo:{},
    adjustCostInfo:{},
    checkedRowKeys:[],
    isLoading:true,
    currentPage:1,
    total:0,
};

export default {
    namespace:'baseCost',
    state:initialState,
    effects:{
        *initEleCost(action, { put }){
            yield put({ type:'fields/setEnergyType', payload:1 });
            yield put({ type:'user/toggleTimeType', payload:'2' });
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchEleCost'});
        },
        // 诊断报告的接口
        *fetchMeasureCost(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentAttr }} = yield select();
            let { resolve, reject } = action.payload || {};
            let data = yield call(getMeasureCost, { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), timeType:1 });
            if ( data && data.code === 200 ){
                yield put({ type:'getMeasureCostResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchBaseCost(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentAttr }} = yield select();
            let { resolve, reject } = action.payload || {};
            let data = yield call(getBaseCost, { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === 200 ){
                yield put({ type:'getBaseCostResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchAdjustCost(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentAttr }} = yield select();
            let { resolve, reject } = action.payload || {};
            let data = yield call(getAdjustCost, { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')});
            if ( data && data.code === 200 ){
                yield put({ type:'getAdjustCostResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchEleCost(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr }, baseCost:{ activeKey }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleLoading'});
                if ( activeKey === 'measure') {
                    let params = { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), timeType };
                    params.timeType = timeType === '2' ? '1' : timeType === '1' ? '2' : '1';
                    let data = yield call(getMeasureCost, params);
                    if ( data && data.code === 200) {
                        yield put({ type:'getMeasureCostResult', payload:{ data:data.data }});
                    }
                }
                if ( activeKey === 'base' ) {
                    let params = { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')};
                    let data = yield call(getBaseCost, params);
                    if ( data && data.code === 200 ){
                        yield put({ type:'getBaseCostResult', payload:{ data:data.data }});
                    }
                }
                if ( activeKey === 'adjust' ) {
                    let params = { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')};
                    let data = yield call(getAdjustCost, params);
                    if ( data && data.code === 200 ) {
                        yield put({ type:'getAdjustCostResult', payload:{ data:data.data }});
                    }
                }
            } else {

            }  
        },
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getMeasureCostResult(state, { payload:{ data }}){
            if ( data.timeTypeCostList && data.timeTypeCostList.length ) {

            } else {
                data.timeTypeCostList = [
                    {timeType: 3, timeTypeName: "谷时段", cost:0, feeRate:0, electricityPercentage:'0%', electricitySum:0 },
                    {timeType: 2, timeTypeName: "平时段", cost:0, feeRate:0, electricityPercentage:'0%', electricitySum:0 },
                    {timeType: 1, timeTypeName: "峰时段", cost:0, feeRate:0, electricityPercentage:'0%', electricitySum:0 }
                ];
            }
            console.log(data);
            return { ...state, measureCostInfo:data, isLoading:false };
        },
        getBaseCostResult(state, { payload:{ data }}){
            return { ...state, baseCostInfo:data, isLoading:false };
        },
        getAdjustCostResult(state, { payload:{ data }}){
            return { ...state, adjustCostInfo:data, isLoading:false };
        },
        setActiveKey(state, { payload }){
            return { ...state, activeKey:payload };
        },
        reset(){
            return initialState;
        }
    }
}
