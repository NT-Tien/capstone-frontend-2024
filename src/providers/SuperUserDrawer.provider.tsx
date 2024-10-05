"use client"

import { PropsWithChildren, useRef } from "react"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import SuperUserDrawer, { SuperUserDrawerProps } from "@/components/SuperUser/SuperUser.drawer"
import { FloatButton } from "antd"

function SuperUserDrawerProvider(props: PropsWithChildren) {
   const control_superUserDrawer = useRef<RefType<SuperUserDrawerProps> | null>(null)

   return (
      <>
         {props.children}
         <FloatButton onClick={() => control_superUserDrawer.current?.handleOpen({})} />
         <OverlayControllerWithRef ref={control_superUserDrawer}>
            <SuperUserDrawer />
         </OverlayControllerWithRef>
      </>
   )
}

export default SuperUserDrawerProvider
