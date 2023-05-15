
import { 
    getDemandInfo
} from '../services/demandService';
import moment from 'moment';

const initialState = {
    chartLoading:true,
    infoList:[{ key:'month'}, { key:'year'}],
    isLoading:true,
    waterCost:{},
    demandInfo:{},
    referDate:moment(new Date()).subtract(1,'days')
};

export default {
    namespace:'demand',
    state:initialState,
    effects:{
        *initDemand(action, { call, put }){
            yield put({ type:'fields/setEnergyType', payload:1 });
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'user/toggleTimeType', payload:'3' });
            yield put({ type:''})
        },
        *fetchDemandInfo(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }, demand:{ referDate }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleLoading'});
                let { data } = yield select();
                
            }
        },
        
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getCalendarResult(state, { payload:{ data }}){
            let date = [], cost = [], energy = [];
            Object.keys(data).sort((a,b)=>{
                if ( state.mode === 'month') {
                    let prev = a.split('-')[2];
                    let next = b.split('-')[2];
                    return prev < next ? -1 : 1;
                } else {
                    let prev = a.split('-')[1];
                    let next = b.split('-')[1];
                    return prev < next ? -1 : 1;
                }
            }).forEach(key=>{
                let dateValue = state.mode === 'month' ? key.split('-')[2] : key.split('-')[1];
                date.push(dateValue);
                cost.push(data[key].cost);
                energy.push(data[key].sumUsage);
            });
            return { ...state, calendarInfo:{ date, cost, energy }, isLoading:false };
        },
        getWaterCostResult(state, { payload:{ data }}){
            // attrName: null, cost: 25, sumUsage: 0, timeCostChain: 0
            let infoList = state.infoList.map(item=>{
                return { 
                    timeTotalCost:item.key === 'month' ? data.localMonthCost : data.localYearCost,
                    timeCostChain:item.key === 'month' ? data.localMonthChain : null,
                    timeCostYoy:item.key === 'month' ? data.localMonthYoy : data.localYearYoy,
                    key:item.key 
                };
            });
            return { ...state, waterCost:data, infoList, isLoading:false };
        },
        getTimeRateResult(state, { payload:{ data }}){
            return { ...state, timeRateInfo:data };
        },
        getDocumentResult(state, { payload:{ data }}){
            return { ...state, reportInfo:data };
        },
        getCostTrendResult(state, { payload:{ data, fieldAttrs }}){
            let result = data.map((item, index)=>{
                return { ...item, key:state.chartInfoList[index].key };
            });
            let rankInfo = data[0] && data[0].localMonthBranchCostRanking ? data[0].localMonthBranchCostRanking : {};
            console.log(rankInfo);
            return { ...state, chartInfoList:result, fieldAttrs, rankInfo, chartLoading:false };
        },
        getCostQuotaResult(state, { payload:{ data }}){
            return { ...state, quotaInfo:data };
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


