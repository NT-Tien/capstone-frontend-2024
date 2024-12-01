"use client"

import useModalControls from "@/lib/hooks/useModalControls"
import {
   Children,
   cloneElement,
   Dispatch,
   forwardRef,
   isValidElement,
   ReactNode,
   SetStateAction,
   useImperativeHandle,
   useMemo,
   useState,
} from "react"

type HandleOpenType<T> = (props: T) => void

type RefType<T> = {
   handleOpen: HandleOpenType<T>
   handleClose: (useBase?: boolean) => void
   setComponentProps: Dispatch<SetStateAction<T>>
} | null

type Props<T> = {
   children: ReactNode
}

const OverlayControllerWithRef = forwardRef<RefType<any>, Props<any>>(function Component<T>(props: any, ref: any) {
   const [componentProps, setComponentProps] = useState<T | undefined>(undefined)

   const { open, handleOpen, handleClose, handleClose_base } = useModalControls({
      onOpen: (props?: T) => {
         setComponentProps(props)
      },
      onClose: () => {
      },
   })

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
      setComponentProps,
   }))

   const childrenWithProps = useMemo(() => {
      const isOpen = open,
         onClose = handleClose,
         onCancel = handleClose

      function onOpenChange(open: boolean) {
         if (!open) {
            handleClose()
         } else {
            handleOpen()
         }
      }

      function afterOpenChange(open: boolean) {
         if(!open) setComponentProps(undefined)
      }

      return Children.map(props.children, (child) => {
         if (isValidElement(child)) {
            return cloneElement<any>(child, {
               open,
               isOpen,
               onClose,
               onCancel,
               onOpenChange,
               handleClose,
               instantClose: handleClose_base,
               afterOpenChange,
               ...componentProps,
            })
         }

         return child
      })
   }, [open, handleClose, props.children, handleOpen, handleClose_base, componentProps])

   return (
      <>
         {childrenWithProps?.map((childrenWithProp: any, index: any) => (
            <div key={index + "_child"}>{childrenWithProp}</div>
         ))}
      </>
   )
})

export default OverlayControllerWithRef
export type { RefType }
