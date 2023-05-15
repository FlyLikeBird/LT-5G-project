import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'dva';
import { AlertOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Radio, Button, Skeleton, DatePicker } from 'antd';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import TotalPieChart from './components/TotalPieChart';
import TypedPieChart from './components/TypedPieChart';
import AttrRankChart from './components/AttrRankChart';
import SumAlarmList from './components/SumAlarmList';
import style from '@/pages/IndexPage.css';
const { RangePicker } = DatePicker;
let colorsMap = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
}
const warningColors = {
    'total':'#ff7862',
    'ele':'#1778d3',
    'limit':'#29ccf4',
    'link':'#58e29f'
};
function AlarmTrend({ dispatch, user, alarm }){
    const { authorized, theme } = user;
    const { attrAlarmInfo, isLoading  } = alarm;
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'user/toggleTimeType', payload:'1' });
            dispatch({ type:'alarm/fetchAttrAlarmList'});
        }
    },[authorized])
    return (
        <div className={style['page-container']}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'alarm/fetchAttrAlarmList'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'46%', paddingBottom:'1rem' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'25%', paddingRight:'1rem', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']} style={{ color:'#fff', height:'3rem', lineHeight:'3rem', background:colorsMap['total'] }}>
                                <div><AlertOutlined />总告警数</div>
                            </div>
                            <div className={style['card-content']} style={{ height:'calc( 100% - 3rem)'}}>
                                <TotalPieChart data={attrAlarmInfo['warningCateGroupTotalMap'] || {}} theme={theme}  />
                            </div>
                        </div>
                    </div>
                    {
                        attrAlarmInfo.infoList && attrAlarmInfo.infoList.length 
                        ?
                        attrAlarmInfo.infoList.map((item,index)=>(
                            <div className={style['card-container-wrapper']} key={index} style={{ width:'25%', paddingBottom:'0' }}>
                                <div className={style['card-container']}>
                                    <div className={style['card-title']} style={{ color:'#fff', height:'3rem', lineHeight:'3rem', background:colorsMap[item.type] }}>
                                        <div><AlertOutlined />{ item.text }</div>
                                    </div>
                                    <div className={style['card-content']} style={{ height:'calc( 100% - 3rem)' }}>
                                        <TypedPieChart data={item} theme={theme} />
                                    </div>
                                </div>
                            </div>
                        ))
                        :
                        null
                    }
                </div>
                <div style={{ height:'54%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']}>告警详情</div>
                            <div className={style['card-content']}>
                                <SumAlarmList data={attrAlarmInfo.energyWarningRecordList || []}  />
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']}>属性告警排序</div>
                            <div className={style['card-content']}>
                                <AttrRankChart data={attrAlarmInfo.attrList || []} warningColors={warningColors} theme={theme} forTrend={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmTrend);