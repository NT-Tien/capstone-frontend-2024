"use client"

import { App } from "antd"

type Props = {
   title: string
   body?: string
   silent?: boolean
   data?: any
   onClick?: (this: Notification, e: Event) => any
   tag?: string
}

function useSendNotification(props: Props) {
   const { message } = App.useApp()

   async function send() {
      try {
         if (!("Notification" in window)) {
            throw new Error("Trình duyệt không hỗ trợ thông báo.")
         }

         if (Notification.permission !== "granted") {
            const result = await Notification.requestPermission()
            if (result !== "granted") {
               throw new Error("Vui lòng cấp quyền hiển thị thông báo.")
            }
         }

         const notification = new Notification(props.title, {
            body: props.body,
            silent: props.silent,
            requireInteraction: true,
            lang: "vn-VI",
            data: props.data,
            tag: props.tag,
         })

         notification.onclick = props.onClick ?? null
      } catch (error) {
         if (error instanceof Error) {
            if (error.message === "Trình duyệt không hỗ trợ thông báo.") {
               console.error(error)
               return
            }

            if (error.message === "Vui lòng cấp quyền hiển thị thông báo.") {
               message.destroy("notification-error")
               message.error({
                  key: "notification-error",
                  content: error.message,
               })
               return
            }
         }

         console.error(error)
      }
   }

   return send
}

export default useSendNotification
