
import { 
    getIncomingList, addIncoming, updateIncoming, delIncoming
} from '../services/incomingService';
import moment from 'moment';

const initialState = {
    isLoading:true,
    list:[],
    currentPage:1,
    waterCost:{},
    // 成本日历状态
    // 2-日历 1-月历
    mode:'month',
    calendarInfo:{},  
};

export default {
    namespace:'incoming',
    state:initialState,
    effects:{
        *fetchIncomingList(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let data = yield call(getIncomingList, { companyId:userInfo.companyId });
            if ( data && data.code === 200 ){
                yield put({ type:'getIncomingResult', payload:{ data:data.data }});
            }
        },
        *addIncomingAsync(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let { values, forEdit, resolve, reject } = action.payload;
            values.companyId = userInfo.companyId;
            let data = yield call(forEdit ? updateIncoming : addIncoming, values);
            if ( data && data.code === 200 ){
                yield put({ type:'fetchIncomingList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delIncomingAsync(action, { call, put, select }){
            let { inId } = action.payload;
            let data = yield call(delIncoming, { inId });
            if ( data && data.code === 200 ){
                yield put({ type:'fetchIncomingList'});
            }
        }
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getIncomingResult(state, { payload:{ data }}){
            return { ...state, list:data, isLoading:false };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        setCurrentDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


