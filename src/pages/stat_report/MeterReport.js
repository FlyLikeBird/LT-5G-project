import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Table, Skeleton, DatePicker, Button, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import { downloadExcel } from '@/utils/array';
import XLSX from 'xlsx';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
function MeterReport({ dispatch, user, fields, report }){
    const { authorized, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { isLoading, list, currentPage } = report;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'report/initMeterReport'});
            
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
                            dispatch({ type:'report/fetchMeterReport'})
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
                                        dispatch({ type:'report/fetchMeterReport'})
                                    }}
                                />
                            )
                        }
                    })}
                />
                :
                <div style={{ padding:'1rem'}}>
                    <div>{`${item.typeName}能源类型还没有设置维度`}</div>
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
                        dispatch({ type:'report/fetchMeterReport'})
                    })
                }}                
            /> 
        </div>
    );
    let columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { width:'120px', title:'属性', dataIndex:'attrName' },
        { title:'能源类型', dataIndex:'typeName' },
        { title:'能源单位', dataIndex:'unit' },
        { title:'表计名称', dataIndex:'meterName', render:value=>(<span>{ value || '--' }</span>) },
        { title:'期初表码', dataIndex:'startValue', render:value=>(<span style={{ color:'#1890ff' }}>{ value || 0 }</span>) },
        { title:'期末表码', dataIndex:'endValue', render:value=>(<span style={{ color:'#1890ff' }}>{ value || 0 }</span>)},
        { title:'用量', dataIndex:'dosage', render:value=>(<span style={{ color:'#1890ff' }}>{ value || 0 }</span>)},
    ]
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
                <CustomDatePicker onDispatch={()=>dispatch({ type:'report/fetchMeterReport'})} />
                <Button type='primary' onClick={()=>{
                    if ( list.length ) {
                        let fileTitle = '抄表记录';
                        var aoa = [], thead = [];
                        columns.forEach(i=>thead.push(i.title));
                        aoa.push(thead);
                        list.forEach((item,index)=>{
                            let temp = [];
                            temp.push(index + 1);
                            columns.forEach(col=>{
                                if ( col.dataIndex) {
                                    temp.push(item[col.dataIndex]);
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
                    rowKey='machId'
                    className={style['self-table-container']}
                    columns={columns}
                    locale={{ emptyText:(<div style={{ margin:'1rem 0'}}>抄表记录为空</div>) }}
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