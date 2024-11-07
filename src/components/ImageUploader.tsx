"use client"

import ClickableArea from "@/components/ClickableArea"
import { clientEnv } from "@/env"
import { ImageSquare } from "@phosphor-icons/react"
import { Button, Image } from "antd"
import dynamic from "next/dynamic"
import { useState } from "react"

// const CaptureImageDrawer = dynamic(() => import("./CaptureImage.drawer"), { ssr: false })
// const CaptureVideoDrawer = dynamic(() => import("./CaptureVideo.drawer"), { ssr: false })

type Props = {
   imageUris: string[]
   setImageUris: (imageUris: string[]) => void

   maxCount?: number
}

function ImageUploader(props: Props) {
   const maxCount = props.maxCount ?? 4

   return (
      <>
         <div className="grid grid-cols-4 gap-2">
            {props.imageUris.map((uri, index) => (
               <Image
                  alt="image"
                  key={uri + "_image"}
                  src={clientEnv.BACKEND_URL + "/file-image/" + uri}
                  className="aspect-square w-full rounded-lg"
               />
            ))}
            {new Array(maxCount - props.imageUris.length).fill(null).map((_, index) => (
               <ClickableArea
                  key={index + "_empty_image"}
                  className="grid aspect-square place-items-center rounded-lg bg-gray-100 text-gray-300"
               >
                  <ImageSquare size={32} />
               </ClickableArea>
            ))}
         </div>
      </>
   )
}

export default ImageUploader
