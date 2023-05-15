import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import titleImg from '../../../../public/page-index-template/title-white.png';
import infoImg from '../../../../public/page-index-template/info-bg-white.png';
import MotionImg from '../../../../public/page-index-template/alarm_motion.png';
import MotionAlarmImg from '../../../../public/page-index-template/motion_alarm.webp';
import style from './template2.css';
import InfoContainer from './InfoContainer';
import LineChart from './LineChart';
import PieChart from './PieChart';
import EnergyProcess from './EnergyProcess';
import RotatedSymbol from './RotatedSymbol';
import ScrollTable from './ScrollTable/index';

function IndexTemplate2({ dispatch, user, fields, monitor }){
    let { authorized } = user;
    let { energyTypes } = fields;
    let { infoList, todayEle, energyQuotaList, coalInfo, alarmList } = monitor;
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'user/toggleTimeType', payload:'2' });
            dispatch({ type:'monitor/initMonitor'});
        }
    },[authorized]);
    return (
        <div className={style['container']}>
            <div className={style['title-container']} style={{ backgroundImage:`url(${titleImg})` }}><div className={style['title']}>智慧能源大屏</div></div>
            <div className={style['info-container']} style={{ backgroundImage:`url(${infoImg})` }}>
                {
                    infoList.length && Object.keys(coalInfo).length 
                    ?
                    <InfoContainer data={infoList} energyTypes={energyTypes} coal={coalInfo.coalSum} carbon={coalInfo.carbonSum}  />
                    :
                    null
                }
            </div>
            {/* 图表区 */}
            <div className={style['content-container']}>
                {/* 左侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'34%' }}>
                    <div className={style['card-container']} style={{ height:'46%'}}>
                        <div className={style['card-title']}>
                            今日用电负荷
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                Object.keys(todayEle).length
                                ?
                                <LineChart xData={todayEle.date} yData={todayEle.valueData} unit='kw' />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'54%' }}>
                        <div className={style['card-title']}>
                            本月能源对标
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                energyQuotaList.length
                                ?
                                <EnergyProcess data={energyQuotaList} />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
                {/* 中侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'32%', padding:'0 3rem', position:'relative' }}>
                    <RotatedSymbol />
                    <div style={{ position:'absolute', left:'0', width:'100%', bottom:'0', height:'160px' }}>
                        {
                            alarmList.length 
                            ?
                            <ScrollTable data={alarmList} />
                            :
                            null
                        }
                        
                    </div>
                </div>
                {/* 右侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'34%' }}>
                    <div className={style['card-container']} style={{ height:'46%'}}>
                        <div className={style['card-title']}>
                            本月碳排放趋势
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                Object.keys(coalInfo).length 
                                ?
                                <LineChart xData={coalInfo.date} yData={coalInfo.carbonData} unit='t' />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'54%' }}>
                        <div className={style['card-title']}>
                            本月标煤排放趋势
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                Object.keys(coalInfo).length 
                                ?
                                <LineChart xData={coalInfo.date} yData={coalInfo.coalData} unit='tce' />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
            </div>
       
        </div>
    )
}

export default connect(({ user, fields, monitor })=>({ user, fields, monitor }))(IndexTemplate2);