import React, { useState, useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { PictureOutlined, FileExcelOutlined} from '@ant-design/icons';
import { Radio, message } from 'antd';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function DemandLineChart({ theme, data, multi }){
    let { dateValueDetailMap, lastDateValueDetailMap, profitBalance } = data;
    const seriesData = [], dateArr = [], demandData = [], lastDemandData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();

    if ( dateValueDetailMap ) {
        Object.keys(dateValueDetailMap).sort((a,b)=>{
            return new Date(a).getTime() < new Date(b).getTime() ? -1 : 1;
        }).forEach(key=>{
            dateArr.push(key);
            demandData.push(dateValueDetailMap[key]);
            lastDemandData.push( lastDateValueDetailMap ? lastDateValueDetailMap[key] : 0);
        })
    }
    seriesData.push({
        type:'line',
        name:'当前需量',
        symbol:'none',
        areaStyle:{
            opacity:0.3
        },
        data:demandData
    });
    if ( multi ) {
        seriesData.push({
            type:'line',
            name:'参考需量',
            symbol:'none',
            areaStyle:{
                opacity:0.3
            },
            data:lastDemandData
        });
        seriesData.push({
            type:'line',
            name:'盈亏平衡',
            symbol:'none',
            animation:true,
            animationDuration:5,
            animationDelay:5,
            data:dateArr.map(i=>profitBalance),
            itemStyle:{
                opacity:1
            },
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'盈亏平衡: '+ profitBalance, xAxis:dateArr.length-1, yAxis:profitBalance } ],
            }
        });
    }
    
    // if ( typeRule && typeRule.warning_min ){
    //     seriesData.push({
    //         type:'line',
    //         symbol:'none',
    //         itemStyle:{
    //             color:'#6ec71e'
    //         },
    //         data:xData.map(i=>typeRule.warning_min),
    //         markPoint:{
    //             symbol:'rect',
    //             symbolSize:[100,20],
    //             data:[ { value:'下限值: '+ typeRule.warning_min, xAxis: timeType === '1' ? xData.length-4 : xData.length - 1, yAxis:typeRule.warning_min } ],
    //         },
    //         lineStyle:{
    //             type:'dashed'
    //         },
    //         tooltip:{ show:false }
    //     });
    // }
    
    return (
        <div style={{ position:'relative', height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value='cost' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '需量管理';
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
                        .then(canvas=>{
                            let MIME_TYPE = "image/png";
                            let url = canvas.toDataURL(MIME_TYPE);
                            let linkBtn = document.createElement('a');
                            linkBtn.download = fileTitle ;          
                            linkBtn.href = url;
                            let event;
                            if( window.MouseEvent) {
                                event = new MouseEvent('click');
                            } else {
                                event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            }
                            linkBtn.dispatchEvent(event);
                        })
                        return ;
                    }
                    if ( value === 'excel' ) {
                        if ( demandData.length ){
                            
                            var aoa = [], thead = ['对比项', '单位'];
                            dateArr.forEach(i=>thead.push(i));
                            aoa.push(thead);
                            seriesData.forEach(i=>{
                                let temp = [];
                                temp.push(i.name);
                                temp.push('kw');
                                temp.push(...i.data);
                                aoa.push(temp);
                            });
                            var sheet = XLSX.utils.aoa_to_sheet(aoa);
                            sheet['!cols'] = thead.map(i=>({ wch:16 }));
                            downloadExcel(sheet, fileTitle + '.xlsx' );
                        } else {
                            message.info('数据源为空');
                        }
                        
                    }
                }}>
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
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
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    legend:{
                        data:seriesData.map(i=>i.name),
                        left:'center',
                        top:10,
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    color:colors,
                    grid:{
                        top:70,
                        bottom:20,
                        left:20,
                        right:30,
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
                        data:dateArr
                    },
                    yAxis:{
                        type:'value',
                        name:'(kw)',
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
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(DemandLineChart, areEqual);