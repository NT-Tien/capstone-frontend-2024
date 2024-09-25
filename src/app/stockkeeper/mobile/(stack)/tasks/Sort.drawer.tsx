import useModalControls from "@/lib/hooks/useModalControls"
import { Dispatch, forwardRef, ReactNode, SetStateAction, useImperativeHandle, useState } from "react"
import { Sort } from "./Sort"
import { Button, Divider, Drawer, Radio, Space } from "antd"

export type SortDrawerRefType = {
   handleOpen: (sort: Sort) => void
}

type Props = {
   children?: (handleOpen: (sort: Sort) => void) => ReactNode
   setSort: Dispatch<SetStateAction<Sort>>
}

const SortDrawer = forwardRef<SortDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (sort: Sort) => {
         setSort(sort)
      },
   })
   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   const [sort, setSort] = useState<Sort | undefined>()

   function handleFinish() {
      props.setSort(
         sort || {
            type: "createdAt",
            order: "asc",
         },
      )
      handleClose()
   }

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Sắp xếp"
            placement="bottom"
            height="max-content"
            footer={
               <Button size="large" type="primary" className="w-full" onClick={handleFinish}>
                  Cập nhật
               </Button>
            }
            classNames={{
               footer: "p-layout",
            }}
         >
            <Radio.Group
               onChange={(e) => {
                  setSort((prev) => ({
                     type: e.target.value,
                     order: prev?.order || "asc",
                  }))
               }}
               value={sort?.type}
               className="w-full"
               defaultValue={sort?.type}
            >
               <Space direction="vertical" className="w-full">
                  <Radio value={"createdAt" as Sort["type"]}>Ngày tạo</Radio>
                  <Divider className="my-1" />
                  <Radio value={"spareParts" as Sort["type"]}>Số linh kiện cần</Radio>
                  <Divider className="my-1" />
                  <Radio value={"priority" as Sort["type"]}>Ưu tiên</Radio>
                  <Divider className="my-1" />
                  <Radio value={"name" as Sort["type"]}>Tên tác vụ</Radio>
               </Space>
            </Radio.Group>

            <section className="mt-6">
               <Radio.Group
                  buttonStyle="outline"
                  size="large"
                  className="w-full"
                  value={sort?.order}
                  onChange={(e) =>
                     setSort((prev) => ({
                        type: prev?.type || "createdAt",
                        order: e.target.value,
                     }))
                  }
               >
                  <Radio.Button className="w-1/2" value={"asc" as Sort["order"]}>
                     Tăng dần
                  </Radio.Button>
                  <Radio.Button className="w-1/2" value={"desc" as Sort["order"]}>
                     Giảm dần
                  </Radio.Button>
               </Radio.Group>
            </section>
         </Drawer>
      </>
   )
})

export default SortDrawer
