"use client"

import { Button, Result } from "antd"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"

type Props = {
   message?: string
   actions?: ReactNode
}

function PageError(props: Props) {
   const router = useRouter()
   return (
      <div className="grid h-screen w-screen place-items-center">
         <Result
            status={"error"}
            title={"Đã xảy ra lỗi"}
            subTitle={props.message ?? "Vui lòng thử lại hoặc liên hệ với quản trị viên để được hỗ trợ"}
            extra={
               props.actions ?? (
                  <Button type="primary" onClick={() => router.back()}>
                     Quay lại
                  </Button>
               )
            }
         />
      </div>
   )
}

export default PageError
