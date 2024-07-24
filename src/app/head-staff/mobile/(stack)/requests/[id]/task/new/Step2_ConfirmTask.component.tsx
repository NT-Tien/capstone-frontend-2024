"use client"

import { UserDto } from "@/common/dto/User.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { App, Input, Tag } from "antd"
import { useRouter } from "next/navigation"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import HeadStaff_Task_Create from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-card"
import { SelectedIssueType, usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page"

type SortedUserDto = Omit<UserDto, "tasks"> & {
   sorted_tasks: {
      priority: TaskDto[]
      normal: TaskDto[]
   }
   totalTime: number
   hasPriority: boolean
}

type Step2_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   setSelectedFixer: Dispatch<SetStateAction<UserDto | undefined>>
   selectedFixer: UserDto | undefined
   selectedFixDate: Dayjs | undefined
   selectedIssues: SelectedIssueType
   selectedTaskName: string | undefined
   selectedPriority: boolean
}

function Step2_ConfirmTask(props: Step2_Props) {
   const { message } = App.useApp()
   const router = useRouter()

   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()

   const [searchTerm, setSearchTerm] = useState("")

   const api_user = useQuery({
      queryKey: headstaff_qk.user.all(),
      queryFn: () => HeadStaff_Users_AllStaff(),
      enabled: !!props.selectedFixDate,
   })

   const sorted = useMemo(() => {
      if (!api_user.isSuccess) return

      const response: SortedUserDto[] = []

      for (const row of api_user.data) {
         const { tasks, ...user } = row
         let total: number = 0,
            hasPriority: boolean = false

         const rowData = tasks.reduce(
            (acc, task) => {
               if (dayjs(task.fixerDate).isSame(dayjs(props.selectedFixDate), "date")) {
                  total += task.totalTime

                  if (task.priority) {
                     hasPriority = true
                     acc.priority.push(task)
                  } else {
                     acc.normal.push(task)
                  }
               }
               return acc
            },
            {
               priority: [],
               normal: [],
            } as {
               priority: TaskDto[]
               normal: TaskDto[]
            },
         )

         response.push({
            ...user,
            sorted_tasks: rowData,
            totalTime: total,
            hasPriority,
         })
      }

      return response
   }, [api_user.data, api_user.isSuccess, props.selectedFixDate])

   const filtered = useMemo(() => {
      if (!sorted) return
      return sorted.filter((e) => e.username.toLowerCase().includes(searchTerm.toLowerCase()))
   }, [sorted, searchTerm])

   const mutate_createTask = useMutation({
      mutationFn: HeadStaff_Task_Create,
      onMutate: async () => {
         message.destroy("loading")
         message.open({
            type: "loading",
            content: "Creating Task...",
            key: "loading",
         })
      },
   })

   const mutate_assignFixer = useMutation({
      mutationFn: HeadStaff_Task_UpdateAssignFixer,
      onSuccess: async () => {
         message.success("Task Created Successfully")
      },
      onError: async () => {
         message.error("Failed to create task")
      },
      onSettled: async () => {
         message.destroy("loading")
      },
      retry: 3,
   })

   const mutate_updateRequestStatus = useMutation({
      mutationFn: HeadStaff_Request_UpdateStatus,
      retry: 3,
   })

   async function handleFinish() {
      if (!props.selectedTaskName || !props.selectedFixDate || !props.api.data || !props.selectedFixer) return

      const issueIDs = Object.keys(props.selectedIssues)
      const totalTime = issueIDs.reduce((acc, id) => {
         return acc + props.selectedIssues[id].typeError.duration
      }, 0)

      const task = await mutate_createTask.mutateAsync({
         name: props.selectedTaskName,
         fixerDate: props.selectedFixDate.toISOString(),
         priority: props.selectedPriority,
         issueIDs,
         totalTime,
         request: props.api.data.id,
         operator: 0,
      })

      if (props.api.data?.status === FixRequestStatus.PENDING) {
         await mutate_updateRequestStatus.mutateAsync({
            id: props.api.data.id,
            payload: {
               status: FixRequestStatus.APPROVED,
               checker_note: "",
            },
         })
      }

      await mutate_assignFixer.mutateAsync({
         id: task.id,
         payload: {
            fixer: props.selectedFixer.id,
         },
      })

      router.push(`/head-staff/mobile/tasks/${task.id}`)
   }

   useEffect(() => {
      setPrevBtnProps({
         children: "Back",
         onClick: () => {
            props.setSelectedFixer(undefined)
            setStep(1)
         },
         icon: <ArrowLeftOutlined />,
      })
      setNextBtnProps({
         onClick: async () => {
            await handleFinish()
         },
         children: "Create Task",
         icon: <UploadOutlined />,
      })
   }, [handleFinish, props, setNextBtnProps, setPrevBtnProps, setStep])

   useEffect(() => {
      if (!props.selectedFixer) {
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
   }, [props.selectedFixer, setNextBtnProps])

   return (
      <section className="mt-layout flex flex-col gap-2">
         <Input.Search
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for Staff"
            size="large"
         />
         {searchTerm
            ? api_user.isSuccess &&
              filtered
                 ?.sort((a, b) => {
                    return a.totalTime - b.totalTime
                 })
                 .map((e) => (
                    <CheckCard
                       key={e.id}
                       title={e.username}
                       size="small"
                       description={"Total Time: " + e.totalTime + ` minute${e.totalTime !== 1 ? "s" : ""}`}
                       onClick={() => {
                          const { hasPriority, sorted_tasks, ...rest } = e
                          props.setSelectedFixer({
                             ...rest,
                             tasks: [],
                          })
                       }}
                       checked={e.id === props.selectedFixer?.id}
                       className="m-0 w-full"
                       extra={<Tag>Available</Tag>}
                       disabled={e.hasPriority && props.selectedPriority}
                    ></CheckCard>
                 ))
            : api_user.isSuccess &&
              sorted
                 ?.sort((a, b) => {
                    return a.totalTime - b.totalTime
                 })
                 .map((e) => (
                    <CheckCard
                       key={e.id}
                       title={e.username}
                       size="small"
                       description={"Total Time: " + e.totalTime + ` minute${e.totalTime !== 1 ? "s" : ""}`}
                       onClick={() => {
                          const { hasPriority, sorted_tasks, ...rest } = e
                          props.setSelectedFixer({
                             ...rest,
                             tasks: [],
                          })
                       }}
                       checked={e.id === props.selectedFixer?.id}
                       className="m-0 w-full"
                       extra={<Tag>Available</Tag>}
                       disabled={e.hasPriority && props.selectedPriority}
                    ></CheckCard>
                 ))}
      </section>
   )
}

export default Step2_ConfirmTask
