import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Pagination, Modal } from 'antd';
import { EyeOutlined, LeftOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import Loading from '@/pages/components/Loading';
import style from './EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import Icons from '../../../public/mach-types.png';
import EleMachDetail from './components/EleMachDetail';
import WaterMachDetail from './components/WaterMachDetail';
// import CameraManager from './CameraManager';

const iconsMap = {
    '0':0,
    '1':1,
    '2':2,
    '3':3,
    '4':3,
    '5':5,
    '7':3,
    '8':3
};

function TerminalMach({ dispatch, user, highVol }){
    const { authorized, containerWidth, theme } = user;
    const { typeList, meterList, detailInfo, total, currentPage, currentType, isLoading, machLoading } = highVol;
    const [info, setInfo] = useState({});
    useEffect(()=>{
        dispatch({ type:'highVol/initMeters'});
        return ()=>{
        }
    },[authorized])
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>硬件种类</div>
                <div className={IndexStyle['card-content']}>
                    <div className={user.theme === 'dark' ? style['list-container'] + ' ' + style['dark'] : style['list-container']}>
                        {
                            typeList && typeList.length 
                            ?
                            typeList.map((item,index)=>(
                                <div key={index} className={ currentType === item.key ? style['list-item'] + ' ' + style['selected']: style['list-item']} onClick={()=>{
                                    dispatch({ type:'highVol/setCurrentType', payload:item.key });
                                    dispatch({ type:'highVol/fetchMeterList'});
                                }}>
                                    <div style={{ display:'inline-flex' }}>
                                        {/* <div style={{ width:'24px', height:'24px', backgroundRepeat:'no-repeat', backgroundSize:'cover', backgroundImage:`url(${Icons})`}}></div> */}
                                        { item.title }
                                    </div>
                                    <div>{ item.count }</div>
                                </div>
                            ))
                            :
                            <Spin className={style['spin']} size='large' />
                        }
                    </div>
                </div>
            </div>
    );
    const content = (
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div className={IndexStyle['card-container']} style={{ padding:'1rem' }}>
                        <div className={ user.theme === 'dark' ? style['inline-container'] + ' ' + style['dark'] : style['inline-container']} >
                            <div className={style['inline-container-main']}>
                                {
                                    meterList.length 
                                    ?
                                    meterList.map((item,index)=>(
                                        <div className={style['inline-item-wrapper']} style={{ width:user.containerWidth <= 1440 ? '33.3%' : '25%' }} key={index}>
                                            <div className={style['inline-item']} onClick={()=>{
                                                setInfo(item);
                                            }}>
                                                <div className={style['inline-item-title']} style={{ padding:'0 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                                    <div>{ item.attrName }</div>
                                                    {/* <div className={style['tag']} style={{ backgroundColor:item.rule_name ? '#ff2d2e' : '#01f1e3'}}>{ item.rule_name ? '异常' :'正常' }</div> */}
                                                </div>
                                                <div className={style['inline-item-content']}>
                                                    <div style={{ width:'46%' }}><img src={item.img} style={{ width:'100%' }} /></div>                                                 
                                                    <div style={{ width:'54%' }}>
                                                        <div className={style['text-container']}>
                                                            <span>编号:</span>
                                                            <span className={style['text']}>{ item.registerCode }</span>
                                                        </div>
                                                        <div className={style['text-container']}>
                                                            <span>支路:</span>
                                                            <span className={style['text']}>{ item.fieldName }</span>
                                                        </div>
                                                        <div className={style['text-container']}>
                                                            <span>区域:</span>
                                                            <span className={style['text']}>{ item.regionName }</span>
                                                        </div>
                                                        {/* <div className={style['text-container']}>
                                                            <span>告警:</span>
                                                            <span className={style['text']} style={{ color:'#ffa63f' }}>{ item.rule_name || '-- --' }</span>
                                                        </div> */}
                                                    </div>                                                                                                    
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    :
                                    <div className={style['empty-text']}>暂时没有这种设备</div>
                                }
                            </div>
                            {/* 分页符 */}
                            {
                                total > ( containerWidth <= 1440 ? 9 : 12 )
                                ?                                
                                <Pagination className={ theme === 'dark' ? style['custom-pagination'] + ' ' + style['dark'] : style['custom-pagination']} pageSize={ containerWidth <= 1440 ? 9 : 12} current={currentPage} total={total} showSizeChanger={false} onChange={page=>{
                                    dispatch({ type:'highVol/fetchMeterList', payload:{ currentPage:page }});
                                }} />
                                :
                                null
                            }
                        </div>
                    {/* 设备详情modal */}
                    <Modal 
                        visible={Object.keys(info).length ? true : false }
                        footer={null}
                        className={style['custom-modal']}
                        width='80vw'
                        height='80vh'
                        destroyOnClose={true}
                        closable={true}
                        onCancel={()=>setInfo({})}
                    >
                        {
                            info.energyType === 1 
                            ?
                            <EleMachDetail 
                                machLoading={machLoading}
                                dispatch={dispatch}
                                info={info}
                                data={detailInfo}
                            /> 
                            :
                            <WaterMachDetail 
                                machLoading={machLoading}
                                dispatch={dispatch}
                                info={info}
                                data={detailInfo}
                        
                            />  
                        }
                        
                    </Modal>                  
                </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
    
}

export default connect(({ user, highVol })=>({ user, highVol }))(TerminalMach);