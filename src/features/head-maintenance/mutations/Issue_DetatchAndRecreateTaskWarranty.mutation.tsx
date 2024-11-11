import HeadStaff_Issue_Update from "@/features/head-maintenance/api/issue/update.api"
import HeadStaff_Task_Create from "@/features/head-maintenance/api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/features/head-maintenance/api/task/update-assignFixer.api"
import HeadStaff_Task_UpdateAwaitSparePartToAssignFixer from "@/features/head-maintenance/api/task/update-awaitSparePartToAssignFixer.api"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import IssueUtil from "@/lib/domain/Issue/Issue.util"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import TaskNameGenerator from "@/lib/domain/Task/TaskNameGenerator.util"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { useQueryClient } from "@tanstack/react-query"

type Request = {
   issueDto: IssueDto
   requestId: string
   fixerId: string
   fixerDate: string
   priority: boolean
}

type Response = TaskDto

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_DetatchAndRecreateTaskWarranty(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         // detatch issue
         await HeadStaff_Issue_Update({
            id: req.issueDto.id,
            payload: {
               task: null,
               status: IssueStatusEnum.PENDING,
            },
         })

         const request = await queryClient.fetchQuery(
            head_maintenance_queries.request.one.queryOptions({
               id: req.requestId,
            }),
         )

         const otherTypeErrorId = IssueUtil.warranty_getNextIssue(req.issueDto)
         const otherIssue = request.issues.find((i) => i.typeError.id === otherTypeErrorId)

         if (!otherIssue) {
            throw new Error("Other issue not found")
         }

         // create new warranty task
         const task = await HeadStaff_Task_Create({
            name: TaskNameGenerator.generateWarranty(request),
            request: request.id,
            issueIDs: [req.issueDto.id, otherIssue.id],
            operator: 0,
            totalTime: 0,
            priority: false,
         })

         await HeadStaff_Task_UpdateAwaitSparePartToAssignFixer({
            id: task.id,
         })

         await HeadStaff_Task_UpdateAssignFixer({
            id: task.id,
            payload: {
               fixer: req.fixerId,
               fixerDate: req.fixerDate,
               priority: req.priority,
            },
         })

         return task
      },
      mutationKey: ["head-maintenance", "issue", "detatch-and-recreate-task", "warranty"],
   })
}
