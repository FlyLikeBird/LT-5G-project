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
    day,
    record,
    handleSave,
    sourceData,
    setSourceData,
    ...restProps
})=>{
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext(EditableContext);
    const formItemName = month ? month : day ? day : dataIndex;
    let prevValue = 0;
    if ( record && dataIndex ) {
        prevValue = record[dataIndex] || [];
        if ( month ) {
            let temp = prevValue.filter(i=>i.month === month)[0];
            prevValue = temp ? temp.fillValue : 0;
        }
        if ( day ) {
            let temp = prevValue.filter(i=>i.day === day )[0];
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
            // 当值没有变化不请求接口
            if( +values[formItemName] === +prevValue ) {
                setEditing(false);
                return;
            }
            handleSave(values, record, dataIndex, month, day)
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
            <Form.Item style={{ margin:'0' }} name={ day ? day : month ? month : dataIndex } >
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
function ManualTable({ onDispatch, data, mode, currentDate, currentPage, currentType }){
    let dateColumns = [];
    let dateArr = currentDate.format('YYYY-MM-DD').split('-');
    if ( mode === 1 ) {
        let endDateArr = currentDate.endOf('month').format('YYYY-MM-DD').split('-');
        let endDate = endDateArr['2'];
        let sumDays = [];
        for( let i=1;i <= endDate; i++){
            sumDays.push(i);
        } 
        dateColumns = sumDays.map(item=>{
            return {
                title:dateArr[1] + '月' + '-' + item + '号',
                dataIndex:'dayFillValues',
                day:item,
                width:'120px',
                editable:true,
                render:(arr)=>{
                    let obj = null;
                    if ( arr && arr.length ) {
                        obj = arr.filter(i=>i.day === item )[0];
                    }
                    return (<span>{ obj ? obj.fillValue : 0 }</span>);
                }
            }
        })
    }
    if ( mode === 2 ) {
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
    if ( mode === 3 ) {
        dateColumns = [
            {
                title:dateArr[0] + '年',
                dataIndex:'fillValue',
                editable:true,
                render:value=>(<span>{ value || 0 }</span>)
            }
        ]
    } 
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { title: '填报主体', dataIndex:'attrName', width:'160px', ellipsis:true, fixed:'left'  },
        { 
            title:'填报类别',
            width:'160px',
            fixed:'left',
            render:(row)=>(<span>{ currentType.type_name + '(' + currentType.unit + ')' }</span>)
        },
        ...dateColumns
    ]; 
    const handleSave = (values, record, dataIndex, month, day)=>{
        // console.log(values, record, dataIndex, month, day);
        return new Promise(( resolve, reject)=>{
            values.attrId = record.attrId;
            values.attrName = record.attrName;
            values.fillValue = day ? values[day] : month ? values[month] : values[dataIndex];
            values.month = month;
            values.day = day;
            values.fillId = record.fillId;
            if ( day ){
                let dayFillValues = record.dayFillValues || [];
                let obj = dayFillValues.filter(i=>i.day === day )[0];
                values.fillId = obj ? obj.fillId : null;
               
            }
            if ( month ) {
                let monthFillValues = record.monthFillValues;
                let obj = monthFillValues.filter(i=>i.month === month )[0];
                values.fillId = obj ? obj.fillId : null;
            } 
            onDispatch({ type:'fill/addFillAsync', payload:{ values, resolve, reject }})
            .then(()=>{
                message.success('设置填报信息成功');
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
                day:col.day,
                handleSave
            })
        }
    });
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
                emptyText:<div style={{ margin:'1rem 2rem' }}>还没有设置填报信息</div>
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
export default React.memo(ManualTable, areEqual);