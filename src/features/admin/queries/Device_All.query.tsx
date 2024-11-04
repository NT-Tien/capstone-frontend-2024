import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import Admin_Devices_All, { Response } from "../api/device/all.api"

type Props = Request | undefined;
type QueryOptions = UseQueryOptions<Response, Error, Response, (string | Props)[]>;

useDevice_AllQuery.qk = (props?: Props) => {
    return ["admin", "device", "all", props ? props : ""];
};

useDevice_AllQuery.queryOptions = (props?: Props): QueryOptions => ({
    queryKey: useDevice_AllQuery.qk(props),
    queryFn: () => Admin_Devices_All()
});

function useDevice_AllQuery(props?: Props, queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey">) {
    return useQuery({
        ...useDevice_AllQuery.queryOptions(props),
        ...queryOptions,
    });
}

export default useDevice_AllQuery;
