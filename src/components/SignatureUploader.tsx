"use client"

import ClickableArea from "@/components/ClickableArea"
import { Pen, Signature, UserCheck, Wrench } from "@phosphor-icons/react"
import { App, Button, Image, Space } from "antd"
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons"
import SignatureDrawer, { SignatureDrawerProps } from "@/components/Signature.drawer"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { ReactNode, useRef, useState } from "react"
import BackendImage from "@/components/BackendImage"
import { cn } from "@/lib/utils/cn.util"

type Props = {
   signature: string | undefined
   setSignature?: (signature: string | undefined) => void
   children?: ReactNode
   disabled?: boolean
}

function SignatureUploader(props: Props) {
   const [isSignatureVisible, setIsSignatureVisible] = useState(false)

   const control_signatureDrawer = useRef<RefType<SignatureDrawerProps>>(null)

   const showActions = !!props.setSignature

   return (
      <div>
         {props.signature ? (
            <Space.Compact className="flex h-12">
               <ClickableArea className="flex-grow rounded-lg rounded-r-none border-orange-400 bg-orange-100 text-orange-400">
                  <Pen size={20} />
                  <p className="text-sm font-bold tracking-wide">Đã ký</p>
               </ClickableArea>
               {showActions && (
                  <Button
                     icon={<EditOutlined />}
                     size="small"
                     className="aspect-square h-full w-12"
                     onClick={() => control_signatureDrawer.current?.handleOpen({})}
                  />
               )}
               <Button
                  icon={<EyeOutlined />}
                  size="small"
                  className="aspect-square h-full w-12 rounded-lg rounded-l-none"
                  onClick={() => setIsSignatureVisible(true)}
               />
            </Space.Compact>
         ) : (
            <div className={cn("flex h-12", props.disabled && "pointer-events-none opacity-50")} onClick={() => !props.disabled && showActions && control_signatureDrawer.current?.handleOpen({})}>
               <ClickableArea
                  className={cn("flex-grow rounded-lg bg-gray-100 text-gray-300", showActions && "rounded-r-none")}
               >
                  <Pen size={20} />
                  <p className="text-sm font-bold tracking-wide">Chưa ký</p>
               </ClickableArea>
               {showActions && (
                  <Button
                     icon={<PlusOutlined />}
                     size="small"
                     className="aspect-square h-full w-12 rounded-lg rounded-l-none"
                     disabled={props.disabled}
                  />
               )}
            </div>
         )}
         {props.signature && (
            <div className="pointer-events-none fixed hidden">
               <BackendImage
                  src={props.signature}
                  preview={{
                     visible: isSignatureVisible,
                     onVisibleChange: setIsSignatureVisible,
                  }}
               />
            </div>
         )}
         <OverlayControllerWithRef ref={control_signatureDrawer}>
            <SignatureDrawer onSubmit={(path) => props.setSignature?.(path)}>{props.children}</SignatureDrawer>
         </OverlayControllerWithRef>
      </div>
   )
}

// eslint-disable-next-line react/display-name
SignatureUploader.Head_Maintenance = () => {
   return (
      <div className="flex flex-col items-center gap-1 text-neutral-400/50">
         <Wrench size={32} weight="fill" />
         <p className="font-semibold">Trưởng phòng bảo trì</p>
      </div>
   )
}

// eslint-disable-next-line react/display-name
SignatureUploader.Head_Department = () => {
   return (
      <div className="flex flex-col items-center gap-1 text-neutral-400/50">
         <UserCheck size={32} weight="fill" />
         <p className="font-semibold">Trưởng phòng sản xuất</p>
      </div>
   )
}

// eslint-disable-next-line react/display-name
SignatureUploader.Stockkeeper = () => {
   return (
      <div className="flex flex-col items-center gap-1 text-neutral-400/50">
         <UserCheck size={32} weight="fill" />
         <p className="font-semibold">Thủ kho</p>
      </div>
   )
}

export default SignatureUploader
