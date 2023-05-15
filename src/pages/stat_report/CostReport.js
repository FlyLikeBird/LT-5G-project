import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Table, Radio, Skeleton, DatePicker, Button, message } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import { downloadExcel } from '@/utils/array';
import XLSX from 'xlsx';
import moment from 'moment';

const { RangePicker } = DatePicker;
let timeList = [];
for(let i=0;i<24;i++){
    timeList.push({ key:i });
}
function MeterReport({ dispatch, user, fields, report }){
    const { authorized, timeType, startDate, endDate, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { isLoading, list, currentPage } = report;
    const [dataType, setDataType] = useState('energy');
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'report/initCostReport' });
        }
    },[authorized]);
   
    const items = allFields.map(( item, index)=>{
        return { 
            label:item.typeName, 
            key:item.energyType,
            children:(           
                item.energyFieldList && item.energyFieldList.length 
                ?
                <Tabs
                    className={style['custom-tabs']}
                    type='card'
                    onChange={activeKey=>{
                        let temp = item.energyFieldList.filter(i=>i.fieldId === activeKey)[0];
                        dispatch({ type:'fields/setCurrentField', payload:temp });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                        })
                        .then((fieldAttrs)=>{
                            dispatch({ type:'report/fetchCostReport'})
                        })
                    }}
                    items={item.energyFieldList.map(field=>{
                        return {
                            label:field.fieldName,
                            key:field.fieldId,
                            children:(
                                treeLoading
                                ?
                                <Spin className={style['spin']} />
                                :
                                <Tree
                                    className={style['custom-tree']}
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onSelect={(selectedKeys, { node })=>{
                                        dispatch({type:'fields/setCurrentAttr', payload:node });
                                        dispatch({ type:'report/fetchCostReport'})
                                    }}
                                />
                            )
                        }
                    })}
                />
                :
                <div style={{ padding:'1rem'}}>
                    <div className={style['text']} >{`${item.typeName}能源类型还没有设置维度`}</div>
                    <div style={{ marginTop:'1rem' }}><Button type="primary" onClick={()=>{
                        history.push('/energy/info_manage/field_manage');
                    }}>添加维度</Button></div>
                </div>                
            )
        }
    })
    const sidebar = (
        <div className={style['card-container']}>        
            <Tabs
                className={style['custom-tabs']}
                items={items}
                activeKey={currentEnergy}
                onChange={activeKey=>{
                    dispatch({ type:'fields/setEnergyType', payload:activeKey });
                    let temp = allFields.filter(i=>i.energyType === activeKey)[0];
                    let field = temp.energyFieldList && temp.energyFieldList.length ? temp.energyFieldList[0] : {};
                    dispatch({ type:'fields/setCurrentField', payload:field });
                    // 更新不同能源的维度属性树
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                    })
                    .then((fieldAttrs)=>{
                        dispatch({ type:'report/fetchCostReport'})
                    })
                }}                
            /> 
        </div>
    );    
    let dateColumns = [];
    if ( timeType === '1' && list.length ) {
        // 月时间周期
        let diff = endDate.diff(startDate, 'month');
        let temp = [];
        for ( let i = 0; i <= diff; i++){
            temp.push(moment(startDate.format('YYYY-MM-DD')).add(i, 'months'));
        }
        let months = temp.map(i=>i.format('YYYY-MM'));
        dateColumns = months.map(item=>({
            title:item,
            dataIndex:'dateDataList',
            width:'120px',
            render:(arr)=>{
                let info = null;
                if ( arr && arr.length ) {
                    info = arr.filter(i=>i.dateTime === item )[0];
                }
                return (
                    <span>{ info ? dataType === 'cost' ? info.sumCost : info.sumUsage : 0}</span>
                )
            }
        }))
    }
    if ( timeType === '2' && list.length ) {
        // 日时间周期
        let diff = endDate.diff(startDate, 'day');
        let addDates = [];
        for ( let i = 0; i <= diff; i++ ){
            addDates.push(moment(startDate.format('YYYY-MM-DD')).add(i, 'days'));
        }
        let dateArr = addDates.map(i=>i.format('YYYY-MM-DD'));
        dateColumns = dateArr.map(item=>({
            title:item,
            dataIndex:'dateDataList',
            width:'120px',
            render:(arr)=>{
                let info = null;
                if ( arr && arr.length ) {
                    info = arr.filter(i=>i.dateTime === item )[0];
                }
                return (
                    <span>{ info ? dataType === 'cost' ? info.sumCost : info.sumUsage : 0}</span>
                )
            }
        }))
    }
    if ( timeType === '3' && list.length ) {
        // 时时间周期
        dateColumns = timeList.map(item=>{
            let key = ( item.key < 10 ? '0' + item.key : item.key )  + ':00';
            return {
                title:key,
                dataIndex:'dateDataList',
                width:'120px',
                render:(arr)=>{
                    let info = null;
                    if ( arr && arr.length ) {
                        info = arr.filter(i=>i.dateTime === key )[0];
                    }
                    return (
                        <span>{ info ? dataType === 'cost' ? info.sumCost : info.sumUsage : 0}</span>
                    )
                }
            }
        })
    }
    let columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { width:'120px', title:'属性', dataIndex:'attrName', ellipsis:true, fixed:'left'  },
        { title:'能源类型', dataIndex:'typeName', width:'80px' },
        { title:'单位', dataIndex:'unit', width:'60px' },
        { title:`${dataType === 'cost' ? '成本' : '能耗'}汇总`, width:'120px', dataIndex:dataType === 'cost' ? 'totalCost' : 'totalUsage' },
        ...dateColumns
    ];
    
    const content = (     
        <div style={{ position:'relative' }}>
            {
                isLoading
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px', display:'flex', justifyContent:'space-between' }}>
                <div>
                    <Radio.Group className={style['custom-radio']} style={{ marginRight:'1rem' }} value={dataType} onChange={e=>setDataType(e.target.value)}>
                        <Radio.Button value='cost'>成本</Radio.Button>
                        <Radio.Button value='energy'>能耗</Radio.Button>
                    </Radio.Group>
                    <CustomDatePicker onDispatch={()=>dispatch({ type:'report/fetchCostReport'})} />
                </div>
                <Button type='primary' onClick={()=>{
                    if ( list.length ) {
                        let fileTitle = '成本报表';
                        var aoa = [], thead = [];
                        columns.forEach(i=>thead.push(i.title));
                        aoa.push(thead);
                        list.forEach((item,index)=>{
                            let temp = [];
                            temp.push(index + 1);
                            columns.forEach(col=>{
                                if ( col.dataIndex) {
                                    if ( col.dataIndex === 'dateDataList' ) {
                                        let info = item['dateDataList'].filter(i=>i.dateTime === col.title)[0];
                                        temp.push( info ? dataType === 'cost' ? info.sumCost : info.sumUsage : 0 );
                                    } else {
                                        temp.push(item[col.dataIndex]);
                                    }
                                }
                            })                           
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    } else {
                        message.info('数据源为空');
                    }
                }}>导出报表</Button>
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)'}}>
                <Table
                    dataSource={list}
                    bordered={true}
                    rowKey='attrId'
                    className={style['self-table-container']}
                    columns={columns}
                    scroll={{ x:'1000px' }}
                    locale={{ emptyText:(<div style={{ margin:'1rem 0'}}>成本报表为空</div>) }}
                    pagination={{ total:list.length, current:currentPage, pageSize:12, showSizeChanger:false  }}
                    onChange={pagination=>{
                        dispatch({ type:'report/setCurrentPage', payload:pagination.current })
                    }}
                />
            </div>
        </div>
    );
   
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, report })=>({ user, fields, report }))(MeterReport);