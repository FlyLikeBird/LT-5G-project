import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Radio, Form, Upload, message } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import style from './ColumnCollapse.css';

let canDrag = false;
let startX = 0;
let moveX = 0;
function ColumnCollapse({ sidebar, content, user, mode }){
    const pointerRef = useRef();
    const { collapsed, containerWidth, theme } = user;
    const [width, setWidth] = useState(18);
    useEffect(()=>{
        let dom = pointerRef.current;
        if ( dom ){
            const handleMouseDown = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                startX = e.clientX;
                canDrag = true;
            };
            const handleMouseOver = e=>{
                // console.log('mouseover');
                e.stopPropagation();
                e.preventDefault();
                if ( !canDrag ) return;
                moveX = e.clientX - startX ;
                if ( moveX <= 0 ) {
                    setWidth((width)=>{
                        let result = width - 0.3;
                        if ( result < 1 ) {
                            result = 0;
                        }
                        return result;
                    })
                } else {
                    setWidth((width)=>{
                        let result = width + 0.3;
                        if ( result > 50  ) {
                            result = 50;
                        } 
                        return result;
                    })
                }
            }
            const handleMouseUp = e=>{
                e.stopPropagation();
                e.preventDefault();
                canDrag = false;        
            }
            dom.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseOver);
            return ()=>{
                dom.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('mousemove', handleMouseOver);
            }
        }
    },[]);
    return (
        <div className={ mode === 'dark' || theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container']}>
            <div style={{ width:width + '%', paddingRight: width < 1 ? '0' : '1rem', height:'100%' }}>
                <div className={style['sidebar-container']} >
                    {  sidebar }
                    <div className={style['flex-pointer']} ref={pointerRef}></div>             
                </div>
            </div>
            
            <div className={style['content-container']} style={{ width: ( 100 - width) + '%' }}>
                { content }
                {
                    width < 1
                    ?
                    <div 
                        className={style['collapse-button']} 
                        onClick={()=>setWidth(18)} 
                        style={{ 
                            position:'absolute', 
                            left:'0',
                            bottom:'0' 
                        }}>
                        <DoubleRightOutlined />
                    </div>
                    :
                    null
                }              
            </div>
        </div>
               
    )
};

ColumnCollapse.propTypes = {
};

export default connect(({user})=>({ user }))(ColumnCollapse);