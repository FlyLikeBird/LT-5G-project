import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Spin, Skeleton, Tooltip, DatePicker, Button, Select, message } from 'antd';
import { LeftOutlined, RightOutlined, RedoOutlined, FullscreenOutlined   } from '@ant-design/icons';
import FlowChart from './FlowChart';
import style from '@/pages/IndexPage.css';

function enterFullScreen(el){
    try {
        let func = el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullscreen || el.webkitRequestFullscreen ;
        if ( func && typeof func === 'function' ) func.call(el);
    } catch(err){
        console.log(err);
    }
}

function EfficiencyFlowManager({ data, dispatch, energyInfo, theme }){   
    const containerRef = useRef();
    return (
        <div ref={containerRef} style={{ width:'100%', height:'100%', background:'#fff', position:'relative'}}>
            {
                !data.empty 
                ?
                <FlowChart data={data} dispatch={dispatch} energyInfo={energyInfo} theme={theme} />
                :
                <div className={style['data']} style={{ color:'rgba(0, 0, 0, 0.65)', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>能流图数据源为空</div>
            }   
            {
                Object.keys(data).length 
                ?
                <div style={{ position:'absolute', right:'0.5rem', bottom:'0.5rem', cursor:'pointer' }} onClick={()=>{
                    enterFullScreen(containerRef.current);
                }}>
                    <FullscreenOutlined style={{ fontSize:'1.2rem' }} />
                </div>
                :
                null
            }
            
        </div>
    )       
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EfficiencyFlowManager, areEqual);