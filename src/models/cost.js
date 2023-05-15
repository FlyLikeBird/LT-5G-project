
import { 
    getCostCalendar, getWaterCost, 
    getTimeRate, getDocumentInfo,
    getCostTrend, getCostQuota
} from '../services/costService';
import moment from 'moment';

const initialState = {
    chartLoading:true,
    infoList:[{ key:'month'}, { key:'year'}],
    isLoading:true,
    waterCost:{},
    // 成本日历状态
    // 2-日历 1-月历
    mode:'month',
    calendarInfo:{},
    currentDate:moment(new Date()),
    // 费用结算
    timeRateInfo:{},
    reportInfo:{},
    // 成本趋势
    trendInfo:{},
    chartInfoList:[{ key:'year'}, { key:'month'}, { key:'day'}],
    fieldAttrs:[],
    rankInfo:{},
    quotaInfo:{}    
};

export default {
    namespace:'cost',
    state:initialState,
    effects:{
        *initCostTrend(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'user/toggleTimeType', payload:'3' });
            yield put({ type:'fetchCostTrend'});
            yield put({ type:'fetchCostQuota'});
        },
        *fetchCostTrend(action, { all, call, put, select }){
            let { resolve, reject } = action.payload || {};
            let { user:{ userInfo, startDate }, fields:{ currentField, currentEnergy }} = yield select();
            currentEnergy = currentEnergy === 0 ? 1 : currentEnergy;
            let params = { companyId:userInfo.companyId, fieldId:currentField.fieldId, beginDate:startDate.format('YYYY-MM-DD'), energyType:currentEnergy };
            yield put({ type:'toggleChartLoading'});
            let [dayData, monthData, yearData] = yield all([
                call(getCostTrend, { ...params, timeType:'3', requestId:1 }),
                call(getCostTrend, { ...params, timeType:'2', requestId:2 }),
                call(getCostTrend, { ...params, timeType:'1', requestId:3 })
            ]);
            if ( dayData.code === 200 && monthData.code === 200 && yearData.code === 200 ) {
                let { fields:{ allFieldAttrs, currentField }} = yield select();
                let temp = allFieldAttrs[currentField.fieldId] || [];
                let fieldAttrs = [];
                getAllChildNode(temp[0], fieldAttrs);
                yield put({ type:'getCostTrendResult', payload:{ data:[yearData.data, monthData.data, dayData.data ], fieldAttrs }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject();
            }
        },
        *fetchCostQuota(action, { all, call, select, put }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentField, currentEnergy }} = yield select();
            let { resolve, reject } = action.payload || {};
            currentEnergy = currentEnergy === 0 ? 1 : currentEnergy;            
            let data = yield call(getCostQuota, { companyId:userInfo.companyId, fieldId:currentField.fieldId, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), energyType:currentEnergy });
            if ( data && data.code === 200 ) {
                yield put({ type:'getCostQuotaResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *initCalendar(action, { call, put, all }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchCostCalendar'});
        },
        *fetchCostCalendar(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr, currentEnergy }, cost:{ currentDate, mode }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleLoading'});
                let data = yield call(getCostCalendar, { companyId:userInfo.companyId, energyType:currentEnergy, attrId:currentAttr.key, beginDate:currentDate.format('YYYY-MM-DD'), timeType:mode === 'month' ? 2 : 1 });
                if ( data && data.code === 200 ) {
                    yield put({ type:'getCalendarResult', payload:{ data:data.data }});
                }
            } else {
                yield put({ type:'getCalendarResult', payload:{ data:{} }});
            }        
        },
        *initWaterCost(action, { put, select }){
            let typeCode = action.payload;
            let result = typeCode === 'water_cost' ? 'water' : typeCode === 'gas_cost' ? 'combust' : '';
            yield put.resolve({ type:'fields/init', payload:{ typeCode:result }});
            yield put({ type:'fetchWaterCost'});
        },
        *fetchWaterCost(action, { put, call, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleLoading' });
                let data = yield call(getWaterCost, { companyId:userInfo.companyId, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), timeType, energyType:currentEnergy })
                if ( data && data.code === 200 ) {
                    yield put({ type:'getWaterCostResult', payload:{ data:data.data }});
                }
            } else {
                yield put({ type:'getWaterCostResult', payload:{ data:{} }});
            }   
        },
        *initStatement(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchTimeRate'});
        },
        *fetchTimeRate(action, { put, call, select }){
            let { user:{ userInfo }} = yield select();
            let data = yield call(getTimeRate, { companyId:userInfo.companyId, dateTime:'2022-11-01'});
            if ( data && data.code === 200 ) {
                yield put({ type:'getTimeRateResult', payload:{ data:data.data }})
            }
        },
        *fetchDocument(action, { put, call, select }){
            let { user:{ userInfo }, fields:{ currentAttr, currentEnergy }} = yield select();
            let { values, resolve, reject } = action.payload || {};            
            values.companyId = userInfo.companyId;
            values.attrId = currentAttr.key;
            values.energyType = currentEnergy;
            let data = yield call(getDocumentInfo, values);
            if ( data && data.code === 200 ) {
                yield put({ type:'getDocumentResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                reject(data.message);
            }
        }
        
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
// 获取某个维度属性树所有的子属性
function getAllChildNode(node, arr){
    if ( node && node.children && node.children.length ) {
        node.children.forEach(sub=>{
            arr.push(sub.attrName);
            getAllChildNode(sub, arr)
        })
    }
}


