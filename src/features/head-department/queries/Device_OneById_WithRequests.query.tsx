import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"
import Head_Device_OneId_WithRequests from "@/features/head-department/api/device/one-id_with-requests"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"

type Props = {
   deviceId: string | null
}

useDevice_OneById_WithRequestsQuery.qk = (props: Props) => [
   "head-department",
   "device",
   "one-by-id",
   props.deviceId,
   "with-requests",
]
useDevice_OneById_WithRequestsQuery.queryOptions = (
   props: Props,
): UseQueryOptions<DeviceDto, Error, DeviceDto, (string | null)[]> => ({
   queryKey: useDevice_OneById_WithRequestsQuery.qk(props),
   queryFn: () => Head_Device_OneId_WithRequests({ id: props.deviceId ?? "" }),
   enabled: !!props.deviceId,
   ...generateQueryNotFoundOptions(),
})

export default function useDevice_OneById_WithRequestsQuery(props: Props) {
   return useQuery(useDevice_OneById_WithRequestsQuery.queryOptions(props))
}
