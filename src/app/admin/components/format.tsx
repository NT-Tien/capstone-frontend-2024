'use client';
import React, { useEffect } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Col, Menu, Row } from 'antd';
import Header from './header';


type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'sub1',
        label: 'Quản lý tài khoản',
        icon: <MailOutlined />,
        children: [
            {
                key: 'g1',
                label: 'Item 1',
            },
            {
                key: 'g2',
                label: 'Item 2',
            },
        ],
    },
    {
        key: 'sub2',
        label: 'Navigation Two',
        icon: <AppstoreOutlined />,
        children: [
            { key: '5', label: 'Option 5' },
            { key: '6', label: 'Option 6' },
            {
                key: 'sub3',
                label: 'Submenu',
                children: [
                    { key: '7', label: 'Option 7' },
                    { key: '8', label: 'Option 8' },
                ],
            },
        ],
    },
    {
        type: 'divider',
    },
    {
        key: 'sub4',
        label: 'Navigation Three',
        icon: <SettingOutlined />,
        children: [
            { key: '9', label: 'Option 9' },
            { key: '10', label: 'Option 10' },
            { key: '11', label: 'Option 11' },
            { key: '12', label: 'Option 12' },
        ],
    },
    {
        key: 'grp',
        label: 'Group',
        type: 'group',
        children: [
            { key: '13', label: 'Option 13' },
            { key: '14', label: 'Option 14' },
        ],
    },
];

export default function Format({ children }: { children: React.ReactNode }) {

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
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
                        style={{ width: 256, height: '100%', backgroundColor: '#f0f2f5'}}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        mode="inline"
                        items={items}
                    />
                </Col>
                <Col flex="auto">
                    {children}
                </Col>
            </Row>
        </div>
    );
}