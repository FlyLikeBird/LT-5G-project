import React, { useRef } from 'react';
import { message } from 'antd';
import ReactEcharts from 'echarts-for-react';


function getNodesDeep(node, nodes, links, parentNode, deep = 0){
    let obj = {
        name:node.attrName,
        key:node.attrId,
        depth:deep,
        ele_cost:Math.floor(node.cost),
        ele_energy:Math.floor(node.sumUsage)
    }
    nodes.push(obj);
    if ( parentNode ){
        links.push({ source:parentNode.name, target:node.attrName, value:Math.floor(node.cost), ele_cost:Math.floor(node.cost), ele_energy:Math.floor(node.sumUsage) })
    }
    parentNode = obj;
    if ( node.children && node.children.length ){
        node.children.forEach(item=>{
            let temp = deep;
            ++temp;
            getNodesDeep(item, nodes, links, parentNode, temp)
        })
    }
}

let levels = [{
    depth: 0,
    itemStyle: {
        color: '#219afa'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#219afa' // 0% 处的颜色
            }, {
                offset: 1, color: '#e24466' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 1,
    itemStyle: {
        color: '#e24466'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#e24466' // 0% 处的颜色
            }, {
                offset: 1, color: '#693be7' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 2,
    itemStyle: {
        color: '#693be7'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#693be7' // 0% 处的颜色
            }, {
                offset: 1, color: '#45e46b' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 3,
    itemStyle: {
        color: '#45e46b'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#45e46b' // 0% 处的颜色
            }, {
                offset: 1, color: '#decbe4' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}];

function FlowChart({ data, theme, energyInfo, dispatch }){
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#fff' : '#000';
    let nodes = [], links = [];
    getNodesDeep(data, nodes, links);
    // console.log(JSON.stringify(nodes));
    // console.log(JSON.stringify(links));
    // console.log(nodes);
    // console.log(links);
    const onEvents = {
        'click':(params)=>{
            // console.log(params);
            if(params.dataType === 'node' && params.type === 'click'){
                new Promise((resolve, reject)=>{
                    dispatch({ type:'efficiency/fetchSankeyChart', payload:{ resolve, reject, clickNode:{ title:params.data.name, key:params.data.key, depth:params.data.depth } }});
                })
                .then((msg)=>{
                    message.info(msg);
                })
                .catch(msg=>message.error(msg));
            }
        }
    };
    
    return (
        
            <ReactEcharts
                notMerge={true}
                onEvents={onEvents}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        trigger:'item',
                        triggerOn:'mousemove',
                        formatter:(params)=>{
                            if ( params.data.source && params.data.target ) {
                                return `${params.data.source} -- ${params.data.target}:<br/>能耗值:${params.data.ele_energy}kwh<br/>成本:${params.data.ele_cost}元`;
                            } else if ( params.data.name ){
                                return `${params.data.name}:<br/>能耗值:${params.data.ele_energy}kwh<br/>成本:${params.data.ele_cost}元`;
                            }
                        }
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {
                                backgroundColor:theme === 'dark' ? '#191a2f' : '#fff'
                            }
                        }
                    },
                    series:[
                        {
                            type:'sankey',
                            top:40,
                            nodeWidth:24,
                            nodeGap:12,
                            layoutIterations:0,
                            focusNodeAdjacency: true,
                            itemStyle: {
                                borderWidth: 0,
                                borderColor: '#fff',
                                color: '#2c3b4d'
                            },
                            lineStyle: {
                                show: true,
                                width: 1,
                                opacity: 0.8,
                                curveness: 0.7, //桑基图边的曲度
                                type: 'solid',
                                color: '#57e29f'
                            },
                            label:{
                                color:textColor,
                                padding:[10,0,10,0],
                                formatter:params=>{
                                    return `${params.data.name}(${params.data.ele_energy}${energyInfo.unit})`
                                }
                            },
                            data:nodes,
                            links:links,
                            levels:levels,
                            lineStyle: {
                                curveness: 0.5
                            }
                        }
                    ]
                }}
            />
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(FlowChart, areEqual);