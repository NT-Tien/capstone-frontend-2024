import { List, Tag } from "antd"
import { cn } from "@/lib/utils/cn.util"
import Card from "antd/es/card"
import { useMemo } from "react"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"

type Props = {
   issues?: IssueDto[]
   isLoading?: boolean
}

function SparePartsListByIssuesSection({ issues, isLoading }: Props) {
   const spareParts = useMemo(() => {
      if (!issues || issues.length === 0) return []

      const returnValue: {
         [sparePartId: string]: {
            sparePart: SparePartDto
            issueSpareParts: IssueSparePartDto[]
            totalNeeded: number
         }
      } = {}

      const issueSparePartsList = issues.map((issue) => issue.issueSpareParts).flat()

      issueSparePartsList.forEach((issueSparePart) => {
         if (!issueSparePart.sparePart) return {}
         const currentSparePartId = issueSparePart.sparePart?.id
         if (!returnValue[currentSparePartId]) {
            returnValue[currentSparePartId] = {
               sparePart: issueSparePart.sparePart,
               issueSpareParts: [],
               totalNeeded: 0,
            }
         }

         const { sparePart, ...issueSparePart_ } = issueSparePart
         returnValue[currentSparePartId].issueSpareParts.push(issueSparePart_ as any)
         returnValue[currentSparePartId].totalNeeded += issueSparePart.quantity
      })

      return Object.values(returnValue)
   }, [issues])

   return (
      <Card>
         <h3 className="mb-2 text-lg font-bold">Linh kiện sử dụng ({spareParts.length})</h3>
         <List
            size="small"
            loading={isLoading}
            dataSource={spareParts}
            renderItem={(item) => (
               <List.Item className={cn("px-0", item.totalNeeded > item.sparePart.quantity && "bg-yellow-50")}>
                  <List.Item.Meta
                     title={
                        <div className="flex items-center justify-between">
                           <h4 className="">{item.sparePart.name}</h4>
                           <div className="flex gap-2">
                              {item.totalNeeded > item.sparePart.quantity && (
                                 <Tag color="yellow-inverse">Không đủ trong kho</Tag>
                              )}
                              <span className="text-neutral-500">(x{item.totalNeeded})</span>
                           </div>
                        </div>
                     }
                  />
               </List.Item>
            )}
         />
      </Card>
   )
}

export default SparePartsListByIssuesSection
