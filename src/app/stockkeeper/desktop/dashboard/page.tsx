"use client"

import Stockkeeper_Dashboard from "@/features/stockkeeper/api/task/dashboard.api"
import { PageContainer } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { Button, DatePicker, Space } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useState } from "react"
import { DoubleRightOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"

// import { PageContainer } from "@ant-design/pro-components";
// import { Button, Card, DatePicker, Space, Statistic } from "antd";
// import { ReloadOutlined } from "@ant-design/icons";
// import { useEffect, useState } from "react";
// import dayjs, { Dayjs } from "dayjs";
// import Cookies from "js-cookie";
// import axios from "axios";

// function Page() {
//   const [responseApi, setResponseApi] = useState();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string , null>(null);
//   const [startDate, setStartDate] = useState<string>(dayjs().subtract(30, "days").toISOString());
//   const [endDate, setEndDate] = useState<string>(dayjs().toISOString());

//   const fetchStockkeeperDashboard = async () => {
//     axios
//        .get(`http://localhost:8080/api/stockkeeper/notification/dashboard/${startDate}/${endDate}`, {
//           headers: {
//              Authorization: `Bearer ${Cookies.get("token")}`,
//           },
//        })
//        .then((response) => {
//           console.log("data trả về")
//           console.log(response.data.data)
//           setResponseApi(response.data.data)
//        })
//        .catch((error) => {
//           console.error("Error fetching priority:", error)
//        })
//  }

//   function handleDateChange(dates: [Dayjs | null, Dayjs | null] | null) {
//     if (dates && dates[0] && dates[1]) {
//       setStartDate(dates[0].toISOString());
//       setEndDate(dates[1].toISOString());
//     }
//   }

//   useEffect(() => {
//     fetchStockkeeperDashboard();
//   }, [startDate, endDate]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const getRandomColor = () => {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   };

//   return (
//     <PageContainer
//       title="Thống kê kho"
//       subTitle={`Đang hiện thông tin từ ${dayjs(startDate).format("DD/MM/YYYY")} đến ${dayjs(endDate).format("DD/MM/YYYY")}`}
//       extra={
//         <Space size="small">
//           <DatePicker.RangePicker
//             className="w-64"
//             value={[dayjs(startDate), dayjs(endDate)]}
//             onChange={handleDateChange}
//           />
//           <Button icon={<ReloadOutlined />} onClick={fetchStockkeeperDashboard}>
//             Tải lại
//           </Button>
//         </Space>
//       }
//     >
//       <section>
//         <div className="mt-3 grid grid-cols-3 gap-3">
//           <Card size="small" className="w-full bg-orange-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/missing?current=1&pageSize=10"}>
//             <Statistic
//               title="Linh kiện cần nhập"
//               value={responseApi?.sparepartNeedAdded || 0}
//               suffix={<span className="text-sm">linh kiện</span>}
//             />
//           </Card>
//           <Card size="small" className="w-full bg-purple-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=DEVICE"}>
//             <Statistic
//               title="Tác vụ chưa giao thiết bị"
//               value={responseApi?.taskDeviceNotYet || 0}
//               suffix={<span className="text-sm">thiết bị</span>}
//             />
//           </Card>
//           <Card size="small" className="w-full bg-blue-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=DEVICE"}>
//             <Statistic
//               title="Tác vụ đã giao thiết bị"
//               value={responseApi?.taskDeviceDone || 0}
//               suffix={<span className="text-sm">thiết bị</span>}
//             />
//           </Card>
//           <Card size="small" className="w-full bg-green-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=SPARE_PART"}>
//             <Statistic
//               title="Tác vụ chưa giao linh kiện"
//               value={responseApi?.taskSparePartNotYet || 0}
//               suffix={<span className="text-sm">linh kiện</span>}
//             />
//           </Card>
//           <Card size="small" className="w-full bg-[#FFCC00]-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=SPARE_PART"}>
//             <Statistic
//               title="Tác vụ đã giao linh kiện"
//               value={responseApi?.taskSparePartDone || 0}
//               suffix={<span className="text-sm">linh kiện</span>}
//             />
//           </Card>
//           <Card size="small" className="w-full bg-red-200">
//             <Statistic
//               title="Sửa lỗi khẩn cấp"
//               value={responseApi?.hotFixDevice || 0}
//               suffix={<span className="text-sm">thiết bị</span>}
//             />
//           </Card>
//         </div>
//       </section>
//     </PageContainer>
//   );
// }

// export default Page;

type Query = {
   from: string
   to: string
}

function Page() {
   const router = useRouter()
   const [query, setQuery] = useState<Query>({
      from: dayjs().subtract(30, "days").toISOString(),
      to: dayjs().add(1, "day").toISOString(),
   })

   function handleDateChange(dates: [Dayjs | null, Dayjs | null] | null) {
      if (dates && dates[0] && dates[1]) {
         setQuery({
            from: dates[0].toISOString(),
            to: dates[1].toISOString(),
         })
      }
   }

   const api = useQuery({
      queryKey: ["stockkeeper", "dashboard"],
      queryFn: () =>
         Stockkeeper_Dashboard({
            from: query.from,
            to: query.to,
         }),
   })

   useEffect(() => {
      api.refetch()
   }, [query.from, query.to])

   return (
      <PageContainer
         title="Thống kê kho"
         subTitle={`Đang hiện thông tin từ ${dayjs(query.from).format("DD/MM/YYYY")} đến ${dayjs(query.to).format("DD/MM/YYYY")}`}
         extra={
            <Space size="small">
               <DatePicker.RangePicker
                  className="w-64"
                  value={[dayjs(query.from), dayjs(query.to)]}
                  onChange={handleDateChange}
               />
               <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                     api.refetch()
                  }}
               >
                  Tải lại
               </Button>
            </Space>
         }
      >
         <section>
            <div className="h-[180px] rounded-lg bg-white p-3">
               <h2 className="mb-2 text-lg font-semibold">
                  Xuất kho:{" "}
                  {(
                     [
                        "sparepartNeedAdded",
                        "taskDeviceNotYet",
                        "taskDeviceDone",
                        "taskSparePartNotYet",
                        "taskSparePartDone",
                        "hotFixDevice",
                     ] as const
                  ).reduce((acc, status) => {
                     return acc + (api.data?.[status] || 0)
                  }, 0)}
               </h2>
               <div className="flex h-full justify-between">
                  <div className="relative flex h-[75%] w-[100%] justify-between rounded-lg border-2 border-dashed border-black px-6 pt-5">
                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#cc9470] text-[40px] font-bold text-white">
                           <p>{api.data?.sparepartNeedAdded}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Linh kiện cần nhập
                        </div>
                     </div>

                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#87a556] text-[40px] font-bold text-white">
                           <p>{api.data?.taskDeviceNotYet}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Chưa giao thiết bị{" "}
                        </div>
                     </div>

                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#5eb090] text-[40px] font-bold text-white">
                           <p>{api.data?.taskDeviceDone}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đã giao thiết bị{" "}
                        </div>
                     </div>

                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#17a56a] text-[40px] font-bold text-white">
                           <p>{api.data?.taskSparePartNotYet}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Chưa giao linh kiện{" "}
                        </div>
                     </div>

                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#069915] text-[40px] font-bold text-white">
                           <p>{api.data?.taskSparePartDone}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Đã giao linh kiện{" "}
                        </div>
                     </div>

                     <div className="card h-[85%] w-[120px]">
                        <div className="flex h-[70%] w-[100%] items-center justify-center rounded-lg bg-[#bc9e03] text-[40px] font-bold text-white">
                           <p>{api.data?.hotFixDevice}</p>
                        </div>
                        <div className="mx-auto flex h-[30%] w-[90%] items-center justify-center rounded-bl-lg rounded-br-lg bg-[#EDEDED] text-center text-[12px] leading-tight">
                           Sửa lỗi khẩn cấp{" "}
                        </div>
                     </div>
                     <div className="absolute bottom-[100px] left-1/2 flex h-[30px] w-[30%] -translate-x-1/2 transform flex-col justify-center rounded-3xl border-2 border-dashed border-black bg-[#F2DECC] text-center text-[15px]">
                        Trong quá trình xử lý
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </PageContainer>
   )
}

export default Page
