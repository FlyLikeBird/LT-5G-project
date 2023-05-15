import React from 'react';
import { Spin } from 'antd';
import InfoItem from '@/pages/alarm_manage/components/InfoItem';
import AlarmSumBarChart from '@/pages/alarm_manage/components/AlarmSumBarChart';
import AttrRankChart from '@/pages/alarm_manage/components/AttrRankChart';
import SumAlarmList from '@/pages/alarm_manage/components/SumAlarmList';
import TotalPieChart from '@/pages/alarm_manage/components/TotalPieChart';
import StatusPieChart from '@/pages/alarm_manage/components/StatusPieChart';

import style from '../report.css';
import IndexStyle from '@/pages/IndexPage.css';

const warningColors = {
    'total':'#ff7862',
    'ele':'#1778d3',
    'limit':'#29ccf4',
    'link':'#58e29f'
};

function PageItem2({ title, companyName, alarm }){
    let titleStr = title.split('-');
    const { chartInfo, attrAlarmInfo } = alarm;
    return (
        <div className={style['page-container']} >
            <div>
                <div className={style['page-title']}>
                    <span>{ titleStr[0] }</span>
                    <span style={{ fontSize:'0.8rem' }}>{ titleStr[1] }</span>
                </div>
            </div>
            <div style={{ position:'relative', margin:'1rem 0' }} >
                <div className={style['page-symbol']} ></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#00b0f0'}}></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#b8de95'}}></div>
            </div>
            <div>
                <ul>
                    {
                        attrAlarmInfo.infoList && attrAlarmInfo.infoList.length 
                        ?
                        attrAlarmInfo.infoList.map(item=>(
                            <li key={item.type}>
                                {`${item.text}告警` }
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {item.processed+item.notProcessed} </span> 
                                条, 已处理 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {item.processed} </span>
                                条, 未处理 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {item.notProcessed} </span>
                                条，完成率 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {item.processingRate}% </span>
                            </li>
                        ))
                        :
                        null
                    }
                </ul>
            </div>
            {/* 图表区 */}
            <div style={{ height:'360px' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%' }}>
                    {
                        attrAlarmInfo.infoList && attrAlarmInfo.infoList.length 
                        ?
                        attrAlarmInfo.infoList.map((item,index)=>(
                            <InfoItem 
                                key={item.type} 
                                data={item} 
                                warningColors={warningColors}
                                onDispatch={()=>{}} 
                            />
                        ))
                        :
                        <div className={IndexStyle['card-container']}><Spin size='large' className={IndexStyle['spin']} /></div>
                    }
                </div>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                        <AttrRankChart data={attrAlarmInfo.attrList || []} warningColors={warningColors} forReport={true} />
                    </div>
                </div>
            </div>
            <div style={{ height:'300px', paddingBottom:'1rem' }}>
                <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                    <AlarmSumBarChart data={chartInfo} warningColors={warningColors} forReport={true} />                       
                </div>
            </div>
            
            <div style={{ height:'360px' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%' }}>
                    <div className={IndexStyle['card-container']} style={{ padding:'1rem', boxShadow:'none' }}>
                        <SumAlarmList data={attrAlarmInfo.energyWarningRecordList || []}  />
                    </div>
                </div>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none', overflow:'hidden', display:'flex', flexWrap:'wrap' }}>                                                
                        <div style={{ width:'50%', height:'50%' }}>
                            <TotalPieChart data={attrAlarmInfo['warningCateGroupTotalMap'] || {}} forReport={true} />
                        </div>                     
                        {
                            attrAlarmInfo.infoList && attrAlarmInfo.infoList.length 
                            ?
                            attrAlarmInfo.infoList.map((item,index)=>(
                                    <div key={index} style={{ width:'50%', height:'50%' }}>                                     
                                        <StatusPieChart data={item} />
                                    </div>
                            ))
                            :
                            null
                        }
                    </div>
                </div>
            </div>       
            <div className={style['page-footer']}>
                <div style={{ width:'100%', height:'1px', display:'inline-block', backgroundColor:'#000'}}></div>
                <div style={{ position:'absolute', right:'0', top:'6px', backgroundColor:'#f7f7f7', paddingLeft:'10px', fontSize:'0.8rem'}}>{ companyName || '' }</div>
            </div>
        </div>
    )
}

export default PageItem2;