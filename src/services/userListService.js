import request from '../utils/request';

export function uploadImg(data={}){
    return request.post('/admin/upload/bmAgentLogoUpload', { data }).catch(err=>console.log(err));
}
// 公司管理接口
export function getCompanys(data = {}){
    return request.get('/admin/company/bmCompanyList', { data }).catch(err=>console.log(err)); 
}

export function addCompany(data = {}){
    return request.post('/admin/company/bmAddCompany', { data }).catch(err=>console.log(err)); 
}

export function updateCompany(data = {}){
    return request.put('/admin/company/bmUpdateCompany', { data }).catch(err=>console.log(err)); 
}

export function delCompany(data = {}){
    return request.delete('/admin/company/bmDeleteCompanyByIds', { data, transformToJson:true }).catch(err=>console.log(err)); 
}
export function getImgs(data={}) {
    return request.get('/admin/upload/getFileByPath', { data }).catch(err=>console.log(err)); 
}

// 角色管理接口
export function getRoleList(data = {}){
    return request.get('/admin/role/bmRoleList', { data }).catch(err=>console.log(err)); 
}

export function addRole(data = {}){
    return request.post('/admin/role/bmAddRole', { data }).catch(err=>console.log(err)); 
}

export function updateRole(data = {}){
    return request.put('/admin/role/bmUpdateRole', { data }).catch(err=>console.log(err)); 
}

export function delRole(data = {}){
    return request.delete('/admin/role/bmDeleteRoleById', { data }).catch(err=>console.log(err)); 
}
// 菜单管理接口
export function getMenuList(data = {}){
    return request.get('/admin/menu/bmMenuList', { data }).catch(err=>console.log(err)); 
}

export function addMenu(data = {}){
    return request.post('/admin/menu/bmAddMenu', { data }).catch(err=>console.log(err)); 
}

export function updateMenu(data = {}){
    return request.put('/admin/menu/bmUpdateMenu', { data }).catch(err=>console.log(err)); 
}

export function delMenu(data = {}){
    return request.delete('/admin/menu/bmDeleteMenuByIds', { data, transformToJson:true }).catch(err=>console.log(err)); 
}
// 权限管理接口
export function getRolePermission(data = {}){
    return request.get('/admin/roleMenuSetting/bmRoleMenuSettingByCondition', { data }).catch(err=>console.log(err));
}

export function setRolePermission(data={}){
    return request.post('/admin/roleMenuSetting/bmAddOrUpdateRoleMenuSetting', { data, transformToJson:true }).catch(err=>console.log(err));
}
// 用户管理接口
export function getUserList(data={}) {
    return request.get('/admin/user/bmUserList', { data }).catch(err=>console.log(err));
}

export function addUser(data={}){
    return request.post('/admin/user/bmAddUser', { data }).catch(err=>console.log(err));
}
export function updateUser(data={}){
    return request.put('/admin/user/bmUpdateUser', { data }).catch(err=>console.log(err));
}
export function delUser(data={}){
    return request.delete('/admin/user/bmDeleteUserByIds', { data, transformToJson:true  }).catch(err=>console.log(err));
}

export function updatePwd(data={}){
    return request.post('/admin/user/bmUpdateUserPassword', {data}).catch(err=>console.log(err));
}
export function getLogList(data={}){
    return request.get('/client/energyOperateLog/getOperateLog', { data }).catch(err=>console.log(err));
}





