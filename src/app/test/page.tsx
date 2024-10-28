"use client"
import { useState } from "react"
import { CloseOutlined } from "@ant-design/icons"
import { Button } from "antd"

type Props = {
   children: React.ReactNode
}

function CustomDrawer({ children }: Props) {
   const [isOpen, setIsOpen] = useState(false)

   const handleOpen = () => setIsOpen(true)
   const handleClose = () => setIsOpen(false)

   return (
      <div className="min-h-screen h-screen flex">
         <div className="flex-grow">
            <Button className="w-full rounded bg-blue-500 p-2 text-white" onClick={handleOpen}>
               Open Drawer
            </Button>
         </div>

         {isOpen && (
            <div
               className="right-0 top-0 h-full w-1/3 bg-white p-4 shadow-lg transition-transform duration-300"
               style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
            >
               <button className="absolute right-2 top-2 text-xl text-gray-500" onClick={handleClose}>
                  <CloseOutlined />
               </button>

               <div className="mt-6">{children}</div>
            </div>
         )}
      </div>
   )
}

export default CustomDrawer
