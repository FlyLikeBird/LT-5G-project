import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Tag, Input, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, EditOutlined  } from '@ant-design/icons';
import BaseCostChart from './components/BaseCostChart';
import style from '@/pages/IndexPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function BaseCostManager({ data, currentAttr, theme }) {
    const [editing, setEditing] = useState(false);
    const { localCalcType, localMaxDemand, localDemandPrice, localDemandAmount, localMonthTotalKva, localMonthKvaPrice, localKvaAmount } = data ;
    return ( 
       
        <div style={{ height:'100%' }}>
            <div  style={{ height:'24%', paddingBottom:'1rem' }}>
                <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>按容量计算</span>
                            { localCalcType === 2 ? <Tag color='blue'>现在</Tag> : null }
                            {
                                localDemandAmount > localKvaAmount
                                ?
                                <Tag color='green'>建议</Tag>
                                :
                                null
                            }
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', margin:'10px 0', textAlign:'center' }}>
                            <div>
                                <div className={style['sub-text']}>变压器容量(KVA)</div>
                                <div className={style['data']}>{ localMonthTotalKva || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>单价(元/KVA)</div>
                                <div className={style['data']}>{ localMonthKvaPrice || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>基本电费(元)</div>
                                <div className={style['data']}>{ localKvaAmount || '--' }</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>按需量计算</span>
                            { localCalcType === 1 ? <Tag color='blue'>现在</Tag> : null }
                            {
                                localDemandAmount < localDemandAmount
                                ?
                                <Tag color='green'>建议</Tag>
                                :
                                null
                            }
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', textAlign:'center', margin:'10px 0'}}>
                            <div>
                                <div className={style['sub-text']}>本月最大需量(kw)</div>
                                <div className={style['data']}>{ localMaxDemand || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>单价(元/KW)</div>
                                <div className={style['data']}>{ localDemandPrice || '--' } </div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>基本电费(元)</div>
                                <div className={style['data']}>{ localDemandAmount || '--' }</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height:'76%' }}>
                <div className={style['card-container']}>
                    <BaseCostChart data={data.baseCostMonthList || []} currentAttr={currentAttr} theme={theme} />
                </div>
            </div>
        </div>
      
    )
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(BaseCostManager, areEqual);
