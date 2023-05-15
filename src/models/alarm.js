
import { 
    getAlarmIndex, getAttrAlarmList,
    getAlarmList, getActionList, addAction, excuteAlarm, getAlarmHistory, uploadImg,
    getRuleList, getRuleTypes, getRuleDetail, addRule, delRule
} from '../services/alarmService';
import moment from 'moment';

const initialState = {
    // 告警首页状态
    chartInfo:{},
    attrAlarmInfo:{},
    // 1：电气安全；2：越限；3：通讯
    isLoading:true,
    cateCode:1,
    currentPage:1,
    total:0,
    alarmList:[],
    actionTypes:[],
    alarmHistory:[],
    // 告警规则状态
    ruleList:[],
    ruleTypes:[],
    ruleDetail:{}  
};

export default {
    namespace:'alarm',
    state:initialState,
    effects:{
        *fetchAlarmIndex(action, { call, select, put }){
            let { user:{ userInfo, startDate, endDate }} = yield select();
            let { timeType, resolve, reject } = action.payload || {};
            timeType = timeType || 2;
            let data = yield call(getAlarmIndex, { companyId:userInfo.companyId, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')  });
            if ( data && data.code === 200 ){
                yield put({ type:'getAlarmIndexResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchAttrAlarmList(action, { call, put, select }){
            let { user:{ userInfo, timeType, startDate, endDate }} = yield select();
            let { resolve, reject } = action.payload || {};
            yield put({ type:'toggleLoading'});
            let data = yield call(getAttrAlarmList, { companyId:userInfo.companyId, timeType, beginDate:startDate.format('YYYY-MM-DD'), endDate:endDate.format('YYYY-MM-DD')});
            if ( data && data.code === 200 ){
                yield put({ type:'getAttrAlarmResult', payload:{ data:data.data }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchAlarmList(action, { call, put, select }){
            let { user:{ userInfo }, alarm:{ cateCode }} = yield select();
            let { currentPage, attrName, status } = action.payload || {};
            currentPage = currentPage || 1;
            yield put({ type:'toggleLoading'});
            let params = { companyId:userInfo.companyId, cateCode, page:currentPage, pageSize:12  };
            if ( attrName ){
                params.attrName = attrName;
            }
            if ( status ){
                params.status = status;
            }
            let data = yield call(getAlarmList, params );
            if ( data && data.code === 200 ) {
                yield put({ type:'getAlarmListResult', payload:{ data:data.data, currentPage, total:data.total }});
            }     
        },
        *fetchActionTypes(action, { call, put, select }){
            let data = yield call(getActionList);
            if ( data && data.code === 200 ){
                yield put({ type:'getActionTypesResult', payload:{ data:data.data }});
            }
        },
        *fetchAlarmHistory(action, { call, put, select }){
            let { recordId } = action.payload || {};
            let data = yield call(getAlarmHistory, { recordId });
            if ( data && data.code === 200 ) {
                data.data = data.data.map((item,index)=>{
                    if ( item.photoPaths && item.photoPaths.length ) {
                        // http://192.168.20.35:9904   http://10.125.184.123:9904
                        item.photoPaths = item.photoPaths.map(i=>{
                            return 'http://10.125.184.123:9904/admin/api/v1/admin/upload/getFileByPath?filePath=' + i;
                        })
                    }
                    return item;
                });
                yield put({ type:'getAlarmHistoryResult', payload:{ data:data.data } })
            }
           
        },
        *confirmRecord(action, { call, put, select, all }){
            let { user:{ userInfo }} = yield select();
            let { values, resolve, reject, recordId, status } = action.payload || {};
            values.companyId = userInfo.companyId;
            values.actionUserId = userInfo.userId;
            values.actionUserName = userInfo.userName;
            values.actionUserPhone = userInfo.phone;
            if ( values.photos.length ) {
                // 上传图片文件至服务器获取路径再请求下一步
                let imgPaths = yield all([
                    ...values.photos.map((file, index)=>call(uploadImg, { file, requestId:index }))
                ]);
                if ( imgPaths && imgPaths.length ) {
                    imgPaths = imgPaths.map(i=>i.data.photoPath);
                    values['photoPath'] = imgPaths;
                }
            }
            let data = yield call(addAction, { payload:values });
            let data2 = yield call(excuteAlarm, { recordId, status });
            if ( data && data.code === 200 && data2.code === 200 ){
                if ( resolve ) resolve();
                yield put({ type:'fetchAlarmList'});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchRuleList(action, { call, put, select }){
            let data = yield call(getRuleList);
            if ( data && data.code === 200 ) {
                yield put({ type:'getRuleListResult', payload:{ data:data.data }});
            }
        },
        *fetchRuleTypes(action, { call, put }){
            let data = yield call(getRuleTypes);
            if ( data && data.code === 200 ){
                yield put({ type:'getRuleTypesResult', payload:{ data:data.data }});
            }
        },
        *fetchRuleDetail(action, { call, put }){
            let { ruleId } = action.payload;
            let data = yield call(getRuleDetail, { ruleId });
            if ( data && data.code === 200 ){
                yield put({ type:'getRuleDetailResult', payload:{ data:data.data }})
            }
        },
        *addRuleAsync(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let { values, resolve, reject } = action.payload || {};
            values.companyId = userInfo.companyId;
            let data = yield call(addRule, { payload:values });
            if ( data && data.code === 200 ) {
                yield put({ type:'fetchRuleList'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delRuleAsync(action, { call, put }){
            let { ruleId } = action.payload;
            let data = yield call(delRule, { ruleId });
            if ( data && data.code === 200 ){
                yield put({ type:'fetchRuleList'});
            }
        }
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getAlarmIndexResult(state, { payload:{ data }}){
            return { ...state, chartInfo:data };
        },
        getAttrAlarmResult(state, { payload:{ data }}){
            let { warningCateGroupMap, countByAttrVOList, countByAttrGroupByCateCodeMap } = data;
            let infoList = [], attrList = [];
            infoList.push({ ...warningCateGroupMap['电气安全'], type:'ele', text:'电气安全' });
            infoList.push({ ...warningCateGroupMap['指标越限'], type:'limit', text:'指标越限'});
            infoList.push({ ...warningCateGroupMap['通讯采集'], type:'link', text:'通讯异常' });
            data.infoList = infoList;
            if ( countByAttrVOList ) {
                attrList = countByAttrVOList.map(item=>{
                    item.attrTypes = countByAttrGroupByCateCodeMap[item.attrName] || {};
                    return item;
                });
            }
            data.attrList = attrList;
            return { ...state, attrAlarmInfo:data, isLoading:false };
        },
        getAlarmListResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, alarmList:data, currentPage, total, isLoading:false };
        },
        getActionTypesResult(state, { payload:{ data }}){
            return { ...state, actionTypes:data };
        },
        getAlarmHistoryResult(state, { payload:{ data }}){
            return { ...state, alarmHistory:data };
        },
        setCateCode(state, { payload }){
            return { ...state, cateCode:payload };
        },
        getRuleListResult(state, { payload:{ data }}){
            return { ...state, ruleList:data };
        },
        getRuleTypesResult(state, { payload:{ data }}){
            return { ...state, ruleTypes:data };
        },
        getRuleDetailResult(state, { payload:{ data }}){
            return { ...state, ruleDetail:data };
        },
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(state){
            return initialState;
        }
    }
}



