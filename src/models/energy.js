
import { getCostInfo, getLocalMonth, getTotalCost, getCostAnalysis } from '../services/energyService';
const initialState = {
    costInfo:[],
    infoList:[{ key:'day'}, { key:'month'}, { key:'year'}],
    chartLoading:true,
    //  时间维度，3/小时  2/日  1/月
    // timeType:'3',
    chartInfo:{},
    //  拟态图片信息
    sceneInfo:{},
    localMonthInfo:[],
    pieChartInfo:[],
    isLoading:true,
    costAnalysis:{},
    selectedKeys:[],
    // 遮罩层状态
    maskVisible:false,
};

export default {
    namespace:'energy',
    state:initialState,
    effects:{
        *initEnergy(action, { call, put, all }){
            yield put.resolve({ type:'fields/init', payload:{ typeCode:'total' }});
            yield all([
                put.resolve({ type:'fetchCostInfo'}),
                put.resolve({ type:'fetchLocalMonth'}),
                put.resolve({ type:'fetchTotalCost'})
            ])
            yield put({ type:'updateEnergyType' });
        },
        *updateEnergyType(action, { put, select }){
            let { fields:{ currentEnergy }} = yield select();
            yield put({ type:'updateEnergyTypeResult', payload:currentEnergy });
        },
        *fetchCostInfo(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ allFields, currentEnergy }} = yield select();
            let { resolve, reject } = action.payload || {};
            let data = yield call(getCostInfo, { companyId:userInfo.companyId, energyType:currentEnergy, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === 200 ) {
                yield put({ type:'getCostInfoResult', payload:{ data:data.data, energyList:allFields.map(i=>i.energyType )}});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchLocalMonth(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentEnergy }} = yield select();
            let { resolve, reject } = action.payload || {};
            let data = yield call(getLocalMonth, { companyId:userInfo.companyId, energyType:currentEnergy, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === 200 ){
                yield put({ type:'getLocalMonthResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchTotalCost(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate }, fields:{ currentEnergy }} = yield select();
            let { resolve, reject, timeType, forReport } = action.payload || {};
            timeType = forReport ? '2' : timeType ? timeType : '3';
            yield put({ type:'toggleChartLoading'});
            let data = yield call(getTotalCost, { companyId:userInfo.companyId, energyType:currentEnergy, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === 200 ){
                yield put({ type:'getTotalCostResult', payload:{ data:data.data, energyType:currentEnergy }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *initCostAnalysis(action, { call, put, select }){
            yield put.resolve({ type:'fields/init'});
            let { fields:{ currentAttr }} = yield select();
            let temp = [];
            if ( currentAttr.children && currentAttr.children.length ) {
                temp.push({ attrId:currentAttr.key, attrName:currentAttr.title });
                currentAttr.children.map(i=>temp.push({ attrId:i.key, attrName:i.title }));
            } else {
                temp.push({ attrId:currentAttr.key, attrName:currentAttr.title });
            }
            yield put({ type:'setSelectedKeys', payload:temp });
            yield put({ type:'fetchCostAnalysis'});
        },
        *fetchCostAnalysis(action, { call, put, select }){
            let { user:{ userInfo, startDate, endDate, timeType }, fields:{ currentEnergy }, energy:{ selectedKeys }} = yield select();
            yield put({ type:'toggleChartLoading'});
            let params = { companyId:userInfo.companyId, attrIdList:selectedKeys.map(i=>i.attrId), beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), timeType, energyType:currentEnergy };
            let data = yield call(getCostAnalysis, { payload:params });
            if ( data && data.code === 200 ) {
                yield put({ type:'getCostAnalysisResult', payload:{ data:data.data }});
            }
        },
        *initWaterCost(action, { call, select, put, all }) {
            try {
                let { type } = action.payload;
                yield put.resolve({ type:'fields/init'});
                yield put({ type:'fetchWaterCost', payload:{ type }});
            } catch(err){
                console.log(err);
            }
        },
        *fetchWaterCost(action, { call, select, put }){
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                let { type } = action.payload || {} ;
                if ( !currentAttr.key ) {
                    yield put({ type:'getWaterCost', payload:{ data:{ a:'1' } }});
                    return ;
                }
                yield put({ type:'toggleWaterLoading', payload:true });
                let { data } = yield call( type === 'water' ? getAttrWaterCost : type === 'combust' ? getAttrGasCost : getAttrWaterCost, { company_id, attr_id:currentAttr.key, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0'){
                    yield put({ type:'getWaterCost', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
    
        *fetchEleStatement(action, { call, put, select }){
            try {
                let { fields:{ currentAttr }} = yield select();
                if ( !Object.keys(currentAttr).length ){
                    yield put.resolve({ type:'fields/init'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchSceneInfo(action, { select, call, put, all }){
            try {
                let { user : { company_id }} = yield select();
                let [sceneData, rankData, saveData] = yield all([
                    call(getSceneInfo, { company_id}),
                    call(getRank, { company_id}),
                    call(getSaveSpace, { company_id })
                ]);
                let imgURL = '';
                let temp = sceneData.data.data;
                if ( temp.scene && temp.scene.bg_image_path ){
                    imgURL = yield call(fetchImg, { path:temp.scene.bg_image_path} );
                }
                if ( sceneData.data.code === '0' && rankData.data.code === '0' && saveData.data.code === '0' ){
                    sceneData.data.data.saveSpace = saveData.data.data.costInfo;
                    sceneData.data.data.rank = rankData.data.data.rank;
                    if ( imgURL ){
                        sceneData.data.data.scene.bg_image_path = imgURL;
                    }
                    yield put({type:'getScene', payload:{ data: sceneData.data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setSceneInfo(action, { select, call, put }){
            try{
                let { user : { company_id }} = yield select();
                let { file, resolve, reject } = action.payload || {};
                let { data } = yield call(uploadImg, { file });
                if ( data && data.code === '0'){
                    let imgPath = data.data.filePath;
                    let sceneData = yield call(setSceneInfo, { company_id, image_path:imgPath });
                    if ( sceneData && sceneData.data.code === '0'){
                        yield put({ type:'fetchSceneInfo'});
                        if ( resolve && typeof resolve === 'function') resolve();
                    } else {
                        if ( reject && typeof reject === 'function') reject(sceneData.data.msg);
                    }
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getCostInfoResult(state, { payload:{ data }}){
            return { ...state, costInfo:data };
        },
        getLocalMonthResult(state, { payload:{ data }}){
            return { ...state, localMonthInfo:data };
        },
        getTotalCostResult(state, { payload:{ data, energyType }}){
            let result;
            if ( data && Object.keys(data).length ) {
                result = data[energyType];
            }
            return { ...state, chartInfo:result || {}, chartLoading:false };
        },
        getCostAnalysisResult(state, { payload :{ data }}){
            return { ...state, costAnalysis:data, chartLoading:false };
        },
        updateEnergyTypeResult(state, { payload }){
            // 当切换能源类型时，
            let energyInfo = state.costInfo.filter(i=>i.energyType === payload )[0];
            let infoList = state.infoList.map(item=>{
                return { ...energyInfo[item.key], key:item.key };
            });
            let pieChartInfo = [];
            // 更新能源汇总信息
            let temp1 = state.localMonthInfo.filter(i=>i.energyType === payload)[0];
            if ( payload === 0 ) {
                // 总能源数据
                pieChartInfo = temp1.totalByEnergyType;
            } else if ( payload === 1 ) {
                // 电能源数据     
                pieChartInfo = temp1.timeTypeDataList.map(item=>({
                    ...item,
                    energyType:1,
                    name:item.timeType === 1 ? '峰' : item.timeType === 2 ? '平' : item.timeType === 3 ? '谷' : '尖'
                }));
                pieChartInfo.unshift({ name:'基本电费', energyType:1, cost:temp1.cost, sumUsage:temp1.sumUsage, totalCostPercentage:temp1.totalCostPercentage, totalSumUsagePercentage:temp1.totalSumUsagePercentage });
            } else {
                // 其他能源数据
                pieChartInfo.push(temp1);
            }            
            console.log(pieChartInfo);
            return { ...state, infoList, pieChartInfo };
        },
        setSelectedKeys(state, { payload }){
            return { ...state, selectedKeys:payload };
        },
        getWaterCost(state, { payload:{ data }}){
            let costInfo = [], chartInfo = {};
            costInfo.push({ key:'month',  ...data['month']});
            costInfo.push({ key:'year', ...data['year']});
            data['costInfo'] = costInfo;
            data['cost'] = data.value;
            data['lastValueData'] = { '0':data.lastValue,'1':[] };
            
            
            return { ...state, waterCost:data, waterLoading:false };
        },
        getScene(state, { payload : { data }}){
            return { ...state, sceneInfo:data };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        toggleTimeType(state, { payload }){
            return { ...state, timeType:payload }
        },
        reset(state){
            return initialState;
        }
    }
}


function connectPoint(tipCost, topCost, middleCost, bottomCost){
    let dataSource;
    let nextIndex = 0;
    for(var i=0,len=topCost.length ;i < len ;i++){
        // 判断当前时刻所在时间段
        ++nextIndex;
        let currentTimePeriod = tipCost[i]  ? 'tip' 
                        : topCost[i]   ? 'top' 
                        : middleCost[i]  ? 'middle'
                        : bottomCost[i]  ? 'bottom' : '';
        // 判断下一次时刻所在时间段
        let nextTimePeriod = tipCost[nextIndex]  ? 'tip' 
                        : topCost[nextIndex]  ? 'top' 
                        : middleCost[nextIndex]  ? 'middle'
                        : bottomCost[nextIndex]  ? 'bottom' : '';
        // 当处在连续时间段内则跳过此次循环
        if ( !currentTimePeriod || currentTimePeriod === nextTimePeriod ) continue;
        // 定位至断点处
        let currentData  = currentTimePeriod === 'tip' ? tipCost : currentTimePeriod === 'top' ? topCost : currentTimePeriod === 'middle' ? middleCost : currentTimePeriod === 'bottom' ? bottomCost : [];
        let nextData  = nextTimePeriod === 'tip' ? tipCost : nextTimePeriod === 'top' ? topCost : nextTimePeriod === 'middle' ? middleCost : nextTimePeriod === 'bottom' ? bottomCost : [];
        // 将两个时间段的断点连接起来，newAdd字段是为了tooltip的 formatter 控制不显示
        nextData[i] = {
            value:currentData[i],
            newAdd:true
        }

    }
}


