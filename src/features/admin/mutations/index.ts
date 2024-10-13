import useArea_Create from "@/features/admin/mutations/Area_Create.mutation"
import useArea_Update from "@/features/admin/mutations/Area_Update.mutation"
import useArea_Delete from "@/features/admin/mutations/Area_Delete.mutation"
import useMachineModel_Create from "@/features/admin/mutations/MachineModel_Create.mutation"
import useMachineModel_Update from "@/features/admin/mutations/MachineModel_Update.mutation"
import useMachineModel_Delete from "@/features/admin/mutations/MachineModel_Delete.mutation"

const admin_mutations = {
   area: {
      create: useArea_Create,
      update: useArea_Update,
      delete: useArea_Delete,
   },
   machineModel: {
      create: useMachineModel_Create,
      update: useMachineModel_Update,
      delete: useMachineModel_Delete,
   },
}

export default admin_mutations
