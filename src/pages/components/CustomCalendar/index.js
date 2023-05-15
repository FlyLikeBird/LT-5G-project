import React, { useState } from 'react';
import { Calendar, Tooltip } from 'antd';
import zhCN from 'antd/es/calendar/locale/zh_CN';
import moment from 'moment';
import style from './Calendar.css';

let info = {
    'total':{ text:'总', unit:'tce', color:'#fff', value:30000, quota:40000 },
    'ele':{ text:'电', unit:'kwh', color:'#0c9dff', value:6485, quota:8000 },
    'water':{ text:'水', unit:'m³', color:'rgb(15, 192, 203)', value:6485, quota:8000 },
    'gas':{ text:'气', unit:'m³', color:'#fecd63', value:6485, quota:8000 },
    'hot':{ text:'热', unit:'GJ', color:'#ae2aff', value:6485, quota:8000 },
    'combust':{ text:'燃气', unit:'m³', color:'rgb(15, 192, 203)' },
    'compressed':{ text:'压缩空气', unit:'m³', color:'rgb(15, 192, 203)'}
}
// ['total','ele','water','gas','hot'].map((type,i)=>(
//     <div key={type} style={{
//         display:'inline-flex',
//         alignItems:'center',
//         margin:'6px 0',
//         width: i === 0 ? '100%' : '50%'
//     }}>
//         <div style={{ marginRight:'1rem', borderRadius:'50%', border:`1px solid ${info[type].color}`, padding:'2px 6px', fontSize:'0.8rem', color:info[type].color }}>{ info[type].text }</div>
//         <div>
//             <span style={{ fontSize:'1.2rem', fontWeight:'bold' }}>{ info[type].value }</span>
//             <span style={{ margin:'0 4px'}}>/</span>
//             <span className={style['unit']}>{ info[type].quota }</span>
//             <span className={style['unit']}>元</span>
//         </div>
//     </div>
// ))
let today = new Date();
function CustomCalendar({ currentDate, data, mode, energyInfo, onDispatch, theme }){
    let currentDateStr = currentDate.format('YYYY-MM-DD').split('-');
    function dateCellRender(value){
        let itemDateStr = value.format('YYYY-MM-DD').split('-');
        let isInMonth = itemDateStr[1] === currentDateStr[1] ? true : false ;
        let lessToday = new Date(value.format('YYYY-MM-DD')).getTime() <= today.getTime() ? true : false;
        let cost = data.cost && isInMonth ? data.cost[itemDateStr[2] - 1] : 0;
        let quota = data.quota && isInMonth ? data.quota[itemDateStr[2] - 1] : 0;
        let energy = data.energy && isInMonth ? data.energy[itemDateStr[2] - 1] : 0;
        let isRed = quota && cost >= quota ? true : false;
        return (
            <Tooltip visible={false} overlayInnerStyle={{ overflow:'hidden', backgroundColor:'#47475b', border:'1px solid #6c6c7c', borderRadius:'6px' }} title={(
                <div style={{ padding:'0 1rem' }}>
                    <div style={{ textAlign:'center', fontSize:'0.8rem' }}>{ value.format('YYYY-MM-DD') }</div>
                    {
                        ['total', 'ele','water','gas','hot'].map((type,index)=>(
                            <div key={type} style={{ 
                                width:'200px', 
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent:'space-between',
                                borderBottom: index === 4 ? 'none' : '1px solid rgba(255, 255, 255,0.2)',
                                padding:'0.5rem 0',
                                position:'relative'
                            }}>
                                <div>{ info[type].text + '成本' }</div>
                                <div>
                                    <span style={{ fontWeight:'bold' }}>{ info[type].value }</span>
                                    <span style={{ margin:'0 6px'}}>/</span>
                                    {/* <span className={style['unit']}>{ info[type].quota }</span> */}
                                    <span className={style['unit']} style={{ marginLeft:'4px'}}>元</span>
                                </div>
                                {
                                    index 
                                    ?
                                    <span style={{ position:'absolute', width:'14px', height:'24px', borderRadius:'6px', background:info[type].color, left:'-30px'  }}></span>
                                    :
                                    null
                                }
                            </div>
                        ))
                    }
                </div>
            )} trigger='click' destroyTooltipOnHide={true}>
                <div className={style['content-wrapper'] + ' ' + ( isRed ? style['in-warning'] : isInMonth ? style['in-month'] : '' ) }>
                    <div className={style['content']}>
                        <div className={style['content-head']}>{ value.date() } </div>             
                        {
                            isInMonth 
                            ?
                            <div className={style['content-body']} style={{ opacity:lessToday ? '1' : '0' }}>
                                <div>
                                    {/* <span style={{ fontSize:'0.8rem', color:theme === 'dark' ? '#fff' : '#000' }}>{ info[energyInfo.typeCode].text + '成本 :' }</span> */}
                                    <span className={style['text']} style={{ marginLeft:'4px' }}>{ lessToday ? cost: '-- --'}</span>
                                    {/* <span className={style['unit']}>{ ' / ' + Math.round(quota) }</span> */}
                                    <span className={style['unit']}>{ lessToday ? '元' : ''}</span>
                                    <span style={{ position:'absolute', width:'14px', height:'18px', borderRadius:'4px', background:'#0c9dff', left:'-10px'  }}></span>
                                </div>
                                <div>
                                    {/* <span style={{ fontSize:'0.8rem', color:theme === 'dark' ? '#fff' : '#000' }}>{ info[energyInfo.typeCode].text + '能耗 :' } </span> */}
                                    <span className={style['text']} style={{ marginLeft:'4px', fontWeight:lessToday ? 'bold' : 'normal' }}>{ lessToday ? energy : '-- --'}</span>
                                    <span className={style['unit']}>{ lessToday ? energyInfo.unit : ''}</span>
                                    <span style={{ position:'absolute', width:'14px', height:'18px', borderRadius:'4px', background:'#79e9ef', left:'-10px'  }}></span>
                                </div>
                            </div>
                            :
                            null
                        }
                        

                    </div>
                </div>
            </Tooltip>
        )
    };
    function monthCellRender(value){
        let itemDateArr = value.format('YYYY-MM-DD').split('-');
        let lessMonth =  itemDateArr[0] <= today.getFullYear() && itemDateArr[1] <= today.getMonth() + 1 ? true : false; 
        let cost = data.cost ? data.cost[itemDateArr[1] - 1] : 0;
        let energy = data.energy ? data.energy[itemDateArr[1] - 1] : 0;
        let quota = data.quota ? data.quota[itemDateArr[1] - 1] : 0;
        return (
            <div className={style['content-wrapper'] + ' ' + style['in-month']}>
                <div className={style['content']} style={{ justifyContent:'space-around', padding:'1rem' }}>
                    <div className={style['content-head']}>{ ( value.month() + 1) + '月' }</div>
                    <div className={style['content-body']} style={{ opacity:lessMonth ? '1' : '0' }}>
                        <div style={{ marginBottom:'1rem' }}>
                            <div style={{ marginRight:'1rem', borderRadius:'12px', border:`1px solid ${info[energyInfo.typeCode].color}`, padding:'4px 1rem', fontSize:'0.8rem', color:info[energyInfo.typeCode].color }}>{ info[energyInfo.typeCode].text + '成本 : ' }</div>
                            <div className={style['text']} style={{ marginLeft:'4px' }}>{ Math.round(cost) }</div>
                            {/* <span className={style['unit']}>{ ' / 定额 : ' + quota }</span> */}
                            <span className={style['unit']}>元</span>
                        </div>  
                        <div>
                            <div style={{ marginRight:'1rem', borderRadius:'12px', border:`1px solid ${info[energyInfo.typeCode].color}`, padding:'4px 1rem', fontSize:'0.8rem', color:info[energyInfo.typeCode].color }}>{ info[energyInfo.typeCode].text + '能耗 : ' }</div>
                            <div className={style['text']} style={{ marginLeft:'4px' }}>{ Math.round(energy) }</div>
                            <span className={style['unit']}>{ energyInfo.unit }</span>
                        </div>  
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div style={{ height:'100%'}}>
            <Calendar
                className={style['custom-calendar'] + ' ' + ( theme === 'dark' ? style['dark'] : '')}
                locale={zhCN}
                value={currentDate}
                mode={mode}
                headerRender={()=>null}
                dateFullCellRender={dateCellRender}
                monthFullCellRender={monthCellRender}
                onSelect={
                    value=>{
                        if ( onDispatch ) {
                            let selectedDate = value.format('YYYY-MM-DD').split('-');
                            if ( mode === 'month' && selectedDate[1] !== currentDateStr[1] ) {
                                onDispatch({ type:'cost/setCurrentDate', payload:value });
                                onDispatch({ type:'cost/fetchCostCalendar' });
                            }                        
                        }
                    }
                   
                }
            />
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(CustomCalendar, areEqual);