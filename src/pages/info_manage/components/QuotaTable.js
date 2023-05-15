import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Form, Input, message } from 'antd';
import style from '@/pages/IndexPage.css';

const EditableContext = React.createContext();
const EditableRow = ({ index, ...props}) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}
const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    month,
    record,
    handleSave,
    sourceData,
    setSourceData,
    ...restProps
})=>{
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext(EditableContext);
    const formItemName = month ? month : dataIndex;
    let prevValue = 0;
    if ( record && dataIndex ) {
        prevValue = record[dataIndex];
        if ( month ) {
            let temp = prevValue.filter(i=>i.month === month)[0];
            prevValue = temp ? temp.fillValue : 0;
        }
    }
    const handleEdit = ()=>{
        setEditing(true);
        form.setFieldsValue({
            [formItemName]:prevValue
        });
    };
    const save = ()=>{
        form.validateFields()
        .then(values=>{ 
            if( +values[formItemName] === +prevValue ) {
                setEditing(false);
                return;
            }
            handleSave(values, record, dataIndex, month)
            .then(()=>setEditing(false))
        })
        .catch(err=>{
            console.log(err);
        })
    }
    useEffect(()=>{
        if(editing){
            inputRef.current.focus();
        }
    },[editing]);
    let childNode = children;
    if ( editable ) {
        childNode = editing ? (
            <Form.Item style={{ margin:'0' }} name={ month ? month : dataIndex } >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        )
        :
        (
            <div className='editable-cell-value-wrapper' onClick={handleEdit}>
                { children }
            </div>
        )
    }
    return <td {...restProps}>{ childNode }</td>
}
const months = [];
for(var i=1;i<=12;i++){
    months.push(i);
}
function QuotaTable({ onDispatch, data, mode, year, onChangeYear, currentPage, total, currentType, }){
    let dateColumns = [];
    if ( mode === 1 ) {
        dateColumns = months.map(item=>{
            return {
                title:item + '月',
                dataIndex:'monthFillValues',
                month:item,
                width:'120px',
                editable:true,
                render:(arr)=>{
                    let obj = null;
                    if ( arr && arr.length ){
                        obj = arr.filter(i=>i.month === item )[0];
                    }
                    return (<span>{ obj ? obj.fillValue : 0 }</span>)
                }
            }
        })
    }
    if ( mode === 2 ) {
        dateColumns = [
            {
                title:year + '年',
                dataIndex:'fillValue',
                editable:true,
                render:value=>(<span>{ value || 0 }</span>)
            }
        ]
    } 
    const columns = [
        {
            title:'序号',
            width:'50px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { title: '定额主体', dataIndex:'attrName', width:'160px', ellipsis:true, fixed:'left'  },
        { 
            title:'定额类别',
            width:'160px',
            fixed:'left',
            render:(row)=>(<span>{ currentType.typeName + '(' + currentType.unit + ')' }</span>)
        },
        ...dateColumns
    ]; 
    const handleSave = (values, record, dataIndex, month)=>{
        // console.log(values, record, dataIndex, month);
        return new Promise(( resolve, reject)=>{
            values.attrId = record.attrId;
            values.attrName = record.attrName;
            values.fillValue = month ? values[month] : values[dataIndex];
            values.month = month;
            if ( month ) {
                let obj = record.monthFillValues.filter(i=>i.month === month )[0];
                values.fillId = obj ? obj.fillId : null;
            } else {
                values.fillId = record.fillId;
            }
            onDispatch({ type:'quota/fillQuotaAsync', payload:{ values, resolve, reject }})
            .then(()=>{
                message.success('设置定额信息成功');
            })
            .catch(msg=>message.error(msg))
        })
    }
    const mergedColumns = columns.map(col=>{
        if(!col.editable){
            return col;
        }
        return {
            ...col,
            onCell: record=>({
                record,
                editable:col.editable,
                dataIndex:col.dataIndex,
                title:col.title,
                month:col.month,
                handleSave
            })
        }
    });
    // console.log(data);
    return (
        <Table
            className={style['self-table-container'] + ' ' + style['dark']}
            style={{ padding:'1rem' }}
            columns={mergedColumns}
            dataSource={data}
            bordered={true}
            components={{
                body:{
                    row:EditableRow,
                    cell:EditableCell
                }
            }}
            scroll={{ x:'1000px' }}
            pagination={{ total:data.length, pageSize:12, showSizeChanger:false }}
            locale={{
                emptyText:<div style={{ margin:'1rem 2rem' }}>还没有设置定额信息</div>
            }}
            rowKey="attrId"
        /> 
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(QuotaTable, areEqual);