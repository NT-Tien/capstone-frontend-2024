import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { File_Image_Upload, type Request, type Response } from "@/features/common/api/file/upload_image.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useImageUploadMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: (req: Request) => File_Image_Upload(req).then((res) => res.data),
      mutationKey: ["image", "upload"],
   })
}
