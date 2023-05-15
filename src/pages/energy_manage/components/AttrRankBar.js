import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, Spin, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import Loading from '@/pages/components/Loading';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
// import { IconFont } from '@/pages/components/IconFont';

function filterArr(arr){
    return arr.map(i=>{
        if ( i.cost >= i.quota ) {
            let obj = {};
            obj.value = Math.floor(i.cost);
            obj.itemStyle = { color:'#f35444'};
            return obj;
        } else {
            return Math.floor(i.cost);
        }
    })
}

function filterRatio(arr){
    return arr.map(i=>{
        if ( i.output_ratio >= i.ratio_target ) {
            let obj = {};
            obj.value = i.output_ratio;
            obj.itemStyle = { color:'#f35444'};
            return obj;
        } else {
            return i.output_ratio;
        }
    })
}

function filterMulti(arr){
    let population = { name:'人效', data:[]}, mach_num = { name:'台效', data:[]}, area={ name:'坪效', data:[]};
    arr.map(attr=>{
        attr.info_type.forEach(type=>{
            if ( type.type_code === 'population') {
                population.data.push(type.per_value);
            } else if ( type.type_code === 'mach_num') {
                mach_num.data.push(type.per_value);
            } else if ( type.type_code ==='area') {
                area.data.push(type.per_value);
            }
        })
    });
    return [population, mach_num, area];
}

function RegionQuotaChart({ data, energyInfo, chartLoading, showType, fieldName, multi, theme, forReport }) {    
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const [rank, setRank] = useState('down');
    let seriesData = [], valueData = [], categoryData = [], quotaData = [];
    Object.keys(data).forEach(key=>{
        valueData.push({ ...data[key], attrName:key });
    });
    valueData = valueData.sort((a,b)=>{
        if ( rank === 'down' ) {
            return a.cost < b.cost ? 1 : -1;
        } else {
            return a.cost < b.cost ? -1 : 1;
        }
    })
    categoryData = valueData.map(i=>i.attrName);
    quotaData = valueData.map(i=>showType === 'cost' ? i.quotaCost : i.quotaUsage);
    if ( valueData.length ) {
        seriesData.push({
            type:'bar',
            barWidth:14,
            name:showType === 'cost' ? '成本' : '能耗',
            data:valueData.map((item)=>{
                let value = showType === 'cost' ? Math.round(item.cost) : Math.round(item.sumUsage);
                let quota = showType === 'cost' ? item.quotaCost : item.quotaUsage;
                return {
                    value,
                    itemStyle:{ 
                        color: quota && value >= quota ? '#f14c3c' : '#1890ff'
                    } 
                }
            })
        });
        seriesData.push({
            type:'line',
            name:'定额',
            step:'end',
            data:quotaData,
            symbol:'none',
            itemStyle:{                               
                color:'#f8b238',
            },
            lineStyle:{
                type:'dotted'
            },
            markPoint:{
                emphasis:{
                    itemStyle:{
                        borderWidth:10,
                    }
                },
                data:[
                    { value:'定额值', xAxis:categoryData.length-1, yAxis:quotaData[quotaData.length-1] }
                ]               
            }  
        })
    }
    let showTitle = showType ? showType === 'cost' ? '成本' : '能耗' : '能效产值比';
    let cardTitle = multi ? 
            // '责任区域综合能效对比' :
            `${fieldName}综合能效对比` :
            showType ?
            `${fieldName}${showTitle}排行`:
            `${fieldName}能效产值比`;
    
    if ( multi ) {
        // 显示堆叠柱状图（人效、台效、坪效）
        filterMulti(resultData).forEach(item=>{
            option.series.push({
                type:'bar',
                barWidth:8,
                barGap:'0%',
                name:item.name,
                label: {
                    show: true,
                    formatter:(params)=>{
                        if(params.value) {
                            return params.value;
                        } else {
                            return '';
                            
                        }
                    },
                    position: 'right',
                },
                data:item.data
            })
        });
        option.color = ['#66ff66', '#42a3ea', '#45d5fd'];
        option.legend = {
            data:['人效','台效','坪效'],
            textStyle:{ color:textColor }
        }
    } 
    
    const echartsRef = useRef();
    return (
            <div className={style['card-container']} style={ forReport ? { boxShadow:'none'} : {}}>
                {
                    chartLoading 
                    ?
                    <Loading />
                    :
                    null
                }
                <div className={style['card-title']}>
                    <div>{ cardTitle }</div>
                    <div>                                         
                        <div style={{ top:'2px' }} className={style['float-button-group']}>
                            {
                                forReport 
                                ?
                                null
                                :
                                <Radio.Group size='small' className={style['custom-radio']} value={rank} onChange={e=>{
                                    setRank(e.target.value);
                                }}>
                                    <Radio.Button value="down">降序</Radio.Button>
                                    <Radio.Button value="up">升序</Radio.Button>
                                </Radio.Group>
                            }
                            
                            {
                                forReport 
                                ?
                                null
                                :
                                <Radio.Group size='small' className={style['custom-radio']} style={{ marginLeft:'1rem'}} value='data' onChange={e=>{
                                    let value = e.target.value;
                                    if ( value === 'download' && echartsRef.current ){
                                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
                                        .then(canvas=>{
                                            let MIME_TYPE = "image/png";
                                            let url = canvas.toDataURL(MIME_TYPE);
                                            let linkBtn = document.createElement('a');
                                            linkBtn.download = cardTitle ;          
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
                                        if ( seriesData.length ) {
                                            var aoa = [], thead = ['属性','单位', showTitle, '定额'];                                    
                                            aoa.push(thead);
                                            let unit = showType ? showType === 'cost' ? '元' : energyInfo.unit : '元/万元';
                                            categoryData.forEach((attr,index)=>{
                                                let temp = [];
                                                temp.push(attr);
                                                temp.push(unit);
                                                temp.push( showType === 'cost' ? data[attr].cost : data[attr].sumUsage);
                                                temp.push( showType === 'cost' ? data[attr].quotaCost : data[attr].quotaUsage);
                                                aoa.push(temp);
                                            })
                                        
                                            var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                            sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                            downloadExcel(sheet, cardTitle + '.xlsx' );
                                        } else {
                                            message.info('数据源为空')
                                        }
                                        
                                    }
                                }}>
                                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                                </Radio.Group>
                            }                    
                                
                            
                        </div>
                                          
                    </div>
                </div>
                <div className={style['card-content']} style={{ padding:'0' }}>                 
                    <ReactEcharts
                        notMerge={true}
                        style={{ width:'100%', height:'100%' }}
                        ref={echartsRef}
                        option={{
                            tooltip: { trigger:'axis' },
                            grid: {
                                top:40,
                                left:20,
                                right:20,
                                bottom:40,
                                containLabel: true
                            },
                            dataZoom:[
                                {
                                    show:true,
                                    startValue:0,
                                    endValue: multi ? 5 : 10
                                }
                            ],
                            xAxis: {
                                type: 'category',
                                data:categoryData,
                                splitLine:{
                                    show:false
                                },
                                axisTick:{
                                    show:false
                                },
                                axisLabel:{
                                    color:textColor
                                }
                            },
                            yAxis: {
                                type: 'value',
                                name:showType === 'cost' ? '元' : energyInfo.unit,
                                splitLine:{
                                    show:true,
                                    lineStyle:{
                                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                    }
                                },
                                axisTick:{ show:false },
                                axisLabel:{ color:textColor },
                            },
                            series:seriesData
                        }}
                    />                                      
                </div>
            </div>
        
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.chartLoading !== nextProps.chartLoading || prevProps.showType !== nextProps.showType || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RegionQuotaChart, areEqual);
