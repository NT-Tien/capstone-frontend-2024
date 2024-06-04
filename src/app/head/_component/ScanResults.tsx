import React from 'react'
import { Button, Card, NavBar, Space, Toast } from 'antd-mobile'
import { SearchOutline, MoreOutline, CloseOutline, AntOutline, RightOutline } from 'antd-mobile-icons'

const ScanResults = () => {



    const onClick = () => {
        Toast.show('点击了卡片')
    }

    const onHeaderClick = () => {
        Toast.show('点击了卡片Header区域')
    }

    const onBodyClick = () => {
        Toast.show('点击了卡片Body区域')
    }
    const right = (
        <div style={{ fontSize: 24 }}>
            <Space style={{ '--gap': '16px' }}>
                <MoreOutline />
            </Space>
        </div>
    )




    const back = () =>
        Toast.show({
            content: '点击了返回区域',
            duration: 1000,
        })



    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF7FF', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                <NavBar
                    onBack={back}
                    right={right}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                >
                    Scan Results
                </NavBar>
            </div>
            <div>
                <Card
                    title={
                        <div style={{ fontWeight: 'normal' }}>
                            <AntOutline style={{ marginRight: '4px', color: '#1677ff' }} />
                            卡片标题
                        </div>
                    }
                    extra={<RightOutline />}
                    onBodyClick={onBodyClick}
                    onHeaderClick={onHeaderClick}
                    style={{ borderRadius: '16px' }}
                >
                    <div >卡片内容</div>
                    <div onClick={e => e.stopPropagation()}>
                        <Button
                            color='primary'
                            onClick={() => {
                                Toast.show('点击了底部按钮')
                            }}
                        >
                            底部按钮
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default ScanResults