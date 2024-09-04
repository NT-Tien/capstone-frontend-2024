"use client"

import CardDataStats from "@/common/components/CardDataStats"
import { PageContainer, StatisticCard } from "@ant-design/pro-components"
import { Card, Statistic } from "antd"
import CountUp from "react-countup"

function Page() {
   return (
      <PageContainer>
         <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7">
               <Card>
                  <h2 className="text-lg font-semibold">Tác vụ hôm nay</h2>
                  <p>
                     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eleifend, libero et lacinia
                     tincidunt, nunc ex lacinia odio, sit amet tincidunt odio erat vel ligula. In hac habitasse platea
                     dictumst. Ut at mi nec mi lacinia ultricies
                  </p>
                  <div className="mt-layout flex gap-3">
                     <Card className="w-full">
                        <Statistic
                           title="Chưa xử lý"
                           value={112893}
                           precision={2}
                           formatter={(value) => <CountUp end={value as number} separator="," />}
                           suffix={
                            <div>
                                Up
                            </div>
                           }
                        />
                     </Card>
                     <Card className="w-full">
                        <Statistic
                           title="Đang thực hiện"
                           value={112893}
                           precision={2}
                           formatter={(value) => <CountUp end={value as number} separator="," />}
                        />
                     </Card>
                     <Card className="w-full">
                        <Statistic
                           title="Đã hoàn thành"
                           value={112893}
                           precision={2}
                           formatter={(value) => <CountUp end={value as number} separator="," />}

                        />
                     </Card>
                  </div>
               </Card>
            </div>
            <div className="col-span-5">TRets</div>
         </div>
      </PageContainer>
   )
}

export default Page
