import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Input, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, EditOutlined, CheckCircleOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import AdjustCostChart from './components/AdjustCostChart';
// import BaseCostTable from './components/BaseCostTable';
import style from '@/pages/IndexPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function AdjustCostManager({ data, currentAttr, theme }) {
    const { maxAdjustCost, monthAvgAdjustCost, accruedAdjustCost, avgFactor, unqualified, advice, adjustCostList   } = data;
    const [editing, setEditing] = useState(false);
    return (  
       
        <div style={{ height:'100%'}}>
            
            <div style={{ height:'24%', paddingBottom:'1rem' }}>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>无功罚款</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', margin:'10px 0', textAlign:'center' }}>
                            <div>
                                <div className={style['sub-text']}>年累计(元)</div>
                                <div className={style['data']}>{ accruedAdjustCost || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>最大值(元)</div>
                                <div className={style['data']}>{ maxAdjustCost || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>每月平均(元)</div>
                                <div className={style['data']}>{ monthAvgAdjustCost || '--' }</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>功率因素</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', textAlign:'center', margin:'10px 0'}}>
                            <div>
                                <div className={style['sub-text']}>功率因素考核值</div>
                                <div className={style['data']}>0.9</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>平均功率因素</div>
                                <div className={style['data']}>{ avgFactor || '--' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>低于考核值次数</div>
                                <div className={style['data']}>{ unqualified || 0 } 次</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>提示信息</span>
                        </div>
                        <div style={{ textAlign:'center', margin:'10px 0'}}>
                            
                            <span style={{ color:'#69d633', fontSize:'1.2rem', fontWeight:'bold'}}><CheckCircleOutlined style={{ marginRight:'4px'}}/>{ advice }</span> 
                           
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height:'76%' }}>
                <div className={style['card-container']}>
                    <AdjustCostChart data={adjustCostList || []} currentAttr={currentAttr} factor={avgFactor} theme={theme} />
                </div>
            </div>
            {/* <div className={style['card-container-wrapper']} style={{ height:'auto', paddingBottom:'0', paddingRight:'0', overflow:'unset' }}>
                <div className={style['card-container']}>
                    <BaseCostTable data={adjustCostInfo.detail} forAdjust={true} />
                </div>
            </div> */}
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

export default React.memo(AdjustCostManager, areEqual);
