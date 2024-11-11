"use client"

import { Drawer, Input } from "antd"
import { DrawerProps } from "antd/lib"

type SearchDrawerProps = {}
type Props = Omit<DrawerProps, "children"> & SearchDrawerProps

function SearchDrawer(props: Props) {
   return (
      <Drawer title="Tìm kiếm" placement="right" width="100%" {...props}>
         <Input />
      </Drawer>
   )
}

export default SearchDrawer
export type { SearchDrawerProps }
