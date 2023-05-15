import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';
const labelStyle = {
    display:'inline-block',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold'
};
function InfoItem({ data, energyInfo, showType, startDate, forReport }) {
    // yoy同比 chain环比
    let { key, timeCostChain, timeCostYoy, timeTotalCost, timeTotalUsage, timeUsageChain, timeUsageYoy, carbonEmissions } = data;
    let chain = showType === 'cost' ? timeCostChain : timeUsageChain;
    let yoy = showType === 'cost' ? timeCostYoy : timeUsageYoy;
    return (     
        <div className={style['flex-container']}>
            <div className={style['flex-item']}>
                
                <span style={{...labelStyle, backgroundColor: key === 'day' ? '#af2aff' : key === 'month' ? '#6dcffb' : '#ffc177'}}>{ key === 'day' ? '日' : key === 'month' ? '月' : '年' }</span>
            </div>
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>
                    {
                        `${ key === 'day' ? '今日' : key === 'month' ? `${forReport ? startDate.month() + 1 : '本'}月` : `${forReport ? startDate.year() : '本'}年`}${energyInfo.typeName || ''}${ showType ==='cost' ? '费用' : '能耗'}(${ showType === 'cost' ? '元' : energyInfo.unit || '' })` 
                    }
                </span>
                <br/>
                <span className={style['data']} >{ showType === 'cost' ? ( timeTotalCost || 0 ) : energyInfo.energyType === 0 ? carbonEmissions : ( timeTotalUsage || 0 ) }</span>
            </div>  
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>同比</span>
                <br/>
                {
                    !yoy || yoy === '-- --'
                    ?
                    <span className={style['data']}>-- --</span>
                    :
                    <span className={`${style['data']} ${style[ yoy < 0 ? 'down' : 'up']}`}>
                        { Math.abs(yoy).toFixed(1) + '%' }
                        { yoy < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }}/> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> } 
                    </span>
                }
            </div> 
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>环比</span>
                <br/>
                {
                    !chain || chain === '-- --'
                    ?
                    <span className={style['data']}>-- --</span>
                    :
                    <span className={`${style['data']} ${style[ chain < 0 ? 'down' : 'up']}`}>
                        { Math.abs(chain).toFixed(1) + '%' }
                        { chain < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }} /> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> }                        
                    </span>
                }
            
            </div>    
                                   
        </div>         
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data != nextProps.data || prevProps.showType != nextProps.showType ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(InfoItem, areEqual);
