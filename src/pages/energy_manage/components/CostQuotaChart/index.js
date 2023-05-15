import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Radio, Card, Progress, Button, Spin, message } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined } from '@ant-design/icons';
import style from './CostQuota.css';
import IndexStyle from '@/pages/IndexPage.css';
import icons from '../../../../../public/energy-icons.png';

const energyIcons = {
    'ele':0,
    'water':2,
    'gas':1,
    'combust':1,
    'hot':3
};

function ProgressItem({ data, showType, energyInfo, index, forReport }){
    const { cost, quotaCost, quotaCostBeyond, sumUsage, quotaUsage, quotaUsageBeyond  } = data || {};
    let quota = showType === 'cost' ? quotaCost : quotaUsage;
    let value = showType === 'cost' ? cost : sumUsage;
    let overValue = showType === 'cost' ? quotaCostBeyond : quotaUsageBeyond;
    return (
        <div className={style['process-item']} style={{ width:forReport ? '100%' : '50%' }}>
            <div className={style['icon-container']} style={{ 
                width:'30px',
                height:'30px',
                backgroundImage:`url(${icons})`, 
                backgroundPosition:`-${energyIcons[energyInfo.typeCode] * 30}px 0` 
            }}></div>
            <div className={style['info-container']}>
                <div>
                    <span>{`${ index === 0 ? '月' : '年' }用${energyInfo.typeName || ''}${showType === 'cost' ? '成本':'能耗'}定额:`}</span>
                    { 
                        quota 
                        ?
                        <>
                            <span style={{ marginLeft:'1rem', color:'#1890ff' }}>{ quota }</span>
                            <span>{ showType === 'cost' ? '元' : energyInfo.unit }</span>
                        </>
                        :
                        <span style={{ marginLeft:'1rem' }}><Link to={`/energy/info_manage/quota_manage`}>未设置定额</Link></span>
                    }
                </div>
                <div className={style['progress-container']}>
                    <div className={style['progress-item']} style={{
                        width: quota ? value/quota >1  ? '100%' : Math.floor(value/quota*100) + '%' : 0,
                    }}></div>                   
                </div>   
                <div style={{ display:'flex', justifyContent:'space-between'}}>
                    <div>已使用:<span className={style['text']}>{ value }</span>{ showType==='cost' ? '元' : energyInfo.unit }</div>
                    <div>超出:<span className={style['text']}>{ overValue }</span>{ showType==='cost' ? '元' : energyInfo.unit }</div>
                </div>
            </div>
        </div>
    )
}

function EnergyQuotaChart({ data, showType, energyInfo, forReport }) {
    const { localMonthQuotaInfo, localYearQuotaInfo } = data;
    const quotaList = [localMonthQuotaInfo, localYearQuotaInfo];
    return (   
            <div className={IndexStyle['card-container']} style={ forReport ? { boxShadow:'none' } : {}}>
                <div className={IndexStyle['card-title']}>成本定额执行概况</div>
                <div className={IndexStyle['card-content']} >                 
                    <div className={style['process-container']}>
                        {
                            quotaList.map((item, index)=>(
                                <ProgressItem key={index} data={item} showType={showType} energyInfo={energyInfo} index={index} forReport={forReport} />
                            ))
                        }
                    </div>              
                </div>
            </div>
       
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EnergyQuotaChart, areEqual);
