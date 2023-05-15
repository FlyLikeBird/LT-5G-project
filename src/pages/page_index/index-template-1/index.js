import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox, Radio, Tooltip, Spin } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined  } from '@ant-design/icons';
import DefaultMonitorTpl from '../components/DefaultMonitorTpl';
import FunnelChart from '../components/FunnelChart';
import RadarChart from '../components/RadarChart';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';
import SaveSpacePieChart from '../components/SaveSpacePieChart';
import ScrollTable from '../components/ScrollTable';
import style from './template1.css'
import IndexStyle from '../../IndexPage.css';
import icons from '../../../../public/icons/energy-type-white-2.png';

const energyIcons = {
    'ele':0,
    'water':2,
    'gas':1,
    'combust':1,
    'hot':3
};

const energyTypes = {
    'ele':'电',
    'water':'水',
    'hot':'热',
    'gas':'气'
};

const energyUnit = {
    'ele':'kwh',
    'water':'m³',
    'gas':'m³',
    'hot':'GJ'
}

function IndexTemplate1({ dispatch, monitor }){
    const { sceneInfo, imgURL, energyInfoList, energyList, energyInfo, tplInfo, saveSpace, monitorInfo, chartLoading, levelInfo, sceneList } = monitor;
    const [showType, toggleShowType] = useState('energy');
    const [template, toggleTemplate] = useState('1');
    
    return (       
        <div className={style['container']}>
            <div className={style['head-title']}>监控大屏</div>
            <div className={style['content-container']}>
                <div className={style['top-container']}>
                    <div className={style['left']}>          
                        {/* 能源概况 */}
                        <div style={{ height:'40%', paddingBottom:'10px' }}>
                            <div className={style['item-container']}>
                                <div className={style['title']} style={{ position:'relative' }}>
                                    <div><DashboardOutlined />能源概况</div>
                                    <Radio.Group size='small' style={{ top:'0', position:'absolute', right:'1rem', zIndex:'2' }} value={showType} onChange={e=>{
                                        toggleShowType(e.target.value);
                                    }}>
                                        <Radio.Button key='energy' value='energy'>能耗</Radio.Button>
                                        <Radio.Button key='cost' value='cost'>成本</Radio.Button>
                                    </Radio.Group>
                                </div>
                                <div className={style['info-container']}>
                                    {
                                        energyInfoList && energyInfoList.length 
                                        ?
                                        energyInfoList.map((item,index)=>(
                                            <div key={index} className={style['info-item-wrapper']} style={{ paddingBottom : index < 2 ? '6px' : '0'}}>
                                                <div className={style['info-item']}>                                                
                                                    <div className={style['info-icon']} style={{ backgroundImage:`url(${icons})`, backgroundPosition:`-${energyIcons[item.key]*24}px 0` }}></div>
                                                    <div className={style['info-content']}>
                                                        <div className={style['info-title']}>{ `本月用${ energyTypes[item.key]}(${ showType === 'energy' ? item.unit : '元'})` }</div>
                                                        <div className={style['info-num']}>{ `${ showType === 'energy' ? (item.energy).toFixed(0) : (item.cost).toFixed(0) }` }</div>
                                                        <div className={style['info-ratio']}>环比{ item.ratio <= 0 ? <ArrowDownOutlined/> : <ArrowUpOutlined /> } { `${Math.abs(item.ratio).toFixed(1)} %` }</div>
                                                    </div> 
                                                </div> 
                                            </div>
                                        ))
                                        :
                                        <Spin />
                                    }                             
                                </div>
                            </div>
                        </div>
                        {/* 能耗对标 */}
                        <div style={{ height:'60%'}}>
                            <div className={style['item-container']}>
                                <div className={style['title']}>
                                    <div><DashboardOutlined />能耗对标</div>
                                    <div className={style['sub-text']}><Link to={`/energy/info_manage_menu/quota_manage`}>设置定额</Link></div>
                                </div>
                                <div className={style['energy-container']}>
                                    {
                                        energyInfoList && energyInfoList.length 
                                        ?
                                        energyInfoList.map((item,index)=>(
                                            <div key={index}>
                                                <div className={style['energy-icon']} style={{ backgroundImage:`url(${icons})`, backgroundPosition:`-${energyIcons[item.key]*24}px 0` }}></div>
                                                <div className={style['energy-info']}>
                                                    <div className={style['energy-title']}>
                                                        <span>{ `本月用${energyTypes[item.key]}定额:` }</span>
                                                        <span className={style['sub-num']}>{ `${item.quota} ${energyUnit[item.key]}` }</span>
                                                    </div>
                                                    <div className={style['progress-container']}>
                                                        {
                                                            !item.quota || ( item.quota && item.energy <= item.quota )
                                                            ?
                                                            <div className={style['progress']} style={{
                                                                borderRadius:'6px',
                                                                width: item.quota ? `${Math.floor(item.energy/item.quota*100)}%` : '0'
                                                            }}></div>
                                                            :
                                                            <div style={{ width:'100%', height:'100%'}}>
                                                                <div className={style['progress']} style={{ width:`${item.quota/item.energy*100 < 4 ? 4 : item.quota/item.energy*100 }%`, borderTopLeftRadius:'6px', borderBottomLeftRadius:'6px'}}></div>
                                                                <div className={style['progress']} style={{ width:`${(item.energy - item.quota)/item.energy*100}%`, backgroundColor:'#09c1fd', borderTopRightRadius:'6px', borderBottomRightRadius:'6px' }}></div>
                                                            </div>
                                                        }
                                                       
                                                        {/* <div className={style['progress']} style={{ 
                                                            // 如果没有设置定额/如果超过定额
                                                            width: item.quota ? (+item.energy) >= (+item.quota) ? '100%' : `${Math.floor(item.energy/item.quota*100)}%` : '0px'
                                                        }}></div> */}
                                                    </div>

                                                    <div className={style['energy-text']}>
                                                        <div><span>已使用:</span><span className={style['sub-num']}>{ `${(item.energy).toFixed(0)} ${energyUnit[item.key]}` } </span></div>
                                                        <div><span>超出:</span><span className={style['sub-num']}>{ `${ item.energy <= item.quota ? 0 : (item.energy - item.quota).toFixed(0)} ${energyUnit[item.key]}` } </span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                        :
                                        <Spin />
                                    }
                                </div>
                            </div>
                        </div>                
                    </div>
                    <div className={style['middle']}>
                        {/* 项目监控 */}
                        <div style={{ height:'100%'}}>
                            <div className={style['item-container']} style={{ backgroundColor:'transparent' }}>
                                <div className={style['title']} style={{ justifyContent:'center', height:'6%' }}><div><DashboardOutlined />本月能源指标</div></div>
                                <div className={style['flex-item']} style={{ height:'94%' }}>
                                    {/* {
                                        sceneList && sceneList.length
                                        ?
                                        <GlobalSlider interval={10} sceneList={sceneList} levelInfo={levelInfo} contentWidth={user.contentWidth} dispatch={dispatch} chartLoading={chartLoading} currentPath={user.currentPath} currentIndex={location.index} />
                                        :
                                        <Spin />
                                    } */}
                                    {
                                        tplInfo && Object.keys(tplInfo).length
                                        ?
                                        <DefaultMonitorTpl data={tplInfo} />
                                        :
                                        <Spin />

                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style['right']}>
                        {/* 需求预测分析 */}
                        <div style={{ height:'40%', paddingBottom:'10px' }}>
                            <div className={style['item-container']}>
                                <div className={style['title']}><div><DashboardOutlined />需求预测分析</div></div>
                                <div className={style['info-container']}>
                                    {
                                        energyInfoList && energyInfoList.length 
                                        ?
                                        energyInfoList.map((item,index)=>(
                                            <div key={index} className={style['info-item-wrapper']} style={{ paddingBottom : index < 2 ? '6px' : '0'}}>
                                                <div className={style['info-item']}>
                                                    <div className={style['info-icon']} style={{ backgroundImage:`url(${icons})`, backgroundPosition:`-${energyIcons[item.key]*24}px 0` }}></div>
                                                    <div className={style['info-content']}>
                                                        <div className={style['info-title']}>{ `下月用${ energyTypes[item.key] }(${item.unit})` }</div>
                                                        <div className={style['info-num']}>{ `${(+item.demand).toFixed(0)}` }</div>
                                                        <div className={style['info-ratio']}>环比{ item.demandRatio <= 0 ? <ArrowDownOutlined/> : <ArrowUpOutlined /> } { `${Math.abs(item.demandRatio).toFixed(1)} %` }</div>
                                                    </div>
                                                </div> 
                                            </div>
                                        ))
                                        :
                                        <Spin />
                                    }            
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ height:'60%'}}>
                            {/*  安全监控 */}
                            {/* <div className={style['item-container']}>
                                <div className={style['title']}>
                                    <div><DashboardOutlined />安全监控</div>
                                    <div className={style['sub-text']}><Link to={`/alarm_manage/alarm_execute`}>查看更多</Link></div>
                                </div>
                                <div className={style['flex-item']}>
                                    {
                                        monitorInfo && monitorInfo.warning 
                                        ?
                                        <ScrollTable data={monitorInfo.warningRecord} />
                                        :
                                        <Spin />
                                    }
                                </div>
                            </div> */}
                            <div className={style['item-container']}>
                                <div className={style['title']}>
                                    <div><DashboardOutlined />本月节俭空间</div>

                                </div>
                                <div className={style['flex-item']}>
                                    {
                                        saveSpace.costInfo
                                        ?
                                        <SaveSpacePieChart data={saveSpace.costInfo} />
                                        :
                                        <Spin />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={style['bottom-container']}>
                    <div className={style['left']}>
                        {/* 异常处理进度 */}
                        <div className={style['item-container']} style={{ height:'100%' }}>
                            <div className={style['title']}><div><DashboardOutlined />异常处理进度</div></div>
                            <div className={style['flex-item']}>
                                
                                {
                                    monitorInfo && monitorInfo.warning
                                    ?
                                    <PieChart data={monitorInfo.warning} />
                                    :
                                    <Spin />
                                }
                            </div>
                        </div>
                    </div>
                    <div className={style['middle']}>
                        {/* 今日负荷 */}
                        <div className={style['item-container']} style={{ height:'100%' }}>
                            <div className={style['title']}><div><DashboardOutlined />{ `今日负荷(${ energyInfo.type_code ? energyInfo.type_code === 'ele' ? 'kw' : energyInfo.unit : '' })` }</div></div>
                            <div className={style['flex-item']} >
                                {
                                    monitorInfo && monitorInfo.view 
                                    ?
                                    <LineChart data={monitorInfo.view} dispatch={dispatch} energyList={energyList} energyInfo={energyInfo} />
                                    :
                                    <Spin />
                                }
                            </div>
                        </div>
                    </div>
                    <div className={style['right']}>
                        {/*综合能效  */}
                        <div className={style['item-container']} style={{ height:'100%' }}>
                            <div className={style['title']}><div><DashboardOutlined />综合能效评价</div></div>
                            <div className={style['flex-item']} >
                                {
                                    monitorInfo && monitorInfo.grade 
                                    ?
                                    <RadarChart data={monitorInfo.grade} />
                                    :
                                    <Spin />
                                }
                            </div>
                        </div>
                    </div>
                </div>        
            </div>
        </div>   
    )
};


// IndexTemplate1.propTypes = {

// };


export default IndexTemplate1;

