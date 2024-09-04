"use client"

import { RightOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-components"
import { Button, Card } from "antd"
import ApprovedOrRejectedRequests from "./components/ApprovedOrRejectedRequests"
import TodayRequests from "./components/TodayRequests"
import WarrantyOrFixRequests from "./components/WarrantyOrFixRequestsToday"
import HowMuchOfEveryStatus from "./components/HowMuchOfEveryStatus"

function Page() {
   return (
      <PageContainer>
         <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7">
               <Card>
                  <header className="flex justify-between">
                     <div>
                        <h2 className="text-lg font-semibold">Yêu cầu hôm nay</h2>
                     </div>
                     <Button type="primary" icon={<RightOutlined />} iconPosition="end">
                        Xem thêm
                     </Button>
                  </header>

                  <div className="mt-layout grid grid-cols-3 gap-3">
                     <TodayRequests />
                  </div>
               </Card>
               <div className="mt-3 flex gap-3">
                  <WarrantyOrFixRequests />
                  <ApprovedOrRejectedRequests />
               </div>
            </div>
            <div className="col-span-5">
               <Card>
                  <HowMuchOfEveryStatus />
               </Card>
            </div>
         </div>
      </PageContainer>
   )
}

export default Page
