import { Cascader, Divider, Select, Space } from "antd"
import Form from "antd/es/form"
import Input from "antd/es/input"
import admin_queries from "@/features/admin/queries"
import Button from "antd/es/button"
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { Role } from "@/lib/domain/User/role.enum"

function Head_DepartmentSection() {
   return (
      <main>
         <Head_DepartmentSection.CreateRequests />
         <Divider />
         <Head_DepartmentSection.CancelRequests />
      </main>
   )
}

Head_DepartmentSection.CreateRequests = function Component() {
   const [form] = Form.useForm()
   const api_machineModels = admin_queries.machine_model.all({ withDevices: true })
   const api_head_departments = admin_queries.user.all(
      {},
      {
         select: (data) => {
            return data.filter((user) => user.role === Role.head)
         },
      },
   )

   function handleFinish(values: any) {
      console.log(values)
   }

   return (
      <article>
         <h2 className="mb-layout text-lg font-bold">Create Requests</h2>
         <section>
            <Form form={form} onFinish={handleFinish}>
               <Form.List name="requests">
                  {(fields, operation, meta) => (
                     <>
                        {fields.map(({ key, name, ...restField }) => (
                           <Space key={key} className="grid grid-cols-4" align="baseline">
                              <Form.Item {...restField} name={[name, "device"]} rules={[{ required: true }]}>
                                 <Cascader
                                    placeholder="Select Machine Model and Device"
                                    options={api_machineModels.data?.map((machineModel) => ({
                                       value: machineModel.id,
                                       label: machineModel.name,
                                       children: machineModel.devices.map((devices) => ({
                                          value: devices.id,
                                          label: devices.id,
                                       })),
                                    }))}
                                 />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, "requester_note"]} rules={[{ required: true }]}>
                                 <Input placeholder="Enter requester note" />
                              </Form.Item>
                              <Form.Item>
                                 <Select
                                    placeholder="Select Head Department"
                                    options={api_head_departments.data?.map((user) => ({
                                       value: user.id,
                                       label: user.username,
                                    }))}
                                 />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => operation.remove(name)} />
                           </Space>
                        ))}
                        <Form.Item>
                           <Button type="dashed" onClick={() => operation.add()} block icon={<PlusOutlined />}>
                              Add field
                           </Button>
                        </Form.Item>
                        <Button block type="primary" disabled={fields.length === 0} onClick={form.submit}>
                           Create
                        </Button>
                     </>
                  )}
               </Form.List>
            </Form>
         </section>
      </article>
   )
}

Head_DepartmentSection.CancelRequests = function Component() {
   return (
      <article>
         <h2>Cancel Requests</h2>
         <section>
            <Form>
               <Form.Item>
                  <Input />
               </Form.Item>
            </Form>
         </section>
      </article>
   )
}

export default Head_DepartmentSection
