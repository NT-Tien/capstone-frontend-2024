"use client";

import { PageContainer } from "@ant-design/pro-components";
import { Button, Card, DatePicker, Space, Statistic } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";

function Page() {
  const [responseApi, setResponseApi] = useState();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(30, "days").toISOString());
  const [endDate, setEndDate] = useState<string>(dayjs().toISOString());
 
  const fetchStockkeeperDashboard = async () => {
    axios
       .get(`http://localhost:8080/api/stockkeeper/notification/dashboard/${startDate}/${endDate}`, {
          headers: {
             Authorization: `Bearer ${Cookies.get("token")}`,
          },
       })
       .then((response) => {
          console.log("data trả về")
          console.log(response.data.data)
          setResponseApi(response.data.data)
       })
       .catch((error) => {
          console.error("Error fetching priority:", error)
       })
 }      

  function handleDateChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (dates && dates[0] && dates[1]) {
      setStartDate(dates[0].toISOString());
      setEndDate(dates[1].toISOString());
    }
  }

  useEffect(() => {
    fetchStockkeeperDashboard();
  }, [startDate, endDate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  return (
    <PageContainer
      title="Thống kê kho"
      subTitle={`Đang hiện thông tin từ ${dayjs(startDate).format("DD/MM/YYYY")} đến ${dayjs(endDate).format("DD/MM/YYYY")}`}
      extra={
        <Space size="small">
          <DatePicker.RangePicker
            className="w-64"
            value={[dayjs(startDate), dayjs(endDate)]}
            onChange={handleDateChange}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchStockkeeperDashboard}>
            Tải lại
          </Button>
        </Space>
      }
    >
      <section>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Card size="small" className="w-full bg-orange-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/missing?current=1&pageSize=10"}>
            <Statistic
              title="Linh kiện cần nhập"
              value={responseApi?.sparepartNeedAdded || 0}
              suffix={<span className="text-sm">linh kiện</span>}
            />
          </Card>
          <Card size="small" className="w-full bg-purple-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=DEVICE"}>
            <Statistic
              title="Tác vụ chưa giao thiết bị"
              value={responseApi?.taskDeviceNotYet || 0}
              suffix={<span className="text-sm">thiết bị</span>}
            />
          </Card>
          <Card size="small" className="w-full bg-blue-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=DEVICE"}>
            <Statistic
              title="Tác vụ đã giao thiết bị"
              value={responseApi?.taskDeviceDone || 0}
              suffix={<span className="text-sm">thiết bị</span>}
            />
          </Card>
          <Card size="small" className="w-full bg-green-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=SPARE_PART"}>
            <Statistic
              title="Tác vụ chưa giao linh kiện"
              value={responseApi?.taskSparePartNotYet || 0}
              suffix={<span className="text-sm">linh kiện</span>}
            />
          </Card>
          <Card size="small" className="w-full bg-[#FFCC00]-200" onClick={() => window.location.href = "/stockkeeper/desktop/spare-parts/export?export_type=SPARE_PART"}>
            <Statistic
              title="Tác vụ đã giao linh kiện"
              value={responseApi?.taskSparePartDone || 0}
              suffix={<span className="text-sm">linh kiện</span>}
            />
          </Card>
          <Card size="small" className="w-full bg-red-200">
            <Statistic
              title="Sửa lỗi khẩn cấp"
              value={responseApi?.hotFixDevice || 0}
              suffix={<span className="text-sm">thiết bị</span>}
            />
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}

export default Page;
