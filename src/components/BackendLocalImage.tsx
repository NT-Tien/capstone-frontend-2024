import { clientEnv } from "@/env"
import { Image, ImageProps } from "antd"

type Props = ImageProps

function BackendLocalImage(props: Props) {
   return (
      <Image
         alt="image"
         {...props}
         src={clientEnv.STATIC_PROD_BACKEND_URL + "/uploads/" + props.src}
      />
   )
}

export default BackendLocalImage
