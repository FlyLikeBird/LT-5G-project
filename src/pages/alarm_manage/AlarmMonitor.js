import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, DatePicker, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, AlertFilled, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, EnvironmentFilled } from '@ant-design/icons';
import SceneBg from '../../../public/scene.png';
import AlarmSumBarChart from './components/AlarmSumBarChart';
import AttrRankChart from './components/AttrRankChart';
import InfoItem from './components/InfoItem';
import style from '@/pages/IndexPage.css';


const energyIcons = {
    '0':<PayCircleOutlined />,
    '1':<ThunderboltOutlined />,
    '2':<ExperimentOutlined />
};

const warningColors = {
    'total':'#ff7862',
    'ele':'#1778d3',
    'limit':'#29ccf4',
    'link':'#58e29f'
};
const dotStyle = {
    width:'8px',
    height:'8px',
    display:'inline-block',
    borderRadius:'50%',
    position:'absolute',
    top:'0',
    left:'-14px',
    transform:'translateY(50%)'
}
function AlarmMonitor({ dispatch, user, alarm }){ 
    const { authorized, theme } = user;
    const { chartInfo, attrAlarmInfo } = alarm;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'user/toggleTimeType', payload:'1' });
            dispatch({ type:'alarm/fetchAlarmIndex'});
            dispatch({ type:'alarm/fetchAttrAlarmList'});
        }
    },[authorized])
    
    return (
        <div className={style['page-container']}>
            <div style={{ height:'60%'}}>
                <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                    <div className={style['card-container']}>
                        <div style={{ height:'100%', backgroundImage:`url(${SceneBg})`, backgroundRepeat:'no-repeat', backgroundSize:'cover' }}>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                    {
                        attrAlarmInfo.infoList && attrAlarmInfo.infoList.length 
                        ?
                        attrAlarmInfo.infoList.map((item,index)=>(
                            <InfoItem 
                                key={item.type} 
                                data={item} 
                                theme={theme}
                                warningColors={warningColors}
                                onDispatch={action=>dispatch(action)} 
                            />
                        ))
                        :
                        <div className={style['card-container']}><Spin size='large' className={style['spin']} /></div>
                    }
                </div>
            </div>
            <div style={{ height:'40%'}}>
                <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>                       
                        <AlarmSumBarChart data={chartInfo} onDispatch={action=>dispatch(action)} warningColors={warningColors} theme={theme} />                       
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        
                        <AttrRankChart data={attrAlarmInfo.attrList || []} warningColors={warningColors} theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    )
        
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmMonitor);
