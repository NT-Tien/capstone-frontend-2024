"use client"

import { PageContainer } from "@ant-design/pro-layout"
import { useMutation, useQuery } from "@tanstack/react-query"
import Admin_Areas_OneById from "@/app/admin/_api/areas/one-byId.api"
import qk from "@/common/querykeys"
import { App, Button, Tag } from "antd"
import { LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import { useRef } from "react"
import { AreaDto } from "@/common/dto/Area.dto"
import Admin_Areas_Update from "@/app/admin/_api/areas/update.api"
import dayjs from "dayjs"

type types = {
   dto: AreaDto
}

const values = {
   nameSingle: "area",
   nameSingleCapitalized: "Area",
   namePlural: "areas",
   namePluralCapitalized: "Areas",
   mainQueryFn: Admin_Areas_OneById,
   mainQueryKey: qk.areas.one,
   updateMutationFn: Admin_Areas_Update,
}

export default function AreaDetails({ params }: { params: { id: string } }) {
   const { message } = App.useApp()
   const router = useRouter()
   const api = useQuery({
      queryKey: values.mainQueryKey(params.id),
      queryFn: () => values.mainQueryFn({ id: params.id }),
   })
   const actionRef = useRef()

   const mutate_update = useMutation({
      mutationFn: values.updateMutationFn,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Deleting ${values.nameSingleCapitalized}...`,
            key: `delete-${values.nameSingle}`,
         })
      },
      onError: async (error) => {
         message.error({
            content: `Failed to delete ${values.nameSingleCapitalized}. See logs.`,
         })
      },
      onSuccess: async () => {
         message.success({
            content: `${values.nameSingleCapitalized} deleted successfully.`,
         })
         await api.refetch()
      },
      onSettled: () => {
         message.destroy(`delete-${values.nameSingle}`)
      },
   })

   return (
      <PageContainer
         loading={api.isLoading}
         header={{
            title: (
               <div className="flex items-center gap-3">
                  <Button icon={<LeftOutlined />} onClick={() => router.back()} />
                  {values.nameSingleCapitalized} Details
               </div>
            ),
            breadcrumb: {
               items: [
                  {
                     title: "Dashboard",
                     onClick: () => router.push("/admin/dashboard"),
                  },
                  {
                     title: "Area",
                     onClick: () => router.push("/admin/area"),
                  },
                  {
                     title: "One",
                  },
               ],
            },
            ghost: true,
            tags: api.data?.deletedAt
               ? [
                    <Tag key="deleted-tag" color="red">
                       Deleted
                    </Tag>,
                 ]
               : [],
         }}
         content={
            <>
               <ProDescriptions
                  actionRef={actionRef}
                  editable={{
                     type: "single",
                     async onSave(key, record, original) {
                        const typedKey = key as keyof types["dto"]
                        if (record[typedKey] === original[typedKey]) {
                           return
                        }

                        return mutate_update.mutate({
                           id: params.id,
                           payload: record as any,
                        })
                     },
                  }}
                  // request={async () => {
                  //    const response = await queryClient.ensureQueryData({
                  //       queryKey: qk.products.one(params.id),
                  //       queryFn: () => Product_One({ id: params.id }),
                  //    })
                  //
                  //    return {
                  //       data: response,
                  //       success: true,
                  //    }
                  // }}
                  columns={[
                     {
                        title: "ID",
                        dataIndex: "id",
                        key: "id",
                        editable: false,
                        copyable: true,
                        ellipsis: true,
                     },
                     {
                        title: "Name",
                        dataIndex: "name",
                        key: "name",
                        valueType: "text",
                     },
                     {
                        title: "Instruction",
                        dataIndex: "instruction",
                        key: "instruction",
                        valueType: "textarea",
                     },
                     {
                        title: "Width",
                        dataIndex: "width",
                        key: "width",
                        valueType: "digit",
                     },
                     {
                        title: "Height",
                        dataIndex: "height",
                        key: "height",
                        valueType: "digit",
                     },
                     {
                        title: "Created",
                        dataIndex: "createdAt",
                        key: "createdAt",
                        render: (_, entity) => dayjs(entity.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                        editable: false,
                     },
                     {
                        title: "Updated",
                        dataIndex: "updatedAt",
                        key: "updatedAt",
                        render: (_, entity) => dayjs(entity.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
                        editable: false,
                     },
                     {
                        title: "Deleted",
                        dataIndex: "deletedAt",
                        key: "deletedAt",
                        render: (_, entity) =>
                           entity.deletedAt ? dayjs(entity.deletedAt).format("YYYY-MM-DD HH:mm:ss") : "-",
                        editable: false,
                     },
                  ]}
               />
            </>
         }
      />
   )
}
