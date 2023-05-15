import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Breadcrumb, Dropdown } from 'antd';
import UserForm from './components/UserForm';

const UserCenter = ({ dispatch, user, userList }) => {
    const { companyList, userInfo } = user;
    const { roleList } = userList;
    return (
        <div style={{width:'800px', margin:'0 auto', padding:'40px'}}>  
            <UserForm 
                companyList={companyList}
                roleList={roleList}
                userForm={userInfo}
                forEdit={true}
                onAdd={payload=>dispatch({type:'userList/add', payload})}
                onVisible={()=>{}}
            />
        </div>
    );
}

UserCenter.propTypes = {
};

export default connect(({user, userList}) => ({user, userList}))(UserCenter);