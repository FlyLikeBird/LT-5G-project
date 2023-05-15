import React, { useState, useRef, useEffect } from 'react';
import echarts from 'echarts';


let pattern = /\s/g;
// console.log(data);
function LineChart({ xData, yData, unit }){
    
    const containerRef = useRef();
    const echartsRef = useRef();
    let offset = 0.01;
    let timer = null;
    let frameTimer = null;
    let textColor = '#b0b0b0';
    useEffect(()=>{
        if ( containerRef.current ){
            echartsRef.current = echarts.init(containerRef.current);
            let option = {
                tooltip:{
                    trigger:'axis'
                },
                xAxis: {
                    type: 'category',
                    axisTick:{ show:false },
                    data:xData,
                    axisLabel:{
                        color:textColor
                    },
                    axisLine:{
                        show:true,
                        lineStyle:{
                            color:'#c5c5c5'
                        }
                    },
                },
                grid:{
                    top:40,
                    bottom:20,
                    left:20,
                    right:30,
                    containLabel:true
                },
                
                itemStyle:{
                    color:'#ff7b7b',
                },
                yAxis:{
                    type: 'value',
                    axisLabel:{ color:textColor },
                    name:unit,
                    nameTextStyle:{
                        color:textColor
                    },
                    axisLine:{ show:false },
                    axisTick:{ show:false },
                    splitLine:{
                        show:true,
                        lineStyle:{
                            type:'dashed',
                            color:'rgba(0, 0, 0, 0.25)'
                        }
                    }
                },             
                series:[
                    {
                        data:yData,
                        type: 'line',
                        // barWidth:30,
                        symbol:'none',
                        smooth:true,
                        itemStyle:{
                            color:'rgb(255, 153, 55)'
                        },
                        areaStyle:{
                            color: {
                                type: 'linear',
                                x: 0,                 // 左上角x
                                y: 0,                 // 左上角y
                                x2: 0,                // 右下角x
                                y2: 1,                // 右下角y
                                colorStops: [{
                                    offset: 0, color:'rgba(255, 153, 55, 0.85)' // 0% 处的颜色
                                }, {
                                    offset: 1, color: 'rgba(255, 153, 55, 0.05)' // 100% 处的颜色
                                }],
                            },
                            opacity:0.3
                        },
                        label:{
                            formatter:'{b}'
                        }
                    }
                ]
            };
            echartsRef.current.setOption(option);
            function render(){
                let prevOption = echartsRef.current.getOption();          
                // console.log(offset);
                offset += 0.01;
                // console.log(offset);
                if ( offset >= 1 ){
                    window.cancelAnimationFrame(frameTimer);
                    prevOption.series = [prevOption.series[0]];
                    echartsRef.current.setOption(prevOption, true);
                    offset = 0.01;
                    return ;
                }
                let temp = {
                    data:yData,
                    type: 'line',
                    // barWidth:30,
                    symbol:'none',
                    smooth:true,
                    itemStyle:{
                        color: {
                            type: 'linear',
                            x: 0,             
                            y: 0,             
                            x2: 1,            
                            y2: 0,            
                            colorStops: [
                                { offset:0, color:'rgb(255, 153, 55)' },
                                { offset, color:'#fff' },
                                { offset:1, color:'rgb(255, 153, 55)' }
                            ]
                        }
                    },
                    tooltip:{ show:false }
                };
                prevOption.series = [prevOption.series[0], temp];
                echartsRef.current.setOption(prevOption);
                frameTimer = window.requestAnimationFrame(render);
            }
            timer = setInterval(()=>{
                window.cancelAnimationFrame(frameTimer);
                render();
            },4000)
        }
        function handleResize(e){
            if ( echartsRef.current && echartsRef.current.resize ) {
                echartsRef.current.resize();
            }
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            clearInterval(timer);
            cancelAnimationFrame(frameTimer);
            window.removeEventListener('resize', handleResize);
            timer = null;
            frameTimer = null;
        }
    },[])
    return (
        <div ref={containerRef} style={{ height:'100%' }}></div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.xData !== nextProps.xData ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineChart, areEqual);