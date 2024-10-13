"use client"

import { PageContainer } from "@ant-design/pro-layout"
import Card from "antd/es/card"
import Button from "antd/es/button"
import { Descriptions } from "antd"
import { useQueries } from "@tanstack/react-query"
import Admin_Requests_Dashboard from "@/features/admin/api/request/dashboard.api"

function Page() {
    const api = useQueries({
       queries: [
          {
             queryKey: ["admin", "requests", "dashboard", "all"],
             queryFn: () =>
                Admin_Requests_Dashboard({
                   endDate: new Date().toISOString(),
                   areaId: "",
                   startDate: "2024-09-07T02:24:40.298Z",
                   type: "all",
                }),
          },
          {
             queryKey: ["admin", "requests", "dashboard", "fix"],
             queryFn: () =>
                Admin_Requests_Dashboard({
                   endDate: new Date().toISOString(),
                   areaId: "",
                   startDate: "2024-09-07T02:24:40.298Z",
                   type: "fix",
                }),
          },
          {
             queryKey: ["admin", "requests", "dashboard", "renew"],
             queryFn: () =>
                Admin_Requests_Dashboard({
                   endDate: new Date().toISOString(),
                   areaId: "",
                   startDate: "2024-09-07T02:24:40.298Z",
                   type: "renew",
                }),
          },
          {
             queryKey: ["admin", "requests", "dashboard", "warranty"],
             queryFn: () =>
                Admin_Requests_Dashboard({
                   endDate: new Date().toISOString(),
                   areaId: "",
                   startDate: "2024-09-07T02:24:40.298Z",
                   type: "warranty",
                }),
          },
       ],
       combine: (data) => ({
          all: data[0],
          fix: data[1],
          renew: data[2],
          warranty: data[3],
       }),
    })
 
    return (
        <></>
    )}