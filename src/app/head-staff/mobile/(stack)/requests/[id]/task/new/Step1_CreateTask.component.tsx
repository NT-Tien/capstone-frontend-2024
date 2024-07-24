"use client"

import dayjs, { Dayjs } from "dayjs"
import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import React, { Dispatch, SetStateAction, useEffect } from "react"
import { Button, Form, Radio } from "antd"
import { ArrowLeftOutlined, ArrowRightOutlined, PlusOutlined } from "@ant-design/icons"
import { ProFormDatePicker, ProFormText } from "@ant-design/pro-components"
import { usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page"

type FieldType = {
   name: string
   fixDate: Dayjs
   priority: boolean
}

type Step1_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   selectedFixDate: Dayjs | undefined
   setSelectedFixDate: Dispatch<SetStateAction<Dayjs | undefined>>
   selectedPriority: boolean
   setSelectedPriority: Dispatch<SetStateAction<boolean>>
   selectedTaskName: string | undefined
   setSelectedTaskName: Dispatch<SetStateAction<string | undefined>>
}

export default function Step1_CreateTask(props: Step1_Props) {
   const [form] = Form.useForm<FieldType>()
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   function handleFinish() {
      setStep(2)
   }

   useEffect(() => {
      setPrevBtnProps({
         children: "Back",
         onClick: () => {
            props.setSelectedFixDate(undefined)
            props.setSelectedPriority(false)
            props.setSelectedTaskName(undefined)
            form.resetFields()
            setStep(0)
         },
         icon: <ArrowLeftOutlined />,
      })
      setNextBtnProps({
         onClick: async () => {
            form.submit()
         },
         children: "Continue",
         icon: <ArrowRightOutlined />,
      })
   }, [form, props, setNextBtnProps, setPrevBtnProps, setStep])

   useEffect(() => {
      if (props.selectedFixDate === undefined || props.selectedTaskName === undefined) {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: true,
         }))
      } else {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: false,
         }))
      }
   }, [props.selectedFixDate, props.selectedTaskName, setNextBtnProps])

   return (
      <div className="mt-layout">
         <Form layout="vertical" form={form} onFinish={handleFinish}>
            <ProFormText
               extra={
                  props.api.isSuccess && (
                     <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                           const str = `${props.api.data!.device.machineModel.name}-${props.api.data!.device.area.name}-${props.api.data!.device.positionX}-${props.api.data!.device.positionY}`
                           form.setFieldsValue({
                              name: str,
                           })
                           props.setSelectedTaskName(str)
                        }}
                     >
                        Generate Task Name
                     </Button>
                  )
               }
               allowClear
               name="name"
               rules={[{ required: true }]}
               label={"Task Name"}
               fieldProps={{
                  size: "large",
                  onChange: (e) => props.setSelectedTaskName(e.target.value),
                  value: props.selectedTaskName,
               }}
            />
            <div className="flex gap-4">
               <ProFormDatePicker
                  label={"Fix Date"}
                  name="fixDate"
                  rules={[{ required: true }]}
                  formItemProps={{
                     className: "flex-grow",
                  }}
                  dataFormat="DD-MM-YYYY"
                  fieldProps={{
                     size: "large",
                     className: "w-full",
                     placeholder: "Select a Fix Date for the task",
                     onChange: (e) => props.setSelectedFixDate(e),
                     value: props.selectedFixDate,
                     disabledDate: (current) => {
                        return current && current <= dayjs().startOf("day")
                     },
                  }}
               />
               <Form.Item label="Task Priority" name="priority" initialValue={false}>
                  <Radio.Group
                     buttonStyle="solid"
                     size="large"
                     className="w-full"
                     onChange={(e) => props.setSelectedPriority(e.target.value)}
                     value={props.selectedPriority}
                  >
                     <Radio.Button value={false}>Normal</Radio.Button>
                     <Radio.Button value={true}>Priority</Radio.Button>
                  </Radio.Group>
               </Form.Item>
            </div>
         </Form>
      </div>
   )
}
