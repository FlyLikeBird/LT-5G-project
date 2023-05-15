import React, { useState } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Switch, Radio, Button, DatePicker, TimePicker, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import style from './QuarterForm.css';

const { Option } = Select;
let num = 0;


const hourList = [];
for(var i=0;i<=24;i++){
    hourList.push(i);
}

const updateArr = ( value, fields, currentField, type)=>{
    return fields.map(item=>{
        if (item.key === currentField.key ) {
            item[type] = value;
        }
        return item;
    })
}
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
const initialTimeData = { timeType:1, beginTime:'00', endTime:'24', feeRate:0 };

const QuarterForm = ({ dispatch, info, onClose })=>{
    
    const [fields, changeFields] = useState([]);
    const [form] = Form.useForm();
    
    useState(()=>{
        if ( info.currentQuarter ) {
            let { quarterName, beginMonth, endMonth } = info.currentQuarter;
            form.setFieldsValue({
                quarterName,
                beginMonth:beginMonth ? moment(beginMonth,'MM') : null,
                endMonth: endMonth ? moment(endMonth,'MM') : null,
            });
        }
        const finalFields = info.currentQuarter 
        ?
        info.currentQuarter.energyEleRateTimeVOList.map(item=> {
            num++;
            item.key = num;
            return item;
        })
        :
        [{key:num, ...initialTimeData}];
        changeFields(finalFields);
    },[])
    return (    
        <Form 
            {...layout} 
            name="billing-form"
            form={form}
            onFinish={values=>{
                // values['energyRateTimeList'] = fields.map(i=>({ timeType:i.timeType, beginTime:i.beginTime, endTime:i.endTime, feeRate:i.feeRate }));
                values['energyRateTimeList'] = fields;
                values.rateId = info.currentRate.rateId;
                values.beginMonth = values.beginMonth.month() + 1;
                values.endMonth = values.endMonth.month() + 1;
                if ( info.currentQuarter ){
                    values['quarterId'] = info.currentQuarter.quarterId;
                }
                new Promise((resolve, reject)=>{
                    dispatch({ type:'billing/addQuarterAsync', payload:{ resolve, reject, values, forEdit:info.currentQuarter ? true : false }})
                })
                .then(()=>{
                    message.success( (info.currentQuarter ? '修改' : '添加') + '规则成功');
                    onClose();
                })
                .catch(msg=>message.error(msg))
            }}
        >
            <Form.Item name='quarterName' label="季度名称" rules={[{ required: true, message:'季度名称不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='beginMonth' label="开始月份" rules={[{ required:true, message:'开始月份不能为空'}]}>
                <DatePicker locale={zhCN} picker="month" placeholder="选择开始月份" style={{width:'100%'}} />
            </Form.Item>
            <Form.Item name='endMonth' label="结束月份" rules={[{ required:true, message:'结束月份不能为空'}]}>
                <DatePicker locale={zhCN} picker="month" placeholder="选择结束月份" style={{width:'100%'}} />
            </Form.Item>
            <Form.Item label="时段配置">    
                <div>
                    <Button type="primary" onClick={()=>{
                        ++num;
                        changeFields(fields.concat({ key:num, ...initialTimeData }));
                    }}>添加时段</Button>
                    {
                        fields.map((field, index)=>(
                            <div key={field.key} className={style['field-container']}>
                                <Form.Item labelCol={{span:24}} label="时段类型">
                                    <Select value={`${[field.timeType]}`} onChange={ value => changeFields(updateArr( value, fields, field, 'timeType')) }>
                                        <Option value="4">尖时段</Option>
                                        <Option value="1">峰时段</Option>
                                        <Option value="2">平时段</Option>
                                        <Option value="3">谷时段</Option>                                       
                                    </Select>                                                                                                        
                                </Form.Item>
                                <Form.Item labelCol={{span:24}} label="开始时间" >
                                    <Select value={field.beginTime} onChange={ value=> changeFields(updateArr(value, fields, field, 'beginTime'))}>
                                        {
                                            hourList.map((item)=>(
                                                <Option key={item} value={item}>{item}</Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item labelCol={{span:24}} label="结束时间" >
                                    <Select value={field.endTime} onChange={ value=> changeFields(updateArr(value, fields, field, 'endTime'))}>
                                        {
                                            hourList.map((item)=>(
                                                <Option key={item} value={item}>{item}</Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item labelCol={{span:24}} label="费率(元/kwh)" >
                                    <InputNumber 
                                        min={0} 
                                        style={{width:'100%'}} 
                                        value={field.feeRate} 
                                        onChange={ value => changeFields(updateArr( value, fields, field, 'feeRate')) } 
                                    />
                                </Form.Item>
                                {
                                    fields.length !== 1  
                                    ?
                                    <MinusCircleOutlined
                                        style={{marginLeft:'20px'}}
                                        onClick={() => {
                                            let temp = fields.filter(item=>item.key != field.key );
                                            changeFields(temp);
                                        }}
                                    />
                                    :
                                    null
                                }
                            </div>))
                    }
                    </div>
                                       
                                            
            </Form.Item>
            
           
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                <Button type="primary" htmlType="submit">
                    确定
                </Button>
                <Button type="primary" style={{margin:'0 10px'}} onClick={()=>onClose()}>
                    取消
                </Button>
            </Form.Item>
        </Form>
    )
}

export default QuarterForm;