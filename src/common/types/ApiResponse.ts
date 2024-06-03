export type ApiSuccessResponse<T> = {
   data: T
   statusCode: number
   message: string
}

export type ApiErrorResponse = {
   message: string
   statusCode: number
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
