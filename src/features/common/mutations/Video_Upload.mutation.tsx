import { File_Video_Upload, type Request, type Response } from "@/features/common/api/file/upload_video.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useVideoUploadMutation(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: (req: Request) => File_Video_Upload(req).then((res) => res.data),
      mutationKey: ["video", "upload"],
   })
}
