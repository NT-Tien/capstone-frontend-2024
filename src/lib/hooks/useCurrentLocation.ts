"use client"

import { App } from "antd"
import { useEffect, useState } from "react"

function useCurrentLocation() {
   const [location, setLocation] = useState<GeolocationPosition | undefined>()
   const { message } = App.useApp()

   useEffect(() => {
      const watchId = window.navigator.geolocation.watchPosition(
         (data) => {
            setLocation(data)
         },
         (error) => {
            message.error(error.message)
         },
      )

      return () => {
         window.navigator.geolocation.clearWatch(watchId)
      }
   }, [])

   return location
}

export default useCurrentLocation