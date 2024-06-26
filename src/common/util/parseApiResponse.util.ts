import { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from "@/common/types/ApiResponse"
import { UnauthorizedError } from "@/common/error/unauthorized.error"

/**
 * This function adds typing to the response and error handling of an API call.
 * NOTE: if using AXIOS, only errors allowed through validateStatus will be caught in onError (for defaults, see axios.config.ts)
 *
 * @param response raw response
 * @param onSuccess response success handler
 * @param onError response error handler
 */
export function parseApiResponse<T extends ApiResponse<T>>(
   response: string,
   onSuccess: (response: ApiSuccessResponse<T>) => unknown = (res) => res.data,
   onError: (response: ApiErrorResponse) => unknown = (res) => {
      throw new Error(res.message)
   },
) {
   const parsedResponse = JSON.parse(response) as any
   if (parsedResponse.data !== undefined) {
      // Response was successful
      return onSuccess(parsedResponse as ApiSuccessResponse<T>)
   } else {
      if ((parsedResponse as ApiErrorResponse).statusCode === 403) {
         throw new UnauthorizedError()
      }

      // error response
      return onError(parsedResponse as ApiErrorResponse)
   }
}
