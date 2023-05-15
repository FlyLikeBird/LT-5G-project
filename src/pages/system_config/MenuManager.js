import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Modal, Menu, Tree, Select, Button, Popconfirm, message, Table  } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import RoleForm from './components/RoleForm';
import MenuForm from './components/MenuForm';
import IndexStyle from '../IndexPage.css';
import style from './SystemConfig.css';

const { Option } = Select;

function MenuManager({ dispatch, user, userList }){
    const { authorized, theme } = user;
    const { menuList, openMenus, currentMenu } = userList;

    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'userList/fetchMenuList'});
        }
    },[authorized]);
    useEffect(()=>{
        return ()=>{
            
        }
    },[]);
    return (
        <div className={IndexStyle['page-container']}>
            <div className={IndexStyle['card-container-wrapper']} style={{ width:'20%', paddingBottom:'0' }}>
                <div className={IndexStyle['card-container']}>
                    <div className={IndexStyle['card-title']}>菜单列表</div>
                    <div className={IndexStyle['card-content']}>
                        <Tree
                            className={style['tree-container'] + ' ' + ( theme === 'dark' ? style['dark'] : '')}
                            expandedKeys={openMenus}
                            treeData={menuList}
                            selectedKeys={[currentMenu.menuId]}
                            onSelect={function(selectedKeys, { node }){
                                dispatch({ type:'userList/setCurrentMenu', payload:node });
                            }}    
                        /> 
                    </div>
                </div>
            </div>
            <div className={IndexStyle['card-container-wrapper']} style={{ width:'40%', paddingBottom:'0' }}>
                <div className={IndexStyle['card-container']}>
                    <div className={IndexStyle['card-title']}>
                        <div>菜单配置</div>
                        <Button type='primary' onClick={()=>dispatch({ type:'userList/setCurrentMenu', payload:{}})}>新建菜单</Button>
                    </div>
                    <div className={IndexStyle['card-content']} style={{ padding:'2rem' }}>
                        <MenuForm
                            theme={theme}
                            menuList={menuList}
                            currentMenu={currentMenu} 
                            onDispatch={action=>dispatch(action)}
                            onToggleAdding={value=>setAdding(value)}
                        />
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default connect(({ user, userList })=>({ user, userList }))(MenuManager);