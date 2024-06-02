'use client';
import React, { useEffect } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Col, Menu, Row } from 'antd';
import Header from './header';
import { useRouter } from 'next/navigation'


type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'sub1',
        label: 'Quản lý tài khoản',
        icon: <MailOutlined />,
        children: [
            {
                key: '/admin/page/account/list',
                label: 'Danh sách tài khoản',
            },
            {
                key: '/admin/page/account/add',
                label: 'Thêm tài khoản',
            },
        ],
    },
    {
        key: 'sub2',
        label: 'Quản lý khu vực',
        icon: <AppstoreOutlined />,
        children: [
            { key: 'b1', label: 'Danh sách khu vực' },
            { key: 'b2', label: 'Thêm khu vực' },
        ],
    },
    {
        type: 'divider',
    },
    {
        key: 'sub3',
        label: 'Thiết bị và vị trí',
        icon: <SettingOutlined />,
        children: [
            { key: '9', label: 'Quản lý thiết bị' },
            { key: '10', label: 'Cập nhật vị trí' },
            { key: '11', label: 'Quản lý thông tin lỗi' },
        ],
    },
    {
        key: 'grp',
        label: 'Group',
        type: 'group',
        children: [
            { key: '13', label: 'Import data' },
            { key: '14', label: 'Export data' },
        ],
    },
];

export default function Format({ children }: { children: React.ReactNode }) {

    const router = useRouter()

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
        router.push(e.key);
    };

    useEffect(() => {
        // check role to redirect
        var payload = localStorage.getItem("user");
        if (payload) {
            var user = JSON.parse(payload);
            if (user.role !== "admin") {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    return (
        <div style={{height: '100vh'}}>
            <Row style={{height: '10vh'}}>
                <Header />
            </Row>
            <Row style={{height: '90vh'}}>
                <Col>
                    <Menu
                        onClick={onClick}
                        style={{ width: 256, height: '100%', backgroundColor: '#f0f2f5', userSelect: 'none'}}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1', 'sub2', 'sub3']}
                        mode="inline"
                        items={items}
                    />
                </Col>
                <Col flex="auto" style={{padding: '3rem'}}>
                    {children}
                </Col>
            </Row>
        </div>
    );
}