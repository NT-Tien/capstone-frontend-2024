import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Stockkeeper_ExportWareHouse_Update from "@/features/stockkeeper/api/exports/update-many.api"
import { ExportStatus } from "@/lib/domain/ExportWarehouse/ExportStatus.enum"

type Request = {
   id: string
}

type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useExportWarehouse_Accept(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return Stockkeeper_ExportWareHouse_Update({
            id: req.id,
            payload: {
               status: ExportStatus.ACCEPTED,
            },
         })
      },
      mutationKey: ["stockkeeper", "export-warehouse", "accept"],
   })
}
