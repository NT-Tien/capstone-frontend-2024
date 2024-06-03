import axios from "axios"
import { clientEnv } from "@/env"

const api = axios.create({
   baseURL: clientEnv.BACKEND_URL,
   timeout: 10000, // 10 seconds
   validateStatus: (status) => status >= 200 && status < 500, // allow only 2xx, 3xx, 4xx codes,
   headers: {
      "Content-Type": "application/json",
   },
})

api.interceptors.request.use(
   (config) => {
      console.info("[DEV MODE]: Request made with config: ", config)
      return config
   },
   (error) => {
      console.info("[DEV MODE]: Request error: ", error)
      return Promise.reject(error)
   },
   {
      runWhen: () => clientEnv.NODE_ENV === "development",
      synchronous: false,
   },
)

api.interceptors.response.use(
   (config) => {
      console.info("[DEV MODE]: Response received with config: ", config)
      return config
   },
   (error) => {
      console.info("[DEV MODE]: Response error: ", error)
      return Promise.reject(error)
   },
   {
      runWhen: () => clientEnv.NODE_ENV === "development",
      synchronous: false,
   },
)

export default api
