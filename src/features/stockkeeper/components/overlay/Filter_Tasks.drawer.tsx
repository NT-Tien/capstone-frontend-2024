import useModalControls from "@/lib/hooks/useModalControls"
import { forwardRef, ReactNode } from "react"

type FilterDrawerRefType = {
   handleOpen: () => void
}

type Props = {
   children: () => ReactNode
}

const Filter_TasksDrawer = forwardRef<FilterDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({})

   return <div>{props.children()}</div>
})

export default Filter_TasksDrawer
