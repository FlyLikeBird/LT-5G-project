import { 
    getMeasureCost, getBaseCost, getAdjustCost
} from '../services/baseCostService';
import { getQuotaByEnergy } from '../services/efficiencyService';
import { getTotalCost, getCostInfo  } from '../services/energyService';
import { getAttrAlarmList } from '../services/alarmService';
import { getEleMonitor } from '../services/eleMonitorService';
import moment from 'moment';
export default {
    namespace:'monitor',
    // state:initialState,
    state:{
        infoList:[],
        todayEle:{},
        energyQuotaList:[],
        // 碳排放 carbon  标煤 coal
        coalInfo:{},
        coalList:[],
        alarmList:[]
    },
    effects:{
        *initMonitor(action, { put }){
            yield put({ type:'fields/setEnergyType', payload:1 });
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchTodayEle'});
            yield put({ type:'fetchEnergyQuota'});
            yield put({ type:'fetchTotalCost'});
            yield put({ type:'fetchCostInfo'});
            yield put({ type:'fetchAttrAlarmList'});
        },
        // 今日用电负荷 = 总线下的有功功率数据 
        *fetchTodayEle(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr }} = yield select();
            let date = moment(new Date());
            if ( currentAttr.key ) {
                let data = yield call(getEleMonitor, { companyId:userInfo.companyId, timeType:3, attrId:currentAttr.key, beginDate:date.format('YYYY-MM-DD'), endDate:date.format('YYYY-MM-DD')})
                if ( data && data.code === 200 ) {
                    yield put({ type:'getEleMonitorResult', payload:{ data:data.data }});
                }
            }
        },
        *fetchEnergyQuota(action, { all, put, select, call }){
            let { user:{ userInfo }, fields:{ allFields, energyTypes }} = yield select();
            // console.log(allFields)
            let data = yield all([
                ...allFields.map(item=>{
                    return call(getQuotaByEnergy, { companyId:userInfo.companyId, energyType:item.energyType, requestId:item.energyType })
                })
            ]);
            if ( data[0] && data[0].code === 200 ){
                let result = data.map((item, index)=>{
                    let energyType = allFields[index].energyType;
                    let ratio = item.data.monthQuota ? Math.round(item.data.monthActual / item.data.monthQuota) : 0;
                    item.data.percent = ratio >= 100 ? 100 : ratio; 
                    return { ...item.data, ...energyTypes[energyType] };
                });
                console.log(result);
                yield put({ type:'getQuotaByEnergyResult', payload:{ data:result }})
            }
        },
        *fetchTotalCost(action, { put, call, select }){
            let { user:{ userInfo }} = yield select();
            let data = yield call(getTotalCost, { companyId:userInfo.companyId, timeType:'2', energyType:0 });
            if ( data && data.code === 200  ){
                yield put({ type:'getTotalCostResult', payload:{ data:data.data }});
            }
        },
        *fetchCostInfo(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let data = yield call(getCostInfo, { companyId:userInfo.companyId, energyType:0 });
            if ( data && data.code === 200 ){
                yield put({ type:'getLocalMonthResult', payload:{ data:data.data }});
            }
        },
        *fetchAttrAlarmList(action, { all, put, call, select }){
            let { user:{ userInfo, timeType, startDate, endDate }} = yield select();
            let data = yield call(getAttrAlarmList, { companyId:userInfo.companyId, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')});
            if ( data && data.code === 200 ){
                yield put({ type:'getAttrAlarmResult', payload:{ data:data.data }});
            }
        }         
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getEleMonitorResult(state, { payload:{ data }}){
            let { energyMachRealtimeInfoList } = data;
            let obj = { date:[], valueData:[] };
            if ( energyMachRealtimeInfoList && energyMachRealtimeInfoList.length ) {
                energyMachRealtimeInfoList.forEach(item=>{
                    obj.date.push(item.dateTime);
                    obj.valueData.push(item.p);
                })
            }
            return { ...state, todayEle:obj };
        },
        getQuotaByEnergyResult(state, { payload:{ data }}){
            return { ...state, energyQuotaList:data };
        },
        getTotalCostResult(state, { payload:{ data }}){
            let obj = { date:[], coalData:[], carbonData:[] };
            let coalSum = 0, carbonSum = 0;
            if ( data && data[0] ) {
                Object.keys(data[0]).sort((a,b)=>{
                    let prev = a.split('-')[2];
                    let next = b.split('-')[2];
                    return prev < next ? -1 : 1;
                }).forEach(key=>{
                    obj.date.push(key);
                    obj.coalData.push(data[0][key].sumUsage);
                    obj.carbonData.push(data[0][key].carbonEmissions);
                    coalSum += +data[0][key].sumUsage;
                    carbonSum += +data[0][key].carbonEmissions;
                })
            }
            obj.coalSum = coalSum;
            obj.carbonSum = carbonSum;
            return { ...state, coalInfo:obj };
        },
        getLocalMonthResult(state, { payload:{ data }}){
            let arr = data.sort((a,b)=>{
                return a.energyType < b.energyType ? -1 : 1;
            }).map(item=>{
                return { energyType:item.energyType, cost:item.month && item.month.timeTotalCost ? item.month.timeTotalCost : 0 }
            })           
            return { ...state, infoList:arr };
        },
        getAttrAlarmResult(state, { payload:{ data }}){
            
            return { ...state, alarmList:data.energyWarningRecordList || [] };
        },
        reset(){
            return initialState;
        }
    }
}
