import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import CompareLineChart  from './components/CompareLineChart';
import style from './EleMonitor.css';
import normalSymbol from '../../../public/incoming-normal.png';
import selectedSymbol from '../../../public/incoming-selected.png';
import IndexStyle from '@/pages/IndexPage.css';

function HighVolManager({ dispatch, user, highVol }){
    const { authorized, startDate, endDate, timeType, theme } = user;
    const { incomingList, currentIncoming, infoList, chartInfo, optionList, currentOption } = highVol;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'highVol/initHighVol'});
        }    
        return ()=>{
        }
    },[authorized]);
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>进线选择</div>
                <div className={IndexStyle['card-content']}>
                    {
                        incomingList.length 
                        ?
                        <div className={style['list-container-vertical']}>
                            {
                                incomingList.map((item,index)=>(
                                    <div key={index} style={{ textAlign:'center', marginBottom:'1rem', cursor:'pointer' }} onClick={()=>{
                                        if ( item.inId !== currentIncoming.inId ){
                                            let temp = incomingList.filter(i=>i.inId === item.inId )[0];
                                            dispatch({ type:'highVol/setCurrentIncoming', payload:temp });
                                            dispatch({ type:'highVol/fetchHighVolInfo'});
                                            dispatch({ type:'highVol/fetchHighVolChart'});
                                            
                                        }
                                    }}>
                                        <div>
                                            <div style={{ 
                                                width:'100%', 
                                                height:'140px', 
                                                backgroundRepeat:'no-repeat', 
                                                backgroundSize:'contain', 
                                                backgroundPosition:'50% 50%',
                                                backgroundImage:`url(${ item.inId === currentIncoming.inId ? selectedSymbol : normalSymbol })` 
                                            }}></div>
                                        </div>
                                        <div>{ item.name }</div>
                                    </div>
                                ))
                            }
                        </div>
                        :
                        <div style={{ padding:'1rem' }}>
                            <div>还没有配置进线信息</div>
                            <Button type='primary' style={{ marginTop:'1rem' }} onClick={()=>{
                                history.push('/energy/info_manage/incoming_line');
                            }}>前往设置</Button>
                        </div>
                    }
                </div>
            </div>
    );
    const content = (
        <div>
            <div className={IndexStyle['card-container-wrapper']} style={{ height:'32%', paddingRight:'0'}}>
                <div className={IndexStyle['card-container']}>
                    <div className={IndexStyle['card-title']}>{ currentIncoming.name || '--' }</div>
                    <div className={IndexStyle['card-content']}>
                        <div className={style['flex-container']}>
                            {
                                
                                infoList.map((item,index)=>(
                                    <div key={index} className={style['flex-item']} style={{ width:'calc((100% - 3rem)/4)'}}>
                                        <div className={style['flex-item-title']}>{ item.title }</div>
                                        <div className={style['flex-item-content']}>
                                            {
                                                item.child && item.child.length 
                                                ?
                                                item.child.map((sub, j)=>(
                                                    <div key={index + '-' + j } style={{ height:'18%', display:'flex', alignItems:'center', }}>
                                                        <div className={style['flex-item-symbol']} style={{ backgroundColor:sub.type === 'A' ? '#eff400' : sub.type === 'B' ? '#00ff00' : sub.type === 'C' ? '#ff0000' : '#01f1e3' }}></div>
                                                        <div>{ sub.title }</div>
                                                        <div style={{ flex:'1', height:'1px', backgroundColor: user.theme === 'dark' ? '#34557e' : '#e4e4e4', margin:'0 6px'}}></div>
                                                        <div style={{ fontSize:'1.2rem' }}>{ sub.value ? sub.value + ' ' + sub.unit : '-- --' }</div>
                                                    </div>
                                                ))
                                                :
                                                null
                                                
                                            
                                            }
                                        </div>
                                    </div>
                                )) 
                               
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={IndexStyle['card-container-wrapper']} style={{ height:'68%', paddingRight:'0', paddingBottom:'0'}}>
                <div className={IndexStyle['card-container']}>
                    <div style={{ display:'flex', alignItems:'center', height:'50px', padding:'0.5rem 1rem' }}>
                        <Radio.Group size='small' style={{ marginRight:'14px' }} className={style['custom-radio']} value={currentOption.key} onChange={e=>{
                            let temp = optionList.filter(i=>i.key === e.target.value)[0];
                            dispatch({ type:'highVol/setCurrentOption', payload:temp });
                            dispatch({ type:'highVol/updateChartInfo' });
                        }}>
                            {
                                optionList.map((item,index)=>(
                                    <Radio.Button value={item.key} key={item.key}>{ item.title }</Radio.Button>
                                ))
                            }
                        </Radio.Group>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({ type:'highVol/fetchHighVolChart'});
                        }} />
                    </div>
                    <div style={{ height:'calc( 100% - 50px)'}}>
                        <CompareLineChart 
                            theme={theme} 
                            timeType={timeType} 
                            startDate={startDate} 
                            info={currentOption} 
                            xData={chartInfo.date || []} 
                            yData={chartInfo.energy || []} 
                            y2Data={chartInfo.energySame || []} />
                        
                    </div>
                </div>
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
   
}

export default connect(({ user, highVol })=>({ user, highVol }))(HighVolManager);
