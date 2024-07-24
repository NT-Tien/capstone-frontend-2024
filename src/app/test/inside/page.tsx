"use client"

import { ReactNode, useState } from "react"
import { Button, Modal } from "antd"
import useModalControls from "@/common/hooks/useModalControls"

export default function Inside() {
   return (
      <div>
         <h1>INSIDE</h1>

         <ParentModal>
            {(handleOpen) => <Button onClick={() => handleOpen("John", 20)}>Open Parent</Button>}
         </ParentModal>
      </div>
   )
}

function ParentModal({ children }: { children: (handleOpen: (name: string, age: number) => void) => ReactNode }) {
   const [name, setName] = useState("")
   const [age, setAge] = useState(0)

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (name: string, age: number) => {
         setName(name)
         setAge(age)
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Modal open={open} onCancel={handleClose} title="Parent">
            <ChildModal>{(handleOpen) => <Button onClick={handleOpen}>Child</Button>}</ChildModal>
            {name} {age}
         </Modal>
      </>
   )
}

function ChildModal({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const { open, handleOpen, handleClose } = useModalControls({})

   return (
      <>
         {children(handleOpen)}
         <Modal open={open} onCancel={handleClose} title="Child">
            CHild
         </Modal>
      </>
   )
}
