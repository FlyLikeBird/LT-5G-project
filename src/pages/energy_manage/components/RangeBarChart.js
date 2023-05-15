import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

let linearColor = {
    color: {
        type: 'linear',
        x: 0,                 // 左上角x
        y: 0,                 // 左上角y
        x2: 0,                // 右下角x
        y2: 1,                // 右下角y
        colorStops: [{
            offset: 0, color:'#7446fe' // 0% 处的颜色
        }, {
            offset: 1, color: '#0b9dff' // 100% 处的颜色
        }],
    },
    barBorderRadius:6
}
// chain同比 yoy环比

function RangeBarChart({ data, energyInfo, showType, onDispatch, theme, forWater, forReport }) {
    const echartsRef = useRef();
    const [timeType, setTimeType] = useState( forReport ? '2' : '3');
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let showTitle = showType === 'cost' ? '成本' :'能耗'; 
    let seriesData = [], dateArr = [], valueData = [], chainData = [], yoyData = [];
    Object.keys(data).sort((a,b)=>{
        //  时间维度排序，3/小时  2/日  1/月
        if ( timeType === '3' ) {
            let prev = a.split(':')[0];
            let next = b.split(':')[0];
            return +prev < +next ? -1 : 1;
        } else {
            return new Date(a).getTime() < new Date(b).getTime() ? -1 : 1;
        }
    }).forEach(key=>{
        let { cost, sumUsage, timeCostChain, timeUsageChain, timeCostYoy, timeUsageChYoy } = data[key]
        dateArr.push(key);
        valueData.push( showType === 'cost' ? cost : sumUsage );
        chainData.push( showType === 'cost' ? timeCostChain : timeUsageChain );
        yoyData.push( showType === 'cost' ? timeCostYoy : timeUsageChYoy );
    });
   
    // let seriesData = 
    //     //  如果是总能源 ，显示正常柱状图
    //     // energyInfo.type_id === 0 
    //     // ?
    //     [ { type:'bar', barMaxWidth:10, data:data.cost, name:`电能源${showTitle}`, itemStyle:linearColor }] 
    //     // :
    //     // // 如果是电能源且是日时间维度/成本维度下， 显示分段折线图来表示峰、平、谷时段的成本
    //     // energyInfo.type_id === 1 && timeType === '3' && showType === '0'
    //     // ?
    //     // [
    //     //     { type:'line', symbol:'none', itemStyle:{ color:'#7a7ab3' }, areaStyle: { opacity:0.2 }, data:data.tipCost ? data.tipCost.map(item=>item?item:null) : [], name:'尖' },
    //     //     { type:'line', symbol:'none', itemStyle:{ color:'#57e29f' }, areaStyle: { opacity:0.2 }, data:data.topCost ? data.topCost.map(item=>item?item:null) : [], name:'峰' },
    //     //     { type:'line', symbol:'none', itemStyle:{ color:'#7446fe' }, areaStyle: { opacity:0.2 }, data:data.middleCost ? data.middleCost.map(item=>item?item:null) : [], name:'平' },
    //     //     { type:'line', symbol:'none', itemStyle:{ color:'#65cae3' }, areaStyle: { opacity:0.2 }, data:data.bottomCost ? data.bottomCost.map(item=>item?item:null) : [], name:'谷' },
    //     // ] 
    //     // :
    //     // // 如果是电能源且是年和月时间维度，显示堆叠柱状图
    //     // energyInfo.type_id === 1 && timeType !== '3' && showType === '0'
    //     // ?
    //     // [ 
    //     //     { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#7a7ab3'}, stack:'电费年度统计', name:'尖', data:data.tipCost },
    //     //     { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#62a4e2'}, stack:'电费年度统计', name:'峰', data:data.topCost },
    //     //     { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#7446fe'}, stack:'电费年度统计', name:'平', data:data.middleCost },
    //     //     { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#f7b645'}, stack:'电费年度统计', name:'谷', data:data.bottomCost },
    //     // ]
    //     // :
    //     // [ 
    //     //     { type:'bar', barMaxWidth:'10', name:`${energyInfo.type_name}能源${showTitle}`, data: showType === '0' ? data.cost : data.energy, itemStyle:linearColor }
    //     // ];
    if ( valueData.length ) {
        seriesData.push({
            type:'bar',
            name:`${energyInfo.typeName}能源${showTitle}`,
            barWidth:10,
            data:valueData,
            itemStyle:linearColor
        })
    }
    // 设置同比参考线
    if ( yoyData.length ) {
        seriesData.push({
            type:'line',
            symbol:'none',
            name:`同比${showTitle}` ,
            itemStyle : { color:'#6fcc17' },
            data:yoyData,
        });
    }
    // 设置环比参考线
    if ( chainData.length ){
        seriesData.push({
            type:'line',
            symbol:'none',
            name:`环比${showTitle}`,
            itemStyle : { color:'#fcc767' },
            data: chainData,
        });
    }
   
    const option = {
        title: {
            text:`${energyInfo.typeName || ''}${showTitle}趋势图`,
            left: 'center',
            top:10,
            textStyle:{ color:textColor }
        },
        legend:{
            top:40,
            left:'center',
            data:[`${energyInfo.typeName }能源${showTitle}`,`环比${showTitle}`,`同比${showTitle}`],
            textStyle:{ color:textColor }
        },
        tooltip: {
            trigger: 'axis',
            // formatter: '{a}:{b}: {c}',
        },
        color:['#65cae3','#2c3b4d','#62a4e2','#57e29f','#f7b645'],                 
        grid: {
            top: 80,
            left: 20,
            right: 40,
            bottom:20,
            containLabel: true
        },
        // dataZoom: [
        //     {
        //         show:true,
        //         bottom:10,
        //         handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        //         handleSize: '80%',
        //         handleStyle: {
        //             color: '#fff',
        //             shadowBlur: 3,
        //             shadowColor: 'rgba(0, 0, 0, 0.6)',
        //             shadowOffsetX: 2,
        //             shadowOffsetY: 2
        //         },
        //         startValue: data.categoryData ? data.categoryData.length-1-( timeType === '3' ? 24 : timeType ==='2' ? 30 : timeType === '1' ? 12 :0) : 0,
        //         endValue: data.categoryData ? data.categoryData.length-1 : 0
        //     }
        // ],
        xAxis: {
            type:'category',
            name: timeType === '1' ? '月' : timeType === '2' ? '日' : timeType === '3' ? '时' : '',
            nameTextStyle:{ color:textColor },
            data:dateArr,
            silent: false,
            splitLine: {
                show: false
            },
            
            axisTick:{ show:false },
            axisLine:{ show:false },
            splitArea: {
                show: false
            },
            axisLabel:{
                show:true,
                color:textColor,
                formatter:(value)=>{
                    if ( timeType === '2') {
                        let strArr = value.split('-');
                        return strArr.length ? strArr[strArr.length-1] : value;
                    } else {
                        return value;
                    }
                }
            }
        },
        yAxis: {
            name: showType === 'cost' ? '(元)' : `(${energyInfo.unit})`,
            nameTextStyle:{ color:textColor },
            type:'value',
            splitArea: {
                show: false
            },
            axisLine:{ show:false },
            axisTick:{ show:false },
            axisLabel:{ color:textColor },
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }
        },
        series: seriesData 
    };
    // 如果是电能源，添加图例
    if ( energyInfo.typeCode === 'ele' ){
        option['legend'].data.push(
            '峰','平','谷','基'
        ) ;
    }
    // 如果是电能源，日维度下，多维度折线图对tooltip做特殊处理
    // if ( timeType === '3' && energyInfo.type_id === 1) {
    //     option.tooltip = {
    //         trigger:'axis',
    //         formatter:(params)=>{
    //             let categoryName = params[0].name;
    //             let html = '';
    //             html += categoryName;
    //             params.forEach((item,index)=>{
    //                 if ( !item.data || item.data.newAdd ) return;
    //                 html += (`<br/>${item.marker + item.seriesName}: ${item.data}`);
    //             })
    //             return html;
    //         }
    //     }
    // }
   
    return (
        <div style={{ height:'100%', position:'relative' }}>
                {
                    forReport 
                    ?
                    null
                    :
                    forWater 
                    ?
                    <div style={{ top:'6px', right:'unset', left:'6px', position:'absolute', zIndex:'2' }}>
                        <CustomDatePicker onDispatch={()=>{
                            onDispatch({ type:'cost/fetchWaterCost' });                  
                        }} />
                    </div>
                    :
                    <Radio.Group style={{ top:'0', right:'unset', left:'0' }} className={style['float-button-group'] + ' ' + style['custom-radio']} size="small" value={timeType} onChange={e=>{
                        setTimeType(e.target.value);
                        onDispatch({ type:'energy/fetchTotalCost', payload:{ timeType:e.target.value }});              
                    }}>
                        <Radio.Button key='1' value='1'>12M</Radio.Button>
                        <Radio.Button key='2' value='2'>30D</Radio.Button>
                        <Radio.Button key='3' value='3'>24H</Radio.Button>
                    </Radio.Group>
                }     
                {
                    forReport 
                    ?
                    null
                    :
                    <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                        let value = e.target.value;
                        let fileTitle = `${energyInfo.typeName }能源${showTitle}`;
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
                            if ( seriesData.length ){
                                var aoa = [], thead = ['对比项','能源类型', '单位'];
                                dateArr.forEach(i=>thead.push(i));
                                aoa.push(thead);
                                seriesData.forEach(i=>{
                                    let temp = [];
                                    temp.push(i.name);
                                    temp.push(energyInfo.typeName);
                                    temp.push(showType === 'cost' ? '元' : energyInfo.unit );
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
                }
                
            
            <ReactEcharts ref={echartsRef} notMerge={true} style={{ width:'100%', height:'100%'}} option={option} />
        </div>    
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RangeBarChart, areEqual);
