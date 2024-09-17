import { Upload, UploadProps } from "antd"
import ImgCrop, { type ImgCropProps } from "antd-img-crop"

type Props = {
   cropProps?: Omit<ImgCropProps, 'children'>
} & UploadProps

export default function ImageWithCrop(props: Props) {
   return (
      <ImgCrop {...props.cropProps}>
         <Upload.Dragger {...props}>{props.children}</Upload.Dragger>
      </ImgCrop>
   )
}
