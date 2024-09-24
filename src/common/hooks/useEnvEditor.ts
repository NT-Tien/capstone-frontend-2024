import { useContext, useRef } from "react"
import { EnvEditorContext } from "@/providers/EnvEditor.provider"
import { App } from "antd"

const clickTimes: number = 5

export default function useEnvEditor() {
   const context = useContext(EnvEditorContext)
   const { message } = App.useApp()
   const clickCountRef = useRef<number>(0)
   const timeoutRef = useRef<NodeJS.Timeout | null>(null)

   if (!context) {
      throw new Error("useEnvEditor must be used within a EnvEditorProvider")
   }

   async function handleDelayedOpenEnvEditor() {
      if (!context) return

      clickCountRef.current += 1
      message.destroy("env-editor-click-count")
      message.open({
         content: `Click ${clickTimes - clickCountRef.current} more times to open ENV editor`,
         type: "info",
         key: "env-editor-click-count",
      })

      if (clickCountRef.current === 5) {
         context.handleOpen()
         clickCountRef.current = 0
         message.destroy("env-editor-click-count")
         message.open({
            content: "Opening ENV editor",
            type: "success",
            key: "env-editor-click-count",
         })
      }

      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
         clickCountRef.current = 0
      }, 1000) // 1s
   }

   return { context, handleDelayedOpenEnvEditor }
}
