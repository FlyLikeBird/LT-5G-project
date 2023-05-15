import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import { findMaxAndMin } from '@/utils/array';
import { Modal, Form, Tag, Button, Input, InputNumber, Radio } from 'antd';
import style from '@/pages/IndexPage.css';

const richStyle = {
    'red':{
        // width:80,
        height:20,
        align:'center',
        borderWidth:1,
        color:'#fff',
        borderColor:'#1890ff',
        backgroundColor:'rgba(24,144,255,0.6)'
    },
    'blue':{
        // width:80,
        height:20,
        align:'center',
        borderWidth:1,
        color:'#fff',
        borderColor:'#ffa63f',
        backgroundColor:'rgba(255, 166, 63,0.6)'
    },
    'purple':{
        // width:80,
        height:20,
        color:'#fff',
        align:'center',
        borderWidth:1,
        borderColor:'#5eff5a',
        backgroundColor:'rgba(94,255,90, 0.6)'
    },
    'orange':{
        // width:80,
        height:20,
        color:'#fff',
        align:'center',
        borderWidth:1,
        borderColor:'#ff2d2e',
        backgroundColor:'rgba(255, 45, 46, 0.6)'
    }
}

function MultiLineChart({ theme, xData, typeRule, energy, energyA, energyB, energyC, info, startDate, timeType, currentAttr, dispatch }){
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let totalKey = info.code === '8' ? 'N相' :  info.code === '2' || info.code === '3' || info.code === '4' ? '平均' : '总';
    seriesData.push({
        type:'line',
        name: totalKey + info.title,
        data:energy,
        itemStyle:{
            color:'#1890ff'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbol:'circle', symbolSize:10 },
                {type: 'min', name: '', symbol:'circle', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{red|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        }
    });
    seriesData.push({
        type:'line',
        name:'A相',
        data:energyA,
        itemStyle:{
            color:'#ffa63f'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{blue|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    seriesData.push({
        type:'line',
        name:'B相',
        data:energyB,
        itemStyle:{
            color:'#5eff5a'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{purple|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    seriesData.push({
        type:'line',
        name:'C相',
        data:energyC,
        itemStyle:{
            color:'#ff2d2e'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{orange|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    if ( typeRule && typeRule.warning_min ){
        seriesData.push({
            type:'line',
            symbol:'none',
            itemStyle:{
                color:'#6ec71e'
            },
            data:xData.map(i=>typeRule.warning_min),
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'下限值: '+ typeRule.warning_min, xAxis: timeType === '1' ? xData.length-4 : xData.length - 1, yAxis:typeRule.warning_min } ],
            },
            lineStyle:{
                type:'dashed'
            },
            tooltip:{ show:false }
        });
    }
    if ( typeRule && typeRule.warning_max ){
        seriesData.push({
            type:'line',
            symbol:'none',
            itemStyle:{
                color:'#ff2d2e'
            },
            data:xData.map(i=>typeRule.warning_max),
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'上限值: '+ typeRule.warning_max, xAxis: timeType === '1' ? xData.length-4 : xData.length - 1, yAxis:typeRule.warning_max } ],
            },
            lineStyle:{
                type:'dashed'
            },
            tooltip:{ show:false }
        });
    }
   
    useEffect(()=>{
        if ( visible ){
            form.setFieldsValue({
                warning_min:typeRule && typeRule.warning_min ? typeRule.warning_min : null,
                warning_max:typeRule && typeRule.warning_max ? typeRule.warning_max : null
            })
        }
    },[visible])
    return (
        <div style={{ position:'relative', height:'100%' }}>
            {/* {
                currentAttr.key 
                ?
                <div style={{ position:'absolute', right:'2rem', top:'0' }} className={style['custom-btn']} onClick={()=>setVisible(true)} >告警设置</div>  
                :
                null
            } 
            <Modal
                visible={visible}
                bodyStyle={{ padding:'2rem 4rem' }}
                footer={null}
                onCancel={()=>setVisible(false)}
            >
                <Form
                    form={form}
                    labelCol={{
                      span: 6,
                    }}
                    wrapperCol={{
                      span: 18,
                    }}
                    onFinish={values=>{
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'eleMonitor/setRule', payload:{ resolve, reject, warning_min:values.warning_min, warning_max:values.warning_max }})
                        })
                        .then(()=>{
                            setVisible(false);
                            form.resetFields();
                        })
                        .catch(msg=>message.error(msg))
                    }}
                >
                    <Form.Item label='当前节点' name='attr_id'>
                        <Tag>{ currentAttr.title }</Tag>
                    </Form.Item>
                    <Form.Item label='当前属性' name='type_code'>
                        <Tag>{ info.title }</Tag>
                    </Form.Item>
                    <Form.Item label='告警上限值' name='warning_max' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={info.unit} />
                    </Form.Item>
                    <Form.Item label='告警下限值' name='warning_min' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={info.unit} />
                    </Form.Item> 
                    
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button onClick={()=>setVisible(false)} style={{ marginRight:'0.5rem' }}>取消</Button>
                        <Button type="primary" htmlType="submit">设置</Button>
                    </Form.Item>
                </Form>
            </Modal> */}
            <ReactEcharts
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                option={{
                    legend:[
                        {
                            left:'center',
                            top:20,
                            data:seriesData.map(i=>i.name),
                            textStyle:{
                                color:textColor
                            }
                        },
                        {
                            right:20,
                            top:'middle',
                            orient:'vertical',
                            data:seriesData.map(i=>i.name),
                            itemWidth:0,
                            itemHeight:0,
                            textStyle:{
                                color:'#fff',
                                rich: {                   
                                    time: {
                                        width:60,
                                        height:30,
                                        fontSize: 12,
                                        lineHeight: 16,
                                        color: '#b7b7bf',
                                        align:'left'
                                    },
                                    num:{
                                        width:60,
                                        height:30,
                                        fontSize: 12,
                                        lineHeight: 16,
                                        color:textColor,
                                        align:'left',
                                        padding:[0,0,0,4]
                                    },
                                    value: {
                                        width:40,
                                        height:30,
                                        fontSize: 12,
                                        lineHeight: 16,
                                        color: '#b7b7bf',
                                        align:'left'
                                    },

                                }
                            },
                            formatter:name=>{
                                let temp = findMaxAndMin( name === totalKey + info.title ? energy  : name === 'A相' ? energyA : name === 'B相' ? energyB : name === 'C相' ? energyC : '', info.code === '5' ? true : false );
                                
                                let maxTime = xData[temp.max ? temp.max.index : 0];                        
                                let minTime = xData[temp.min ? temp.min.index : 0]; 
                                return `
                                    {value|${name}}{num|}{time|${ timeType === '1' ? '时间' : '日期'}}\n
                                    {value|最大值:}{num|${temp.max ? temp.max.value : '--'}}{num|${maxTime}}\n
                                    {value|最小值:}{num|${temp.min ? temp.min.value : '--'}}{num|${minTime}}\n
                                    {value|平均值:}{num|${temp.avg ? temp.avg : '--'}}
                                    `;
                            }
                        }
                    ],
                    tooltip:{
                        trigger:'axis'
                    },
                    grid:{
                        top:70,
                        bottom:20,
                        left:20,
                        right:200,
                        containLabel:true
                    },
                    xAxis:{
                        type:'category',
                        axisTick:{ show:false },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLabel:{
                            color:textColor
                        },
                        data:xData
                    },
                    yAxis:{
                        type:'value',
                        name:info.unit,
                        nameTextStyle:{
                            color:textColor
                        },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisTick:{ show:false },
                        axisLine:{
                            show:false
                        },
                        axisLabel:{
                            color:textColor
                        },
                    },
                    series:seriesData
                }}
            />
        </div>
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.energy !== nextProps.energy || prevProps.typeRule !== nextProps.typeRule ||  prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(MultiLineChart, areEqual);