
import { 
    getHighVolInfo, getHighVolChart,
    getMeterTypes, getMeterList, getMeterDetail
} from '../services/eleMonitorService';
import { getIncomingList } from '../services/incomingService';
import moment from 'moment';

const buttons = [
    { title:'相电压', code:'3', unit:'V', key:'uavg', prefix:'avg', type:'num' },
    { title:'视在功率', code:'1', unit:'kw', key:'s' },
    { title:'有功功率', code:'2', unit:'kw', key:'p', prefix:'avb', type:'num'  },
    { title:'无功功率', code:'4', unit:'kvar', key:'q' },
    { title:'相电流', code:'5', unit:'A', key:'iavb', prefix:'avg', type:'num' },
];
const initialState = {
    infoList:[{ title:'进线电流'}, { title:'进线电压'}, { title:'当前负荷'}, { title:'功率因素'}],
    incomingList:[],
    currentIncoming:{},
    sourceData:{},
    chartInfo:{},
    optionList:buttons,
    currentOption:buttons[0],
    chartLoading:true,
    meterList:[],
    meterTypes:{},
    typeList:[],
    currentType:'0',
    currentPage:1,
    total:0,
    detailInfo:{},
    machLoading:true,
    isLoading:true
};

export default {
    namespace:'highVol',
    state:initialState,
    effects:{
        *initHighVol(action, { call, put }){
            yield put.resolve({ type:'fetchIncomingList'});
            yield put({ type:'fetchHighVolInfo'});
            yield put({ type:'fetchHighVolChart'});
        },
        *fetchIncomingList(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let data = yield call(getIncomingList, { companyId:userInfo.companyId });
            if ( data && data.code === 200 ){
                yield put({ type:'getIncomingResult', payload:{ data:data.data }});
            }
        },
        *fetchHighVolInfo(action, { call, put, select }){
            let { user:{ userInfo }, highVol:{ currentIncoming }} = yield select();
            let data = yield call(getHighVolInfo, { companyId:userInfo.companyId, inId:currentIncoming.inId });
            if ( data && data.code === 200 ) {
                yield put({ type:'getHighVolInfoResult', payload:{ data:data.data }});
            }
        },
        *fetchHighVolChart(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }, highVol:{ currentIncoming }} = yield select();
            if ( currentIncoming.inId ) {
                yield put({ type:'toggleChartLoading'});
                let data = yield call(getHighVolChart, { companyId:userInfo.companyId, timeType, inId:currentIncoming.inId, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')});
                if ( data && data.code === 200 ){
                    yield put({ type:'getHighVolChartResult', payload:{ data:data.data }});
                    yield put({ type:'updateChartInfo'});
                }
            }   
        },
        *initMeters(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchMeterTypes'});
            yield put({ type:'fetchMeterList'});
        },
        *fetchMeterTypes(action, { put, select, call }){
            let { user:{ userInfo }, fields:{ energyTypes }} = yield select();
            let data = yield call(getMeterTypes, { companyId:userInfo.companyId });
            if ( data && data.code === 200 ) {
                yield put({ type:'getMeterTypesResult', payload:{ data:data.data, energyTypes }});
            }
        },
        *fetchMeterList(action, { put, select, call }){
            let { user:{ userInfo, containerWidth }, highVol:{ currentType }} = yield select();
            let { currentPage } = action.payload || {};
            currentPage = currentPage || 1;
            yield put({ type:'toggleLoading'});
            let data = yield call(getMeterList, { companyId:userInfo.companyId, energyType:currentType, page:currentPage, pageSize:containerWidth <= 1440 ? 9 : 12 });
            if ( data && data.code === 200 ) {
                data.data = data.data.map((item,index)=>{
                    // http://192.168.20.35:9904   http://10.125.184.123:9904
                    item.img = 'http://10.125.184.123:9904:9904/admin/api/v1/admin/upload/getFileByPath?filePath=' + item.img;
                    return item;
                });
                yield put({ type:'getMeterListResult', payload:{ data:data.data, currentPage }});
            }
        },
        *fetchMeterDetail(action, { put, select, call }){
            let { user:{ userInfo }} = yield select();
            let { machId, currentDate, energyType } = action.payload;
            let dateStr = currentDate.format('YYYY-MM-DD');
            yield put({ type:'toggleMachLoading'});
            let data = yield call(getMeterDetail, { companyId:userInfo.companyId, machId, energyType, beginDate:dateStr, endDate:dateStr });
            if ( data && data.code === 200 ) {
                yield put({ type:'getMeterDetailResult', payload:{ data:data.data }});
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
        toggleMachLoading(state){
            return { ...state, machLoading:true };
        },
        getIncomingResult(state, { payload:{ data }}){
            return { ...state, incomingList:data, currentIncoming:data && data.length ? data[0] : {}};
        },
        setCurrentIncoming(state, { payload }){
            return { ...state, currentIncoming:payload };
        },
        getHighVolInfoResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ title:'进线电流', child:[{ title:'A相电流', value:data.i1 || '--' , unit:'A', type:'A' }, { title:'B相电流', value:data.i1 || '--' , unit:'A', type:'B' }, { title:'C相电流', value:data.i3 || '--' , unit:'A', type:'C' }]});
            infoList.push({ title:'进线电压', child:[{ title:'AB线电压', value:data.u12 || '--' , unit:'V', type:'A' }, { title:'BC线电压', value:data.u23 || '--' , unit:'V', type:'B' }, { title:'CA线电压', value:data.u31 || '--' , unit:'V', type:'C' } ]});
            infoList.push({ title:'当前负荷', child:[{ title:'有功功率', value:data.p || '--', unit:'kw'}, { title:'无功功率', value:data.q, unit:'kvar'}]});
            infoList.push({ title:'功率因素', child:[{ title:'PF', value:data.pfavg || '--', unit:'cosΦ'}]})
            return { ...state, infoList }
        },
        getHighVolChartResult(state, { payload:{ data }}){
            return { ...state, sourceData:data, chartLoading:false };
        },
        updateChartInfo(state){
            let{ energyMachRealtimeInfoNowList, energyMachRealtimeInfoLastList } = state.sourceData;
            let date = [];
            let chartInfo = { energy:[], energySame:[] };
            if ( energyMachRealtimeInfoNowList && energyMachRealtimeInfoNowList.length ) {
                date = energyMachRealtimeInfoNowList.map(i=>i.dateTime);
                energyMachRealtimeInfoNowList.forEach((item, index)=>{
                    date.push(item.dateTime);
                    chartInfo.energy.push(item[state.currentOption.key]);
                    chartInfo.energySame.push( energyMachRealtimeInfoLastList[index] ? energyMachRealtimeInfoLastList[index][state.currentOption.key] : null);
                })
            }
            chartInfo.date = date;
            return { ...state, chartInfo };
        },
        setCurrentOption(state, { payload }){
            return { ...state, currentOption:payload };
        },
        getMeterTypesResult(state, { payload:{ data, energyTypes }}){
            let arr = [];
            if ( data ) {
                Object.keys(data).forEach(key=>{
                    if ( energyTypes[key] ) {
                        arr.push({ key, count:data[key], title:key === '0' ? '全部设备' : '智能' + energyTypes[key].typeName + '表' });
                    }
                })
            }
            return { ...state, meterTypes:data, typeList:arr, total:data[state.currentType] };
        },
        getMeterListResult(state, { payload:{ data, currentPage }}){
            return { ...state, meterList:data, currentPage, isLoading:false };
        },
        setCurrentType(state, { payload }){
            return { ...state, currentType:payload, total:state.meterTypes[payload] };
        },
        getMeterDetailResult(state, { payload:{ data }}){
            let { energyMachRealtimeInfoNowList, lastDataUpTime } = data;
            let detailInfo = { lastDataUpTime, date:[], energy:[], p:[], i1:[], i2:[], i3:[], u1:[], u2:[], u3:[], pfavg:[]  };
            energyMachRealtimeInfoNowList.forEach(item=>{
                detailInfo.date.push(item.dateTime);
                detailInfo.energy.push(item.sumUsage);
                detailInfo.p.push(item.p);
                detailInfo.i1.push(item.i1);
                detailInfo.i2.push(item.i2);
                detailInfo.i3.push(item.i3);
                detailInfo.u1.push(item.u1);
                detailInfo.u2.push(item.u2);
                detailInfo.u3.push(item.u3);
                detailInfo.pfavg.push(item.pfavg);
            });
            return { ...state, detailInfo, machLoading:false };
        },
        reset(state){
            return initialState;
        }
    }
}


