import useCustomMutation from "@/lib/hooks/useCustomMutation";
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps";
import Admin_TypeError_Create, { type Request, type Response } from "../api/type-error/create.api";

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>

export default function useTypeError_Create(props?: Props) {
    return useCustomMutation({
        options: props ?? null,
        mutationFn: Admin_TypeError_Create,
        mutationKey: ["admin", "type-error", "create"]
    }) 
}