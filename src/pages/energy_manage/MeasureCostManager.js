import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined, RightCircleOutlined } from '@ant-design/icons';
import MeasureBarChart from './components/MeasureBarChart';
import style from '@/pages/IndexPage.css';

const { TabPane } = Tabs;

function MeasureCostManager({ data, currentAttr, timeType, theme }) {    
    return ( 
        <div style={{ height:'100%' }}>      
            <div style={{ height:'20%', paddingBottom:'1rem' }}>
                {
                    data.timeTypeCostList && data.timeTypeCostList.length 
                    ?
                    data.timeTypeCostList.map((item,index)=>(
                        <div key={index} className={style['card-container-wrapper']} style={{ width:100/data.timeTypeCostList.length + '%', paddingBottom:'0', paddingRight:index === data.timeTypeCostList.length - 1 ? '0' : '1rem' }}>
                            <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 1rem' }}>
                                <div style={{ display:'flex', justifyContent:'space-between' }}>
                                        <div style={{ fontSize:'1.2rem' }}>{ item.timeTypeName }</div>
                                        <div className={style['sub-text']}>电价：{ item.feeRate } 元</div>
                                </div>
                                <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 0' }}>
                                    <div>
                                        <div className={style['sub-text']}>电费(元)</div>
                                        <div className={style['data']}>{ item.cost || '--' }</div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>电费占比(%)</div>
                                        <div className={style['data']}>{ item.electricityPercentage || '--' }</div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>用电量(kwh)</div>
                                        <div className={style['data']}>{ item.electricitySum || '--' }</div>
                                    </div>
                                </div>
                            </div>
                        </div>       
                    ))
                    :
                    null
                }        
            </div>
            <div style={{ height:'80%' }}>
                <div className={style['card-container']}>
                    <MeasureBarChart data={data.electricityByTimeList || []} currentAttr={currentAttr} timeType={timeType} theme={theme} />
                </div>
            </div>

        </div>     
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(MeasureCostManager, areEqual);
