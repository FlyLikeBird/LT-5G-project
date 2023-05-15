import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined } from '@ant-design/icons';
import InfoItem from './components/InfoItem';
import MonthPieChart from './components/MonthPieChart';
import RangeBarChart from './components/RangeBarChart';
import SceneBg from '../../../public/scene.png';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
const dotStyle = {
    width:'8px',
    height:'8px',
    display:'inline-block',
    borderRadius:'50%',
    position:'absolute',
    top:'0',
    left:'-14px',
    transform:'translateY(50%)',
}

function EnergyManager({ dispatch, user, fields, energy }){ 
    const { authorized, theme } = user;
    const { energyTypes, allFields, currentEnergy } = fields;
    const { infoList, pieChartInfo, chartInfo, chartLoading } = energy;
    const [showType, setShowType] = useState('cost'); 
    let energyInfo = energyTypes[currentEnergy] || {}; 
    useEffect(()=>{
        // 当组件卸载时重置loaded的状态
        if ( authorized ) {
            dispatch({ type:'energy/initEnergy'});
        }
    },[authorized]);
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'energy/reset'});
        }
    },[])
    const containerRef = useRef();
    
    return (
        <div 
            className={style['page-container']} 
            ref={containerRef} 
        >
            {/* 遮罩层 */}
           
            <div style={{ height:'40px'}}>
                <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'20px' }} value={currentEnergy} className={style['custom-radio']} onChange={(e)=>{
                    dispatch({ type:'fields/setEnergyType', payload:e.target.value });
                    dispatch({ type:'energy/updateEnergyType'});
                    dispatch({ type:'energy/fetchTotalCost'});      
                }}>
                    {
                        [0].concat(allFields.map(i=>i.energyType)).map((item,index)=>(
                            <Radio.Button key={item} value={item}>{ energyTypes[item] && energyTypes[item].typeName }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <Radio.Group buttonStyle='solid' size='small' value={showType} className={style['custom-radio']} onChange={e=>setShowType(e.target.value)}>
                    <Radio.Button value='cost'>成本</Radio.Button>
                    <Radio.Button value='energy'>能耗</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'54%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                        <div className={style['card-container']}>
                            <div style={{ height:'100%', backgroundImage:`url(${SceneBg})`, backgroundRepeat:'no-repeat', backgroundSize:'cover' }}>
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                        {
                            infoList.map((item,index)=>(
                                <div key={index} style={{ height:'33.3%', paddingBottom:index === infoList.length - 1 ? '0' : '1rem' }}>
                                    <div className={style['card-container']}>
                                        <InfoItem key={index} data={item} energyInfo={energyInfo} showType={showType} />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div style={{ height:'46%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                chartLoading 
                                ?
                                <Loading />
                                :
                                null
                            }
                            <RangeBarChart 
                                data={chartInfo}
                                energyInfo={energyInfo} 
                                showType={showType}
                                onDispatch={action=>dispatch(action)}
                                theme={theme}
                            /> 
                        </div>
                    </div> 
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                pieChartInfo.length 
                                ?
                                <MonthPieChart data={pieChartInfo}  energyTypes={energyTypes} energyInfo={energyInfo} showType={showType} theme={theme} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>               
                    </div> 
                </div>
            </div>
            
        </div>
            
    )
        
}

export default connect(({ user, fields, energy })=>({ user, fields, energy }))(EnergyManager);
