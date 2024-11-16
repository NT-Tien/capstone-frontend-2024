"use cleint"

import EnvEditorProvider from "@/providers/EnvEditor.provider"
import { FloatButton } from "antd"
import { PropsWithChildren } from "react"

function FloatButtonProvider(props: PropsWithChildren) {
   const { handleDelayedOpenEnvEditor } = EnvEditorProvider.useContext()

   return (
      <>
         {props.children}
         <FloatButton onClick={() => handleDelayedOpenEnvEditor()} />
      </>
   )
}

export default FloatButtonProvider