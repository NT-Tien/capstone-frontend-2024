import { clientEnv } from "@/env"
import { Image, ImageProps } from "antd"

type Props = ImageProps

function BackendImage(props: Props) {
   return <Image {...props} src={clientEnv.BACKEND_URL + "/file-image/" + props.src} />
}

export default BackendImage