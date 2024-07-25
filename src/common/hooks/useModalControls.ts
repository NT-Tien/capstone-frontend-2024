import { useModalStack } from "@/common/providers/modal-stack.provider"
import { useCallback, useState } from "react"

type OnOpenFunctionType<T extends any[]> = (...args: T) => void
type OnCloseFunctionType = () => void

export default function useModalControls<OpenProps extends any[]>(options?: {
   onOpen?: OnOpenFunctionType<OpenProps>
   onClose?: OnCloseFunctionType
   onCloseRunLocation?: "after-close" | "before-close"
   onOpenRunLocation?: "after-open" | "before-open"
}) {
   const { pushStack, popStack } = useModalStack()
   const [open, setOpen] = useState(false)

   const handleClose_base: OnCloseFunctionType = useCallback(() => {
      if (options?.onCloseRunLocation === "before-close") {
         options?.onClose?.()
      }

      setOpen(false)

      if (options?.onCloseRunLocation === "after-close" || !options?.onCloseRunLocation) {
         options?.onClose?.()
      }
   }, [options])

   const handleOpen = useCallback(
      (...args: OpenProps) => {
         if (options?.onOpenRunLocation === "before-open") {
            options?.onOpen?.(...args)
         }

         setOpen(true)
         pushStack(handleClose_base)

         if (options?.onOpenRunLocation === "after-open" || !options?.onOpenRunLocation) {
            options?.onOpen?.(...args)
         }
      },
      [handleClose_base, options, pushStack],
   )

   function handleClose() {
      history.back()
   }

   return { open, handleOpen, handleClose, handleClose_base }
}
