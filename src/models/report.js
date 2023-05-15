import { 
    getMeterReport, getCostReport, getAdjoinReport
} from '../services/reportService';

const initialState = {
    isLoading:true,
    currentPage:1,
    list:[],
    mark:''
};

export default {
    namespace:'report',
    state:initialState,
    effects:{
        *initMeterReport(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchMeterReport'});
        },
        *fetchMeterReport(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }} = yield select();
            if ( currentAttr.key ){
                yield put({ type:'toggleLoading'});
                let data = yield call(getMeterReport, { companyId:userInfo.companyId, attrId:currentAttr.key, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), energyType:currentEnergy, page:1, pageSize:1000 });
                if ( data && data.code === 200 ){
                    yield put({ type:'getReportResult', payload:{ data:data.data }});
                }
            }
        },
        *initCostReport(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchCostReport'});
        },
        *fetchCostReport(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }} = yield select();
            if ( currentAttr.key ){
                yield put({ type:'toggleLoading'});
                let data = yield call(getCostReport, { companyId:userInfo.companyId, attrId:currentAttr.key, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), energyType:currentEnergy, page:1, pageSize:1000 });
                if ( data && data.code === 200 ){
                    yield put({ type:'getReportResult', payload:{ data:data.data }});
                }
            }
        },
        *initAdjoinReport(action, { call, put }){
            let { mark } = action.payload || {};
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'setMark', payload:mark });
            yield put({ type:'fetchAdjoinReport', payload:{ mark }});
        },
        *fetchAdjoinReport(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }, report:{ mark }} = yield select();
            if ( currentAttr.key ){
                yield put({ type:'toggleLoading'});
                let data = yield call(getAdjoinReport, { mark, companyId:userInfo.companyId, attrId:currentAttr.key, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), energyType:currentEnergy, page:1, pageSize:1000 });
                if ( data && data.code === 200){
                    yield put({ type:'getReportResult', payload:{ data:data.data }});
                }
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getReportResult(state, { payload:{ data }}){
            return { ...state, list:data, isLoading:false };
        },
        setMark(state, { payload }){
            return { ...state, mark:payload };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(){
            return initialState;
        }
    }
}
