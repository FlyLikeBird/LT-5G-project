import React, { useEffect } from 'react';
import { Drawer, Tree, Button, message } from 'antd';

function PermissionTree({ onDispatch, visible, info, onToggleVisible, menuList, selectedKeys }){
    // console.log(menuList);
    // console.log(selectedKeys);
 
    useEffect(()=>{
        if ( visible ) {
            onDispatch({ type:'userList/fetchRolePermission', payload:{ roleId:info.current.roleId }});
        }
    },[info])
    return (
        <Drawer
            title="菜单权限设置"
            placement="right"
            zIndex={1002}
            closable={false}
            width="40%"
            onClose={()=>onToggleVisible(false)}
            visible={ visible }
            footer={(
                <div style={{ padding:'10px' }}>
                    <Button type='primary' style={{ marginRight:'1rem' }} onClick={()=>{
                        new Promise((resolve, reject)=>{
                            onDispatch({ type:'userList/setRolePermissionAsync', payload:{ resolve, reject, roleId:info.current.roleId }})
                        })
                        .then(msg=>{
                            message.success('设置角色菜单权限成功');
                            onToggleVisible(false);
                        })
                        .catch(msg=>message.error(msg))
                    }}>确定</Button>
                    <Button onClick={()=>onToggleVisible(false)}>取消</Button>
                </div>
            )}
        >   
            <Tree
                // className={style['tree-container']}
                checkable
                checkStrictly
                defaultExpandAll
                treeData={menuList}
                checkedKeys={selectedKeys}
                onCheck={( checkedKeys, { checkedNodes, node, checked })=>{
                    let temp = checkedKeys.checked;
                    if ( node.children ){
                        if ( checked ){
                            node.children.forEach(item=>{
                                if ( !temp.includes(item.key)) {
                                    temp.push(item.key);
                                }
                            })
                        } else {
                            node.children.map(i=>{
                                let index = temp.indexOf(i.key);
                                if ( index >= 0 ) temp.splice(index, 1);
                            })
                        }
                    }
                    onDispatch({ type:'userList/setSelectedKeys', payload:{ selectedKeys:temp }});
                }}
            />       
        </Drawer>
    )
}

function areEqual(prevProps, nextProps){
    if ( 
        prevProps.visible !== nextProps.visible 
        || prevProps.menuList !== nextProps.menuList 
        || prevProps.selectedKeys !== nextProps.selectedKeys 
        || prevProps.info !== nextProps.info 
        ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(PermissionTree, areEqual);