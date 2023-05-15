
import { 
    getEleMonitor, getDemandInfo
} from '../services/eleMonitorService';
import moment from 'moment';

const buttons = [
    { title:'有功功率', code:'1', unit:'kw', key:'p', prefix:'', type:'letter'  },
    { title:'相电流', code:'2', unit:'A', key:'i', prefix:'avb', type:'num'  },
    { title:'相电压', code:'3', unit:'V', key:'u', prefix:'avg', type:'num' },
    { title:'线电压', code:'4', unit:'V', key:'u' },
    { title:'功率因素', code:'5', unit:'cosΦ', key:'pf', prefix:'avg', type:'num' },
    { title:'无功功率', code:'6', unit:'kvar', key:'q', prefix:'', type:'num' },
    { title:'视在功率', code:'7', unit:'kw', key:'s', prefix:'', type:'num' },
    { title:'温度', code:'8', unit:'℃', key:'tc', prefix:'', type:'num' }
    // { title:'三相不平衡', code:'8', unit:'' },
];
const initialState = {
    optionList:buttons,
    currentOption:buttons[0],
    chartLoading:true,
    sourceData:{},
    chartInfo:{},
    typeRule:{},
    // 2-日历 1-月历
    demandInfo:{},
    referDate:moment(new Date()).subtract(1, 'days')
};

export default {
    namespace:'eleMonitor',
    state:initialState,
    effects:{
        *initEleMonitor(action, { all, call, put }){
            yield put.resolve({ type:'fields/init', payload:{ typeCode:'ele' }});
            yield put({ type:'fetchEleMonitor'});
        },
        *fetchEleMonitor(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleChartLoading'});
                let data = yield call(getEleMonitor, { companyId:userInfo.companyId, timeType, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')})
                if ( data && data.code === 200 ) {
                    yield put({ type:'getEleMonitorResult', payload:{ data:data.data }});
                    yield put({ type:'updateChartInfo'});
                }
            } else {

            }
        },
        *initDemand(action, { put }){
            yield put.resolve({ type:'fields/init', payload:{ typeCode:'ele' }});
            yield put({ type:'fetchDemandInfo'});
        },
        *fetchDemandInfo(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
            let data = yield call(getDemandInfo, { companyId:userInfo.companyId, timeType, attrId:currentAttr.key, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')});
            if ( data && data.code === 200 ){
                yield put({ type:'getDemandResult', payload:{ data:data.data }});
                
            }
        }
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getEleMonitorResult(state, { payload:{ data }}){           
            return { ...state, sourceData:data, chartLoading:false };
        },
        updateChartInfo(state){
            let{ energyMachRealtimeInfoList } = state.sourceData;
            let chartInfo = { date:[], energy:[], energyA:[], energyB:[], energyC:[]};
            // 线电压字段特殊处理
            let current = {};
            energyMachRealtimeInfoList.forEach(item=>{
                current[item.dateTime] = item;
                chartInfo.date.push(item.dateTime);
            })
            let key = state.currentOption.code === '4' ? 'ullavg' : state.currentOption.code === '8' ? 'tc4' : state.currentOption.key + state.currentOption.prefix ;
            let subAKey = state.currentOption.code === '4' ? '12' : state.currentOption.type === 'letter' ? 'a' : '1';
            let subBKey = state.currentOption.code === '4' ? '23' : state.currentOption.type === 'letter' ? 'b': '2';
            let subCKey = state.currentOption.code === '4' ? '31' : state.currentOption.type === 'letter' ? 'c' : '3';
            chartInfo.date.forEach(date=>{
                chartInfo.energy.push( current[date] ? current[date][key] : null);
                chartInfo.energyA.push( current[date] ? current[date][state.currentOption.key + subAKey] : null );
                chartInfo.energyB.push( current[date] ? current[date][state.currentOption.key + subBKey] : null );
                chartInfo.energyC.push( current[date] ? current[date][state.currentOption.key + subCKey] : null );
            });
            return { ...state, chartInfo };
        },
        getDemandResult(state, { payload:{ data }}){
            return { ...state, demandInfo:data };
        },
        setCurrentOption(state, { payload }){
            return { ...state, currentOption:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


