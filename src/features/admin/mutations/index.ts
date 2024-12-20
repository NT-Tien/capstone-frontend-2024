import useArea_Create from "@/features/admin/mutations/Area_Create.mutation"
import useArea_Update from "@/features/admin/mutations/Area_Update.mutation"
import useArea_Delete from "@/features/admin/mutations/Area_Delete.mutation"
import useMachineModel_Create from "@/features/admin/mutations/MachineModel_Create.mutation"
import useMachineModel_Update from "@/features/admin/mutations/MachineModel_Update.mutation"
import useMachineModel_Delete from "@/features/admin/mutations/MachineModel_Delete.mutation"
import useDevice_Create from "./Device_Create.mutation"
import useDevice_Update from "./Device_Update.mutation"
import useSparePart_Create from "./SparePart_Create.mutation"
import useSparePart_Update from "./SparePart_Update.mutation"
import useTypeError_Create from "./TypeError_Create.mutation"
import useTypeError_Update from "./TypeError_Update.mutation"

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
   device: {
      create: useDevice_Create,
      update: useDevice_Update,
   },
   sparePart: {
      create: useSparePart_Create,
      update: useSparePart_Update,
   },
   typeError: {
      create: useTypeError_Create,
      update: useTypeError_Update,
   }
}

export default admin_mutations
