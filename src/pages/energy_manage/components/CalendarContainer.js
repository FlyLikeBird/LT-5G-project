import React, { useState, useEffect } from 'react';
import { Select, Radio, DatePicker, Spin } from 'antd';
import CustomCalendar from '@/pages/components/CustomCalendar'; 
import style from '@/pages/IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { Option } = Select;

function CalendarContainer({ data, currentDate, mode, theme, onDispatch, energyInfo, isLoading }){
    return (
        <div style={{ height:'100%' }}>
            <div style={{ height:'40px' }}>
                <Radio.Group style={{ marginRight:'1rem' }} className={style['custom-radio']} value={mode} onChange={e=>{
                    onDispatch({ type:'cost/setMode', payload:e.target.value });
                    onDispatch({ type:'cost/fetchCostCalendar' });
                }}>
                    <Radio.Button key='month' value='month' >日</Radio.Button>
                    <Radio.Button key='year' value='year'>月</Radio.Button>
                </Radio.Group>
                <DatePicker value={currentDate} locale={zhCN} allowClear={false} picker='month' onChange={value=>{
                    onDispatch({ type:'cost/setCurrentDate', payload:value });
                    onDispatch({ type:'cost/fetchCostCalendar'});
                }} />             
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                {
                    isLoading 
                    ?
                    <Spin className={style['spin']} />
                    :
                    <CustomCalendar 
                        data={data}
                        currentDate={currentDate} 
                        onChangeDate={value=>onUpdateDate(value)} 
                        onDispatch={action=>onDispatch(action)}
                        theme={theme} 
                        mode={mode}
                        energyInfo={energyInfo}
                    />
                }
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme || prevProps.isLoading !== nextProps.isLoading ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(CalendarContainer, areEqual);