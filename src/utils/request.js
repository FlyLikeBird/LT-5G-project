import axios from 'axios';
import qs from 'qs';
import { history } from 'umi';
// 基本配置
// axios.defaults.baseURL = 'http://192.168.56.1:8866';
// java后台接口
// axios.defaults.baseURL = 'http://192.168.20.35:9904';
// const baseURL = 'http://10.125.184.123:9904';
const baseURL = 'http://192.168.20.32:9904';
// php后台接口

const instance = axios.create({
    xsrfCookieName:'xsrf-token',
    // timeout:1000 * 10,
    // headers:{
    //     'Content-Type':'multipart/form-data'
    // }
    // proxy:{
    //     host:'192.168.20.33',
    //     port:8880
    // }
});
// 声明一个数组用来存储每个ajax请求的取消函数和标识
let pending = [];

function removePending(id){
    for ( let i in pending ){
        if ( pending[i].u === id ) {
            // 当前请求多次请求时取消上一次请求
            pending[i].f();
            pending.splice(i, 1);
        }
    }
}
instance.interceptors.request.use(function(config){
    // 请求标识符加timeType参数 成本趋势多次请求同一个接口的场景
    let requestId = config.url + '&' + config.method ;
    removePending(requestId);
    let urlPrefix = config.url.split('/')[1];
    config.baseURL = baseURL + ( config.noprefix ? '' : urlPrefix ? '/' + urlPrefix : '' ) + ( config.noprefix ? '' : '/api/v1');
    config.cancelToken = new axios.CancelToken(function executor(c){
        pending.push({ u:requestId, f:c });
    });
    config.headers.token = localStorage.getItem('token');
   
    if (config.method === 'get') {
        // 拼接字符串携带数据
        config.params = config.data;
        if ( config.isBlob ) {
            // 接收数据流文件
            let actionPath = baseURL + (  urlPrefix ? '/' + urlPrefix : '' ) + ( config.noprefix ? '' : '/api/v1') + config.url + '?' + qs.stringify(config.data);
            window.open(actionPath, '_self');
            return ;
        }
    } else {
        // 请求体携带数据
        if ( config.data ) {
            config.transformRequest = [function(data, headers){
                let transformData = config.method === 'post' || config.method === 'put' ? data.data : data;                
                if ( data.baseURL ) {
                    config.baseURL = baseURL +  ( urlPrefix ? '/' + urlPrefix : '' ) + ( config.noprefix ? '' : '/api/v1');
                }
                if ( data.transformToJson || config.transformToJson  ) {
                    headers['Content-Type'] = 'application/json;charset=utf-8';
                    // 请求体JSON字符串
                   
                    return JSON.stringify(transformData.payload);
                } else {
                    headers['Content-Type'] = 'multipart/form-data';
                    let params = new FormData();
                    Object.keys(transformData).forEach(key=>{
                        if ( transformData[key] || (typeof transformData[key] === 'number')) {          
                            // params.append(key, encodeURI(JSON.stringify(transformData[key])));                           
                            params.append(key, transformData[key]);                           
                        }
                    })
                  
                    return params; 
                }                   
            }]
        }
    } 
    
    return config;
}, function(error){
    // console.log(error);
    return Promise.reject(error);
});

instance.interceptors.response.use(function(response){
    return response.data;
}, function(error){
    // 服务端发生错误处理逻辑
    return Promise.reject(error);
})

export default instance;

