import { App } from "antd"
import { CopyOutlined } from "@ant-design/icons"

export function CopyToClipboard({ value, options }: { value: string; options?: { name: string } }) {
   const { message } = App.useApp()

   return {
      key: "copy",
      name: options?.name || "Copy ID",
      label: options?.name || "Sao chép ID",
      onClick: async () => {
         await navigator.clipboard.writeText(value)
         message.success("ID đã được sao chép vào clipboard")
      },
      icon: <CopyOutlined />,
   }
}
