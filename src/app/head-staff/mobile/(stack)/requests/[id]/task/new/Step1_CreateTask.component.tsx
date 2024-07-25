"use client"

import dayjs, { Dayjs } from "dayjs"
import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react"
import { App, Button, Form, Radio } from "antd"
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
   const { message } = App.useApp()
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   const handleFinish = useCallback(
      async function handleFinish() {
         try {
            if (!props.selectedTaskName) {
               form.setFields([
                  {
                     name: "name",
                     errors: ["Vui lòng điền tên tác vụ"],
                  },
               ])
            }

            if (!props.selectedFixDate) {
               form.setFields([
                  {
                     name: "fixDate",
                     errors: ["Vui lòng chọn ngày sửa chữa"],
                  },
               ])
            }

            if (!props.selectedTaskName || !props.selectedFixDate) return

            setStep(2)
         } catch (e) {
            message.destroy("error")
            message.error({
               content: "Vui lòng điền đầy đủ thông tin tác vụ",
               key: "error",
            })
         }
      },
      [form, message, props.selectedFixDate, props.selectedTaskName, setStep],
   )

   useEffect(() => {
      setPrevBtnProps({
         children: "Quay lại",
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
            await handleFinish()
         },
         children: "Tiếp tục",
         icon: <ArrowRightOutlined />,
      })
   }, [form, handleFinish, props, setNextBtnProps, setPrevBtnProps, setStep])

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
                        Tạo tên tác vụ
                     </Button>
                  )
               }
               allowClear
               name="name"
               rules={[{ required: true }]}
               label={"Tên tác vụ"}
               fieldProps={{
                  size: "large",
                  onChange: (e) => props.setSelectedTaskName(e.target.value),
                  value: props.selectedTaskName,
               }}
            />
            <div className="flex gap-4">
               <ProFormDatePicker
                  label={"Ngày sửa chữa"}
                  name="fixDate"
                  rules={[{ required: true }]}
                  formItemProps={{
                     className: "flex-grow",
                  }}
                  dataFormat="DD-MM-YYYY"
                  fieldProps={{
                     size: "large",
                     className: "w-full",
                     placeholder: "Chọn ngày sửa chữa cho tác vụ",
                     onChange: (e) => props.setSelectedFixDate(e),
                     value: props.selectedFixDate,
                     disabledDate: (current) => {
                        return current && current <= dayjs().startOf("day")
                     },
                  }}
               />
               <Form.Item label="Mức độ ưu tiên" name="priority" initialValue={false}>
                  <Radio.Group
                     buttonStyle="solid"
                     size="large"
                     className="w-full"
                     onChange={(e) => props.setSelectedPriority(e.target.value)}
                     value={props.selectedPriority}
                  >
                     <Radio.Button value={false}>Thường</Radio.Button>
                     <Radio.Button value={true}>Ưu tiên</Radio.Button>
                  </Radio.Group>
               </Form.Item>
            </div>
         </Form>
      </div>
   )
}
