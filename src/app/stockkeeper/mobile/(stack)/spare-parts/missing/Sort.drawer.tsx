import useModalControls from "@/common/hooks/useModalControls"
import { Button, Divider, Drawer, Radio, Space } from "antd"
import { Dispatch, forwardRef, SetStateAction, useImperativeHandle, useState } from "react"

export type Sort = {
   type: "name" | "createdAt" | "quantityNeeded" | "needToday"
   order: "asc" | "desc"
}

type HandleOpen = {
   sort: Sort
}

export type SortDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   children?: (handleOpen: (props: HandleOpen) => void) => React.ReactNode
   setSort: Dispatch<SetStateAction<Sort>>
}

const SortDrawer = forwardRef<SortDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setSort(props.sort)
      },
   })
   const [sort, setSort] = useState<Sort | undefined>()

   function handleFinish() {
      props.setSort(
         sort || {
            type: "name",
            order: "asc",
         },
      )
      handleClose()
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            title="Sắp xếp"
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="max-content"
            footer={
               <Button type="primary" size="large" className="w-full" onClick={handleFinish}>
                  Cập nhất
               </Button>
            }
            classNames={{ footer: "p-layout" }}
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
                  <Radio value={"createdAt" satisfies Sort["type"]}>Ngày tạo</Radio>
                  <Divider className="my-1" />
                  <Radio value={"name" satisfies Sort["type"]}>Tên linh kiện</Radio>
                  <Divider className="my-1" />
                  <Radio value={"quantityNeeded" satisfies Sort["type"]}>Số lượng cần thêm</Radio>
                  <Divider className="my-1" />
                  <Radio value={"needToday" satisfies Sort["type"]}>Cần thêm hôm nay</Radio>
               </Space>
               <section className="mt-6">
                  <Radio.Group
                     buttonStyle="outline"
                     size="large"
                     className="w-full"
                     value={sort?.order}
                     onChange={(e) =>
                        setSort((prev) => ({
                           type: prev?.type || "name",
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
            </Radio.Group>
         </Drawer>
      </>
   )
})

export default SortDrawer
