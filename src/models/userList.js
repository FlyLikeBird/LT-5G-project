import { 
    uploadImg, getImgs,
    getCompanys, addCompany, updateCompany, delCompany,
    getRoleList, addRole, updateRole, delRole,
    getMenuList, addMenu, updateMenu, delMenu,
    getUserList, addUser, updateUser, delUser,
    updatePwd,
    getRolePermission, setRolePermission,
    getLogList
} from '../services/userListService';

const initialState = {
    // 角色权限相关状态
    roleList:[],
    currentRole:{},
    selectedKeys:[],
    currentPage:1,
    total:0,
    isLoading:false,
    // 公司管理状态
    companyList:[],
    currentCompany:{},
    checkedRowKeys:[],
    // 角色菜单权限状态，定义用户菜单权限
    menuList:[],
    openMenus:[],
    currentMenu:{},
    // 用户管理状态
    adminList:[],
    //系统日志状态
    logList:[]
}

export default {
    namespace:'userList',
    state:initialState,
    effects:{
        *initRoleList(action, { put }){
            yield put({ type:'fetchRoleList'});
            yield put({ type:'fetchCompanys'});
            yield put({ type:'fetchMenuList'});
        },
        *fetchRoleList(action, { call, put }){
            let data = yield call(getRoleList);
            if ( data && data.code === 200 ){
                yield put({type:'getRoleListResult', payload:{data:data.data }});
            }
        },
        *addRoleAsync(action, { call, put, select }){
            let { values, resolve, reject, forEdit } = action.payload;
            let params = { roleName:values.roleName, orderBy:values.orderBy };
            if ( forEdit ) {
                params.roleId = values.roleId;
            }
            let data = yield call( forEdit ? updateRole : addRole, params);
            if ( data && data.code === 200 ) {
                if ( resolve ) resolve();
                yield put({ type:'fetchRoleList'});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delRoleAsync(action, { call, put, select }){
            let { resolve, reject, roleId } = action.payload ;
            let data = yield call(delRole, { roleId });
            if ( data && data.code === 200 ) {
                if ( resolve ) resolve();
                yield put({ type:'fetchRoleList'});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchRolePermission(action, { select, call, put}){
            try {
                let { user:{ userInfo }} = yield select();
                let { roleId } = action.payload || {};
                let data  = yield call(getRolePermission, { companyId:userInfo.companyId, roleId });
                if ( data && data.code === 200 ){
                    yield put({ type:'getPermissionResult', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setRolePermissionAsync(action, { select, call, put}){
            try {
                let { user:{ userInfo }, userList:{ selectedKeys }} = yield select();
                let { resolve, reject, roleId } = action.payload || {};
                let data = yield call(setRolePermission, { payload:{ companyId:userInfo.companyId, roleId, menuIds:selectedKeys }});
                if ( data && data.code === 200 ){
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *initUserList(action, { call, put }){
            yield put({ type:'fetchRoleList'});
            yield put({ type:'fetchCompanys'});
            yield put({ type:'fetchUserList'});
        },
        *fetchUserList(action, { call, put, select}){  
            let { currentPage } = action.payload || {};  
            currentPage = currentPage || 1;          
            let data = yield call(getUserList, { page:currentPage, pageSize:14 });
            if ( data && data.code === 200 ){
                yield put({type:'getUserListResult', payload:{ data:data.data, total:data.total, currentPage }});
            }    
        },
        *addUserAsync(action, { call, put, select }){
            let { user:{ userInfo }, userList:{ currentPage }} = yield select();
            let { values, resolve, reject, forEdit } = action.payload;
            values.companyId = userInfo.companyId;
            let data  = yield call( forEdit ? updateUser : addUser, values);
            if ( data && data.code === 200 ){
                yield put({type:'fetchUserList', payload:{ currentPage }});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delUserAsync(action, { call, put, all, select }){
            let { userList:{ checkedRowKeys, currentPage }} = yield select();
            let { userId, resolve, reject, isPatch } = action.payload;
            let data = yield call(delUser, { payload: isPatch ? checkedRowKeys : [userId] });
            if ( data && data.code === 200 ){
                resolve();
                yield put({ type:'fetchUserList', payload:{ currentPage }});
                yield put({ type:'setCheckedRowKeys', payload:[] });
            } else {
                reject(data.message);
            }
        },
        *updatePwdAsync(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let { values, resolve, reject } = action.payload; 
            let data = yield call(updatePwd, { userId:userInfo.userId, userName:userInfo.userName, oldPassword:values.oldPassword, newPassword:values.newPassword });
            if ( data && data.code === 200 ) {
                if ( resolve && typeof resolve === 'function') resolve();
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *fetchCompanys(action, { call, put, select, all }){
            let { company_name, currentPage } = action.payload || {};
            currentPage = currentPage || 1;
            let params = { page:currentPage, pageSize:14 };
            if ( company_name ) {
                params.companyName = company_name;
            }
            // let str = 'http://192.168.20.35:9904/admin/api/v1/admin/upload/getFileByPath?filePath=upload/logo/1666946813640avatar-bg.png'
            let data = yield call(getCompanys, params);
            // 获取到公司列表再遍历获取图片资源地址
            if ( data && data.code === 200 ) {
                data.data = data.data.map((item,index)=>{
                    if ( item.logoPath && item.logoPath.includes('upload')) {
                        item.logoPath = 'http://10.125.184.123:9904/admin/api/v1/admin/upload/getFileByPath?filePath=' + item.logoPath;
                    } else {
                        item.logoPath = '';
                    }
                    return item;
                });
                // console.log(arr);
                yield put({ type:'getCompanysResult', payload:{ data:data.data, currentPage, total:data.total }});
            } 
        },
        *addCompanyAsync(action, { call, put, all, select }){
            let { values, forEdit, resolve, reject } = action.payload || {};
            let { fileList, companyId, companyName, province, city, area, linkPhone, companyAddress, lng, lat } = values;
            let params = { companyName, province, city, area, linkPhone, companyAddress, lng, lat };
            if ( forEdit ) {
                params.companyId = companyId;
            }
            if ( fileList[0].size ) {
                let imagePaths = yield all([
                    ...fileList.map(file=>call(uploadImg, { file }))
                ]);
                if ( imagePaths && imagePaths.length ) {
                    imagePaths = imagePaths.map(i=>i.data[0]);
                    params.logoPath = imagePaths[0].logoPath;
                }
            } else {
                params.logoPath = fileList[0].url;
            }
            let data = yield call( forEdit ? updateCompany : addCompany, params);
            if ( data && data.code === 200 ){
                if ( resolve ) resolve();
                yield put({ type:'fetchCompanys'});
            } else {
                if ( reject ) reject(data.message);
            }             
        },
        *delCompanyAsync(action, { call, put, all, select }){
            let { userList:{ checkedRowKeys }} = yield select();
            let { companyId, resolve, reject, isPatch } = action.payload;
            let data = yield call(delCompany, { payload: isPatch ? checkedRowKeys : [companyId] });
            if ( data && data.code === 200){
                resolve();
                yield put({ type:'fetchCompanys'});
                yield put({ type:'setCheckedRowKeys', payload:[] });
            } else {
                reject(data.message);
            }
        },
        *fetchMenuList(action, { call, put, select }){
            let data = yield call(getMenuList);
            if ( data && data.code === 200) {
                yield put({ type:'getMenuListResult', payload:{ data:data.data }});
            } else {
                yield put({ type:'user/loginOut'});
            }
        },
        *addMenuAsync(action, { call, put, select }){
            let { values, forEdit, resolve, reject } = action.payload;
            let data = yield call( forEdit ? updateMenu : addMenu, values);
            if ( data && data.code === 200 ){
                if ( resolve ) resolve();
                yield put({ type:'fetchMenuList'});
            } else {
                if ( reject ) reject(data.message);
            }
        },
        *delMenuAsync(action, { call, put, select }){
            let { menuId, resolve, reject } = action.payload ;
            let data = yield call(delMenu, { payload: [menuId] });
            if ( data && data.code === 200 ) {
                resolve();
                yield put({ type:'fetchMenuList'});
                yield put({ type:'setCurrentMenu', payload:{}});            
            } else {
                reject(data.message);
            }
        },
        *fetchLogList(action, { call, put, select }){
            let { user:{ userInfo }} = yield select();
            let { currentPage, value  } = action.payload || {};
            currentPage = currentPage || 1;
            yield put({ type:'toggleLoading'});
            let data = yield call(getLogList, { companyId:userInfo.companyId, page:currentPage, pageSize:12, operateUserName:value });
            if ( data && data.code === 200 ){
                yield put({ type:'getLogListResult', payload:{ data:data.data, currentPage, total:data.total }});
            }
        }
    },
    reducers:{
        toggleLoading(state, { payload }){
            return { ...initialState, roleList:state.roleList, isLoading:true }
        },
        toggleTreeLoading(state){
            return { ...state, treeLoading:true };
        },
        getUserListResult(state, { payload:{ data, total, currentPage }}){
            // //  排除登录的自身账号，只显示下级有管理权限的企业用户列表
            // let list = data.users.filter(user=>user.user_id != localStorage.getItem('user_id'));
            // data = data.filter(i=>i.userId == localStorage.getItem('user_id'));
            return { ...state, adminList:data || [], total, currentPage } ;
        },
        getRoleListResult(state, { payload:{ data }}){
            return { ...state, roleList:data };
        },
        getPermissionResult(state, { payload:{ data}}){
            data = data.map(i=>i.menuId);
            return { ...state, selectedKeys:data };
        },
        setSelectedKeys(state, { payload:{ selectedKeys }}){
            return { ...state, selectedKeys };
        },
        getCompanysResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, companyList:data, currentCompany:data[0] || {}, currentPage, total, isLoading:false };
        },
        setCheckedRowKeys(state, { payload }){
            return { ...state, checkedRowKeys:payload };
        },
        getMenuListResult(state, { payload:{ data }}){
            let { menuList, openMenus } = formatTreeData(data);
            return { ...state, menuList, openMenus };
        },
        getLogListResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, logList:data, currentPage, total, isLoading:false };
        },
        setCurrentMenu(state, { payload }){
            return { ...state, currentMenu:payload };
        },
        resetRoleManager(state){
            return { ...state, roleList:[], currentRole:{}, selectedKeys:[] };
        },
        resetAdminManager(state){
            return { ...initialState, roleList:state.roleList, currentRole:state.currentRole, selectedKeys:state.selectedKeys };
        }
    }
}

function formatTreeData(data){
    let menuList = [], openMenus = [] ;
    menuList = data.map(menu=>{
        menu.title = menu.menuName;
        menu.key = menu.menuId; 
        menu.value = menu.menuId;
        openMenus.push(menu.menuId);
        if ( menu.subMenu && menu.subMenu.length ) {
            menu.children = menu.subMenu.map(sub=>{
                sub.title = sub.menuName;
                sub.key = sub.menuId;
                sub.value = sub.menuId;
                return sub;
            }).sort((a,b)=>a.orderBy - b.orderBy)
        } else {
            menu.children = [];
        }
        return menu
    }).sort((a,b)=>a.orderBy - b.orderBy)
    return { menuList, openMenus };
}