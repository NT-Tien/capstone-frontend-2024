import head_maintenance_queries from "@/features/head-maintenance/queries"
import { Drawer, DrawerProps } from "antd"

type Issue_ViewDetails_WarrantyDrawerProps = {
   issueId?: string
}
type Props = Omit<DrawerProps, "children"> & Issue_ViewDetails_WarrantyDrawerProps

function Issue_ViewDetails_WarrantyDrawer(props: Props) {
   const api_issue = head_maintenance_queries.issue.one(
      {
         id: props.issueId ?? "",
      },
      {
         enabled: !!props.issueId,
      },
   )

   return <Drawer title="Thông tin bước" placement="bottom" height="max-content" {...props}></Drawer>
}

export default Issue_ViewDetails_WarrantyDrawer
export type { Issue_ViewDetails_WarrantyDrawerProps }
