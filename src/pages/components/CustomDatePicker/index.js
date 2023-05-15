import React, { useRef } from 'react';
import { connect } from 'dva';
import { DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined, FileExcelOutlined } from '@ant-design/icons';
import style from './CustomDatePicker.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { RangePicker } = DatePicker;


function CustomDatePicker({ dispatch, onDispatch, size, user, optionStyle, mode, noToggle, noDay, noMonth, noYear }){
    const { theme, timeType ,startDate, endDate } = user;
    const inputRef = useRef();
    return (
        <div className={ mode === 'dark' || theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container']} style={optionStyle}>
            {
                noToggle 
                ?
                null
                :
                <Radio.Group size={size || 'small'} style={{ marginRight:'14px' }} buttonStyle='solid' className={style['custom-radio']} value={timeType} onChange={e=>{
                    dispatch({ type:'user/toggleTimeType', payload:e.target.value });
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}>
                    {
                        noDay 
                        ?
                        null
                        :
                        <Radio.Button value='3'>时</Radio.Button>
                    }
                    {
                        noMonth
                        ?
                        null
                        :
                        <Radio.Button value='2'>日</Radio.Button>
                    }
                    {
                        noYear 
                        ?
                        null
                        :
                        <Radio.Button value='1'>月</Radio.Button>
                    }
                </Radio.Group>
            }
            
            <div style={{ display:'inline-flex'}}>
                <div className={style['date-picker-button-left']} onClick={()=>{
                    let start,end ;
                    let temp = new Date(startDate.format('YYYY-MM-DD'));
                    if ( timeType === '3'){
                        end = start = moment(temp).subtract(1,'days');
                    }
                    if ( timeType === '2'){
                        start = moment(temp).subtract(1,'months').startOf('month');
                        end = moment(temp).subtract(1,'months').endOf('month');
                    } else if ( timeType === '1'){
                        start = moment(temp).subtract(1,'years').startOf('year');
                        end = moment(temp).subtract(1,'years').endOf('year');
                    }
                    
                    dispatch({ type:'user/setDate', payload:{ startDate:start, endDate:end }});
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}><LeftOutlined /></div>
                {
                    timeType === '3' 
                    ?
                    <DatePicker ref={inputRef} size={ size || 'small'} locale={zhCN} allowClear={false} className={style['custom-date-picker']} value={startDate} onChange={value=>{
                        dispatch({ type:'user/setDate', payload:{ startDate:value, endDate:value }});
                        if(onDispatch && typeof onDispatch === 'function') onDispatch();
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }} />
                    :
                    <RangePicker ref={inputRef} size={size || 'small'} picker={timeType === '1' ? 'month' : 'date'} locale={zhCN} allowClear={false} className={style['custom-date-picker']} value={[startDate, endDate]} onChange={arr=>{
                        dispatch({ type:'user/setDate', payload:{ startDate:arr[0], endDate:arr[1] }});
                        if(onDispatch && typeof onDispatch === 'function') onDispatch();
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }}/>
                }
                
                <div className={style['date-picker-button-right']} onClick={()=>{
                    let start,end;
                    let temp = new Date(startDate.format('YYYY-MM-DD'));
                    if ( timeType === '3'){
                        end = start = moment(temp).add(1,'days');
                    }
                    if ( timeType === '2'){
                        start = moment(temp).add(1,'months').startOf('month');
                        end = moment(temp).add(1,'months').endOf('month');
                    } else if ( timeType === '1'){
                        start = moment(temp).add(1,'years').startOf('year');
                        end = moment(temp).add(1,'years').endOf('year');
                    }
                    dispatch({ type:'user/setDate', payload:{ startDate:start, endDate:end }});
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}><RightOutlined /></div>
            </div>
            
        </div>
    )
}

export default connect(({ user })=>({ user }))(CustomDatePicker);