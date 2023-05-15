
import { 
    getIndexInfo, getSankeyChart, getFillTypeChart, getEnergyQuotaInfo
} from '../services/efficiencyService';
import { getTotalCost } from '../services/energyService';
import moment from 'moment';

const initialState = {
    infoList:[{ key:2, color:'#7a7ab3', text:'万元产值比', unit:'元/万元' }, { key:1, color:'#6dcffb', text:'人均能耗', unit:'人' }, { key:4, color:'#ffb863', text:'面积能耗', unit:'m³' }, { key:5, color:'#af2aff', text:'产量能耗', unit:'台' }],
    typeId:1,
    isLoading:true,
    chartLoading:true,
    chartInfo:{},
    stackBarData:[],
    fillChart:{},
    // 能耗定额
    energyQuota:{},
    currentDate:moment(new Date()),
    // 1月, 2年, 默认只查看本月定额概况
    timeType:2,
};

export default {
    namespace:'efficiency',
    state:initialState,
    effects:{
        *initEfficiency(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchIndexInfo'});
            yield put({ type:'fetchSankeyChart'});
            yield put({ type:'fetchTotalCost'});
        },
        *fetchIndexInfo(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentField, currentEnergy }} = yield select();
            if ( currentField.fieldId ) {
                let data = yield call(getIndexInfo, { companyId:userInfo.companyId, fieldId:currentField.fieldId, energyType:currentEnergy })
                if ( data && data.code === 200 ){
                    yield put({ type:'getIndexInfoResult', payload:{ data:data.data }});
                }
            }
        },
        *fetchSankeyChart(action, { call, put, select }){
            try {
                let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }, efficiency:{ chartInfo } } = yield select();
                let { resolve, reject, clickNode } = action.payload || {};
                let finalAttr = clickNode || currentAttr;
                // console.log(clickNode);
                if ( !clickNode ) {
                    yield put({ type:'toggleChartLoading', payload:true });
                }
                if ( currentAttr.key ){
                    let data = yield call(getSankeyChart, { companyId:userInfo.companyId, attrId:finalAttr.key, energyType:currentEnergy, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === 200 ){
                        if ( data.data.children && data.data.children.length && data.data.cost ) {
                            yield put({ type:'getChart', payload:{ data:data.data, parentChart:chartInfo, clickNode }});
                        } else {
                            if ( clickNode ){
                                if ( resolve ) resolve('没有下一级节点');
                            } else {
                                yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                            }
                        }
                    } else {
                        yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                        if ( reject ) reject(data.message);
                    }
                } else {
                    yield put({ type:'toggleChartLoading', payload:false });
                }        
            } catch(err){
                console.log(err);
            }
        },
        *fetchTotalCost(action, { all, put, select, call }){
            let { user:{ userInfo }, fields:{ allFields }} = yield select();
            let data = yield all([
                ...allFields.map(item=>{
                    return call(getTotalCost, { companyId:userInfo.companyId, energyType:item.energyType, timeType:1, requestId:item.energyType })
                })
            ]);
            if ( data[0] && data[0].code === 200 ){
                let result = data.map((item, index)=>{
                    return item.data[allFields[index].energyType] || {};
                });
                yield put({ type:'getTotalCostResult', payload:{ data:result } });
            }
        },
        *initFillChart(action, { put }){
            let { typeId } = action.payload || {};
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'setTypeId', payload:typeId });
            yield put({ type:'fetchFillChart'});
        },
        *fetchFillChart(action, { put, select, call }){
            let { user:{ userInfo, timeType, startDate, endDate }, fields:{ currentAttr, currentEnergy }, efficiency:{ typeId }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleChartLoading', payload:true });
                let data = yield call(getFillTypeChart, { companyId:userInfo.companyId, attrId:currentAttr.key, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD'), energyType:currentEnergy, typeId });
                if ( data && data.code === 200 ){
                    yield put({ type:'getFillChartResult', payload:{ data:data.data }});
                } else {
                    yield put({ type:'getFillChartResult', payload:{ data:{} }})
                }
            }
        },
        *initEnergyQuota(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchEnergyQuota'});
        },
        *fetchEnergyQuota(action, { call, put, select }){
            let { user:{ userInfo }, fields:{ currentAttr, currentEnergy }, efficiency:{ timeType, currentDate }} = yield select();
            if ( currentAttr.key ) {
                let dateArr = currentDate.format('YYYY-MM-DD').split('-');
                let data = yield call(getEnergyQuotaInfo, { companyId:userInfo.companyId, timeType, year:dateArr[0], attrId:currentAttr.key, energyType:currentEnergy })
                if ( data && data.code === 200 ){
                    yield put({ type:'getEnergyQuotaResult', payload:{ data:data.data }});
                } 
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state, { payload }){
            return { ...state, chartLoading:payload };
        },
        getIndexInfoResult(state, { payload:{ data }}){
            let arr = state.infoList.map(item=>{
                return { ...item, ...data[item.key] }
            });
            return { ...state, infoList:arr };
        },
        getChart(state, { payload: { data, parentChart, clickNode }}){
            let temp = data;
            if ( clickNode ){
                addNewNode(parentChart, clickNode, data);
                temp = { ...parentChart };        
            }
            return { ...state, chartInfo:temp, chartLoading:false };
        },
        getTotalCostResult(state, { payload:{ data }}){
            return { ...state, stackBarData:data };
        },
        getEnergyQuotaResult(state, { payload:{ data }}){
            return { ...state, energyQuota:data };
        },
        setCurrentDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        setTimeType(state, { payload }){
            return { ...state, timeType:payload };
        },
        getFillChartResult(state, { payload:{ data }}){
            return { ...state, fillChart:data, chartLoading:false };
        },
        setTypeId(state, { payload }){
            return { ...state, typeId:payload };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


function addNewNode(node, checkNode, newNode, deep = 0){
    let isExist = { value:false };
    checkIsExist(node, checkNode, isExist);
    // console.log(node.attr_name + ':' + isExist.value);
    if ( deep !== 0 && isExist.value ) {
        // 点击节点的所有祖先节点都保留children
        if ( deep === checkNode.depth ){
            node.children = newNode.children;
            return ;
        } 
    } else {
        // 点击节点祖先节点以外的其他节点都清空children
        if ( deep !== 0 ){
            node.children = null;
        }
    } 
    if ( node.children && node.children.length ){
        node.children.forEach((item)=>{
            let temp = deep;
            ++temp;
            addNewNode(item, checkNode, newNode, temp);
        })
        
    }
}

function checkIsExist(tree, checkNode, isExist){
    if ( tree.attrId === checkNode.attrId ) {
        isExist.value = true;
        return ;
    }
    if ( tree.children && tree.children.length ){
        tree.children.map(item=>{
            checkIsExist(item, checkNode, isExist);
        })
    }
}


