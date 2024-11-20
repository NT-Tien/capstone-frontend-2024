"use client"

import { Spin } from "antd"

function PageLoader() {
    return (
        <div className='h-screen w-screen grid place-items-center'>
            <Spin tip={<div className='mt-2 text-lg'>Vui lòng chờ đợi</div>} size="large" className="">
                <div className='w-56 bg-white'></div>
            </Spin>
        </div>
    )
}

export default PageLoader