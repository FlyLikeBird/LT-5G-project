import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox, Radio, Tooltip, Spin } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined  } from '@ant-design/icons';
// import IndexTemplate1 from './index-template-1';
import IndexTemplate2 from './index-template-2';

let timer = null;
function GlobalMonitor({ dispatch, monitor, user }){
    const [template, toggleTemplate] = useState('2');
    // useEffect(()=>{       
    //     return ()=>{
    //         clearInterval(timer);
    //         timer = null;
    //     }
    // },[]);
    // useEffect(()=>{
    //     if ( authorized ){
    //         dispatch({ type:'monitor/init'});
    //         timer = setInterval(()=>{
    //             dispatch({ type:'monitor/init' });
    //         }, 3 * 60 * 1000 )
    //     }
    // },[authorized])
    return (       
        <div style={{ height:'100%', position:'relative', overflow:'hidden' }}>
            {/* 切换模板 */}
            {/* {
                Object.keys(monitorInfo).length 
                ?
                <div style={{ position:'absolute', zIndex:'2', left:'1rem', top:'6px'}}>
                    <Radio.Group size='small' value={template} onChange={e=>{
                        toggleTemplate(e.target.value);
                    }}>
                        <Radio.Button value='1'>模板1</Radio.Button>
                        <Radio.Button value='2'>模板2</Radio.Button>
                    </Radio.Group>
                </div>
                :
                null
            } */}
            <IndexTemplate2 />
            {/* {
                template === '1' 
                ?
                <IndexTemplate1 monitor={monitor} dispatch={dispatch} />
                :
                template === '2' 
                ?
                <IndexTemplate2 monitor={monitor} />
                :
                null
            }             */}
        </div>   
    )
};


// GlobalMonitor.propTypes = {

// };

export default GlobalMonitor;

