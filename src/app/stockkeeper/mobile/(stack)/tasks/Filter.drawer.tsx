import useModalControls from "@/common/hooks/useModalControls";
import { forwardRef, ReactNode } from "react";

type FilterDrawerRefType = {
    handleOpen: () => void
}

type Props = {
    children: () => ReactNode
}

const FilterDrawer = forwardRef<FilterDrawerRefType, Props>(function Component(props, ref) {
    const { open, handleOpen, handleClose } = useModalControls({})

    return (
        <div>
            {props.children()}
        </div>
    )
})

export default FilterDrawer
