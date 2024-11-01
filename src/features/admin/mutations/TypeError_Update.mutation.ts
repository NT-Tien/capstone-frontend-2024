import useCustomMutation from "@/lib/hooks/useCustomMutation";
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps";
import Admin_TypeError_Update, { type Request, type Response } from "../api/type-error/update.api";

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>

export default function useTypeError_Update(props?: Props) {
    return useCustomMutation({
        options: props ?? null,
        mutationFn: Admin_TypeError_Update,
        mutationKey: ["admin", "type-error", "update"]
    })
}