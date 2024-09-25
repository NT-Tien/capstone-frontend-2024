import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import generateQueryNotFoundOptions from "@/lib/utils/generateQueryNotFoundOptions.util"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import Head_Device_OneId from "@/features/head-department/api/device/one-id"

type Props = {
   deviceId: string | null
}

useDevice_OneByIdQuery.qk = (props: Props) => ["head-department", "device", "one-by-id", props.deviceId]
useDevice_OneByIdQuery.queryOptions = (
   props: Props,
): UseQueryOptions<DeviceDto, Error, DeviceDto, (string | null)[]> => ({
   queryKey: useDevice_OneByIdQuery.qk(props),
   queryFn: () => Head_Device_OneId({ id: props.deviceId ?? "" }),
   enabled: !!props.deviceId,
   ...generateQueryNotFoundOptions(),
})

export default function useDevice_OneByIdQuery(props: Props) {
   return useQuery(useDevice_OneByIdQuery.queryOptions(props))
}
