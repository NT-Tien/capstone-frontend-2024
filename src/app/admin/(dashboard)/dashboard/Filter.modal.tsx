import { DatePicker, Modal, ModalProps } from "antd"
import { Dispatch, SetStateAction } from "react"
import Form from "antd/es/form"
import dayjs from "dayjs"

type FieldType = {
   dateRange: [dayjs.Dayjs, dayjs.Dayjs]
}
type Query = {
   startDate: string
   endDate: string
}

type FilterModalProps = {
   query?: Query
   setQuery?: Dispatch<SetStateAction<Query>>
}
type Props = Omit<ModalProps, "children"> &
   FilterModalProps & {
      handleClose?: () => void
   }

function FilterModal(props: Props) {
   const [form] = Form.useForm<FieldType>()

   function handleSubmit(values: FieldType) {
      const [startDate, endDate] = values.dateRange
      props.setQuery?.({
         startDate: startDate.toISOString(),
         endDate: endDate.toISOString(),
      })
      props.handleClose?.()
   }

   return (
      <Modal title="Lọc dữ liệu" centered onOk={form.submit} {...props}>
         <Form<FieldType>
            layout="vertical"
            requiredMark={false}
            form={form}
            initialValues={{
               dateRange: props.query ? [dayjs(props.query.startDate), dayjs(props.query.endDate)] : undefined,
            }}
            onFinish={handleSubmit}
         >
            <Form.Item<FieldType>
               name="dateRange"
               label="Chọn khoảng thời gian lọc dữ liệu"
               rules={[{ required: true }]}
            >
               <DatePicker.RangePicker className="w-full" />
            </Form.Item>
         </Form>
      </Modal>
   )
}

export default FilterModal
export type { FilterModalProps, Query }
