import { routerRedux } from 'dva/router';
import qs from 'querystring';
import { 
    login,  
    userAuth, loginOut,
    thirdAgentAuth,
    fetchSessionUser, getNewThirdAgent, setCompanyLogo, 
    getWeather, getThirdAgentInfo, 
    getEnergyTypes,
    getAlarmTypes, uploadImg
} from '../services/userService';
import { md5, encryptBy, decryptBy } from '../utils/encryption';
import moment from 'moment';

const reg = /\/info_manage_menu\/manual_input\/([^\/]+)\/(\d+)/;
const companyReg =  /\?pid\=0\.\d+&&userId=(\d+)&&companyId=(\d+)&&mode=(\w+)/;
const agentReg = /\?agent=(.*)/;
const agentReg2 = /iot-(.*)/;

let date = new Date();
// 初始化socket对象，并且添加监听事件
function createWebSocket(url, data, companyId, fromAgent, dispatch){
    let ws = new WebSocket(url);
    // console.log(data);
    ws.onopen = function(){
        if ( data.agent_id && !fromAgent ){
            ws.send(`agent:${data.agent_id}`);
        } else {
            ws.send(`com:${companyId}`);
        }
    };
    // ws.onclose = function(){
    //     console.log('socket close...');
    //     reconnect(url, data, companyId, dispatch);
    // };
    ws.onerror = function(){
        console.log('socket error...');
        reconnect(url, data, companyId, dispatch);
    };
    ws.onmessage = (e)=>{
        if ( dispatch ) {   
            let data = JSON.parse(e.data); 
            // console.log(data);
            if ( data.type === 'company'){
                dispatch({ type:'setMsg', payload:{ data }});
            } else if ( data.type === 'agent'){
                dispatch({ type:'setAgentMsg', payload:{ data }})
            }                       
        }
    }
    return ws;
}
function reconnect(url, data, companyId, dispatch){
    if(reconnect.lock) return;
    reconnect.lock = true;
    setTimeout(()=>{
        createWebSocket(url, data, companyId, dispatch);
        reconnect.lock = false;
    },2000)
}
let socket = null;
const initialState = {
    userInfo:{},
    userMenu:[],
    companyList:[],
    currentProject:'',
    // 全局的公司id
    company_id:'',
    currentCompany:{},
    currentMenu:{},
    // 配置动态路由
    routePath:[],
    routeConfig:{},
    authorized:false,
    // 判断是子站嵌入页还是正常项目首页
    isFrame:false,
    // socket实时告警消息
    msg:{},
    agentMsg:{},
    //  当前页面的location
    currentPath:'',
    weatherInfo:'',
    // 页面总宽度
    containerWidth:0,
    collapsed:false,
    pagesize:12,
    // 判断是否是中台打开的子窗口
    fromAgent:false,
    // 其他中台商ID，根据这个ID对登录页做特殊判断
    thirdAgent:{},
    newThirdAgent:{},
    // 浅色主题light 深色主题dark 
    theme:'light',
    startDate:moment(date),
    endDate:moment(date),
    timeType:'3',
    AMap:null
};

function checkIsLTUser(){
    let str = window.location.host.split('.');
    let matchResult = agentReg2.exec(str[0]);
    return ( matchResult && matchResult[1] === 'lt' ) ? true : false;
}

export default {
    namespace:'user',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen(( location )=>{
                // 新版第三方代理商特殊处理
                // if ( location.pathname === '/login' ) {
                //     let str = window.location.host.split('.');
                //     let matchResult = agentReg2.exec(str[0]);
                //     let temp = matchResult ? matchResult[1] : '';
                //     dispatch({ type:'fetchNewThirdAgent', payload:temp });
                //     return ;
                // }
                if ( location.pathname !== '/login' ) {
                    new Promise((resolve, reject)=>{
                        dispatch( { type:'userAuth', payload: { dispatch, query:location.search, resolve }});
                    })
                    .then(()=>{
                        // 设置当前页面路由的路径
                        
                        dispatch({type:'setRoutePath', payload:location.pathname || '/' });       
                    })   
                }
            })
        }
    },
    effects:{
        *userAuth(action, { call, select, put }){ 
            let { dispatch, query, resolve, reject } = action.payload || {};
            try {
                let { user: { authorized, newThirdAgent }} = yield select();
                if ( !authorized ){
                    // 判断是否是当前用户新开的各种子站标签页
                    let defaultCompanyId = localStorage.getItem('company_id');
                    let matchResult = companyReg.exec(query);
                    let company_id = matchResult ? matchResult[2] : defaultCompanyId ? defaultCompanyId : null;
                    let user_id = matchResult ? matchResult[1] : null;
                    let isFrame = matchResult && matchResult[3] === 'frame' ? true : false;
                    if ( user_id ){
                        localStorage.setItem('user_id', user_id);
                    }
                    // 获取当前账号的菜单列表权限和当前账号
                    let code = qs.parse(query.substring(1, query.length)).code;
                    // console.log(code);
                    // 本地项目运行逻辑
                    yield put.resolve({ type:'userList/fetchMenuList'});
                    let { userList:{ menuList } } = yield select();
                  
                     yield put({type:'setUserInfo', payload:{ 
                        data:{
                            userId:localStorage.getItem('user_id'),
                            userName:localStorage.getItem('user_name'),
                            companyId:localStorage.getItem('company_id'),
                            companyName:localStorage.getItem('company_name'),
                            phone:localStorage.getItem('phone')
                        }, 
                        company_id, 
                        fromAgent:matchResult ? true : false, 
                        isFrame, menuList 
                        }});
                    
                    // if ( !code ) {
                    //     // 重定向到联通统一认证平台
                    //     window.location.href = 'http://10.125.184.123:9904/admin/sso/checkLogin';
                    //     return ;
                    // } else {
                    //     // 如果还没有过期，直接从缓存读取用户信息
                    //     if ( localStorage.getItem('token')) {
                    //         yield put({type:'setUserInfo', payload:{ 
                    //             data:{
                    //                 userId:localStorage.getItem('user_id'),
                    //                 userName:localStorage.getItem('user_name'),
                    //                 companyId:localStorage.getItem('company_id'),
                    //                 companyName:localStorage.getItem('company_name'),
                    //                 phone:localStorage.getItem('phone')
                    //             }, 
                    //             company_id, 
                    //             fromAgent:matchResult ? true : false, 
                    //             isFrame, 
                    //             menuList:localStorage.getItem('menu_list') ? JSON.parse(localStorage.getItem('menu_list')) : [] 
                    //         }}); 
                    //     } else {
                    //         // 获取登录用户信息
                    //         let data = yield call(userAuth, { code });
                    //         if ( data && data.code === 200 ) {
                    //             let { userId, userName, token, companyId, companyName, phone, menuList } = data.data;
                    //             // console.log(data.data);
                    //             localStorage.setItem('token', token);
                    //             localStorage.setItem('user_id', userId);
                    //             localStorage.setItem('user_name', userName);
                    //             localStorage.setItem('company_id', companyId);
                    //             localStorage.setItem('company_name', companyName);
                    //             localStorage.setItem('phone', phone);
                    //             localStorage.setItem('menu_list', JSON.stringify(menuList));
                    //             yield put({type:'setUserInfo', payload:{ 
                    //                 data:{
                    //                     userId,
                    //                     userName,
                    //                     companyId,
                    //                     companyName,
                    //                     phone
                    //                 }, 
                    //                 company_id, 
                    //                 fromAgent:matchResult ? true : false, 
                    //                 isFrame, menuList 
                    //             }});
                    //         }
                    //     }                        
                    // }
                    
                    // 先判断是否是第三方代理商账户
                    // if ( !Object.keys(newThirdAgent).length ) {
                    //     let str = window.location.host.split('.');
                    //     let matchResult = agentReg2.exec(str[0]);
                    //     let temp = matchResult ? matchResult[1] : '';
                    //     yield put({ type:'fetchNewThirdAgent', payload:temp });
                    // }
                    
                    yield put({ type:'setContainerWidth' });
                    // yield put({type:'weather'});
                    // websocket 相关逻辑
                    if ( !WebSocket ) {
                        window.alert('当前浏览器不支持websocket,推荐使用chrome浏览器');
                        return ;
                    }
                    let config = window.g;
                    // 开启socket实时通道
                    // let socketCompanyId = company_id ? company_id : data.data.companys.length ? data.data.companys[0].company_id : null ;
                    // socket = createWebSocket(`ws://${config.socketHost}:${config.socketPort}`, data.data, socketCompanyId, matchResult ? true : false, dispatch);                     
                } else {
                    
                }
            } catch(err){
                console.log(err);
            } finally {
                if ( resolve ) resolve();
            }
        },
        // 中台用户登录时更新当前中台账号下所有企业用户的告警信息
        *updateAgentAlarm(action, { put, call, select }){
            let { data } = yield call(userAuth);
            if ( data && data.code === '0'){
                yield put({ type:'getAgentAlarm', payload:{ data:data.data }});
            }
        },
        *login(action,{ call, put, select }){
            try {
                let { values, resolve, reject } = action.payload;
                // yield put({ type:'fields/init'});
                var data = yield call(login, {userName:values.user_name, password:values.password, isApp:1 });
                if ( data && data.code === 200 ){   
                    let { userId, userName, token, companyId, menuList, companyName, phone, agent_id } = data.data;
                    //  保存登录的时间戳,用户id,公司id 
                    localStorage.setItem('token', token);
                    localStorage.setItem('user_id', userId);
                    localStorage.setItem('user_name', userName);
                    localStorage.setItem('company_id', companyId);
                    localStorage.setItem('company_name', companyName);
                    localStorage.setItem('menu_list', JSON.stringify(menuList || []))
                    localStorage.setItem('phone', phone);
                    // 如果是服务商用户则跳转到中台监控页
                    
                    yield put(routerRedux.push('/energy'));
                    
                } else {
                    if (reject) reject( data && data.message );
                }
            } catch(err){
                console.log(err);
            }
        },
        *weather(action,{call, put}){
            let { data } = yield call(getWeather);
            if ( data && data.code === '0' ) {
                yield put({type:'getWeather', payload:{data:data.data}});
            }
        },
        // *loginOut(action, { call, put, select }){
        //     let { user:{ userInfo, thirdAgent }} = yield select();        
        //     yield put({type:'clearUserInfo'});
        //     yield put({ type:'fields/reset'});
        //     yield put(routerRedux.push('/login'));
        //     if ( socket && socket.close ){
        //         socket.close();
        //         socket = null;
        //     }
        // },
        *loginOut(action, { call, put, select }){
            let data = yield call(loginOut, { userId:localStorage.getItem('user_id')});     
            if ( data ) {
                // 重定向
                yield put({ type:'clearUserInfo' }); 
                yield put({ type:'fields/reset'});
                window.location.href = 'http://10.125.184.123:9904/admin/sso/checkLogin';
            } else {
                console.log( data ? data.message : '');
            }
        },
        *thirdAgentAuth(action, { call, put}){
            let { pathname, search } = action.payload || {};
            if ( search ){
                let match = agentReg.exec(search);
                if ( match && match.length ){
                    let param = match[1];
                    let agentId = decryptBy(param);
                    let { data } = yield call(getThirdAgentInfo, { agent_id:agentId });
                    if ( data && data.code === '0'){
                        yield put({ type:'setThirdAgentInfo', payload:{ data:data.data }});
                    }
                }
            }
        },
        *fetchNewThirdAgent(action, { put, select, call}){
            let { data } = yield call(getNewThirdAgent, { agent_code:action.payload });
            if ( data && data.code === '0'){
                yield put({ type:'getNewThirdAgent', payload:{ data:data.data }});
            } else {

            }
        },
        *upload(action, { select, call, put}){
            let { user:{ company_id }} = yield select();
            let { file, resolve, reject } = action.payload || {};
            let { data } = yield call(uploadImg, { file });
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve === 'function' ) resolve(data.data);
            } else {
                if ( reject && typeof reject === 'function' ) reject();
            }
        },
        *changeCompanyLogo(action, { put, call, select }){
            try {
                let { user:{ company_id }} = yield select();
                let { logoData, thumbLogoData, resolve, reject } = action.payload || {};
                let { data } = yield call(setCompanyLogo, { company_id, head_logo_path:logoData.filePath, mini_logo_path:thumbLogoData.filePath });
                if ( data && data.code === '0'){
                    let { user:{ currentCompany }} = yield select();
                    yield put({ type:'updateLogo', payload:{ ...currentCompany, head_logo_path:logoData.url, mini_logo_path:thumbLogoData.url }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){   
                console.log(err);
            }
        }
    },
    reducers:{
        setUserInfo(state, { payload:{ data, company_id, fromAgent, isFrame, menuList }}){
            // let { menuData, companys } = data;
            // let currentCompany = company_id ? companys.filter(i=>i.company_id == company_id)[0] : companys[0];
            let currentCompany = {};
            // menuData[0].child = [...menuData[0].child, { menu_id:999, menu_name:'测试子站', menu_code:'test_station'}];
            let routeConfig = {};
            if ( menuList && menuList.length ) {
                routeConfig = menuList.reduce((sum,menu)=>{
                    sum[menu.menuCode] = {
                        menuName:menu.menuName,
                        menuId:menu.menuId,
                        menuCode:menu.menuCode,
                        children:menu.subMenu.map(i=>i.menuId)
                    }
                    //  将菜单和子级菜单生成路由映射表
                    if (menu.subMenu && menu.subMenu.length){
                        menu.subMenu.map(sub=>{
                            sum[sub.menuCode] = {
                                menuName:sub.menuName,
                                menuId:sub.menuId,
                                menuCode:sub.menuCode,
                                parent:menu.menuId
                            }                       
                        })
                    }
                    return sum;
                },{});
            }
            
            
            return { ...state, userInfo:data, companyList:[], company_id, userMenu:menuList, currentCompany:currentCompany || {}, routeConfig, fromAgent, authorized:true, isFrame };
        },
        setRoutePath(state, { payload }){
            let routes = payload.split('/').filter(i=>i);
            let { routeConfig } = state;  
            // console.log(routeConfig);
            let currentMenu;
            // currentProject标识当前所在项目，默认进入能源管理项目;
            let currentProject = routes[0] || 'energy';
            if ( payload === '/') {
                currentMenu = routeConfig['global_monitor'];
            }
            if ( payload.includes('/energy')) {
                // 能源管理项目
                if ( payload === '/energy' || payload === '/energy/global_monitor'){
                    //  如果是首页(默认以监控页为首页)
                    currentMenu = routeConfig['global_monitor'];
                }  else if ( payload.includes('/energy/info_manage_menu/manual_input')){
                    // 如果是手工填报页多层级路由 ， 直接定位到手工填报的菜单项
                    currentMenu = routeConfig['manual_input'];
                } else { 
                    //  根据当前url获取对应的菜单项
                    currentMenu = routeConfig[routes[routes.length-1]];
                }
            } 
            routes = routes.map(route=>{
                return routeConfig[route]
            });
            // console.log(currentMenu);
            return { ...state, routePath:routes, currentPath:payload, currentMenu : currentMenu || {}, currentProject };
        },
        getAgentAlarm(state, { payload:{ data }}){
            return { ...state, userInfo:data };
        },
        getWeather(state, { payload :{data}}){
            return { ...state, weatherInfo:data }
        },
        setMsg(state, { payload : { data } }){
            // 根据count 字段判断是否需要更新告警信息
            if ( state.msg.count !== data.count ){
                return { ...state, msg:data };
            } else {
                return state;
            }
        },
        setAgentMsg(state, { payload:{ data }}){
            return { ...state, agentMsg:data.detail };
        },
        setContainerWidth(state){
            let containerWidth = window.innerWidth;
            return { ...state, containerWidth };
        },
        toggleTheme(state, { payload }) {
            return { ...state, theme:payload };
        },
        toggleTimeType(state, { payload }){
            let start, end;
            var date = new Date();
            if ( payload === '1'){
                // 切换为年维度
                start = moment(date).startOf('year');
                end = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                start = moment(date).startOf('month');
                end = moment(date).endOf('month');
            } else {
                // 切换为日维度
                start = end = moment(date);
            }
            return { ...state, timeType:payload, startDate:start,  endDate:end };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        toggleCollapsed(state){
            return { ...state, collapsed:!state.collapsed };
        },
        setThirdAgentInfo(state, { payload:{ data }}){
            return { ...state, thirdAgent:data };
        },
        getNewThirdAgent(state, { payload:{ data }}){
            return { ...state, newThirdAgent:data };
        },
        updateLogo(state, { payload }){
            return { ...state, currentCompany:payload };
        },
        setFromWindow(state, { payload:{ timeType, beginDate, endDate }}) {
            return { ...state, timeType, startDate:moment(new Date(beginDate)), endDate:moment(new Date(endDate))};
        },
        setMap(state, { payload }){
            return { ...state, AMap:payload };
        },
        getAlarmTypesResult(state, { payload:{ data }}){
            return { ...state, alarmTypes:data };
        },
        clearUserInfo(state){
            localStorage.clear();
            return initialState;
        }
    }
}

