import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { authToken, apiToken } from '../utils/encryption';

// 第三方平台权限验证接口

export function userAuth(data={}){
    return request.get('/admin/sso/codeLogin', { data, noprefix:true }).catch(err=>console.log(err));
}

export function loginOut(data={}){
    return request.get('/admin/sso/logout', { data, noprefix:true }).catch(err=>console.log(err));
}


export function agentUserAuth(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agent/getcompanymenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getNewThirdAgent(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/login/checkthirdagent', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function fetchSessionUser(data = {}){
    let str = translateObj(data);
    return request('/login/getsessionuser', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 修改企业用户的logo
export function setCompanyLogo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/setting/setcompanylogo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 请求中台商的logo
export function getThirdAgentInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/login/getagent', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 获取摄像头accessToken接口
export function getCameraAccessToken(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/camera/getaccesstoken', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWeather(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/getweather', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function login(data = {}){
    return request.post('/admin/user/bmLogin', { data }).catch(err=>console.log(err))
}

// 通用的导出excel接口
export function createExcel(col, row){
    let token = apiToken();
    let config = window.g;
    let url = `http://${config.apiHost}/api/export/createexcel?col=${JSON.stringify(col)}&row=${JSON.stringify(row)}&token=${token}`;
    window.location.href = url;

}

// 第三方地图geoJson数据的请求接口
export function getGeoJson(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/geojson', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
