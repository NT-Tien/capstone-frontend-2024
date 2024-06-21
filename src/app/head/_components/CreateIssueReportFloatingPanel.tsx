import React, { useEffect, useRef, useState } from "react"
import { Button, FloatingPanel } from "antd-mobile"
import { Form, Input } from "antd"
import ReportSuccessfullyFloatingPanels from "./ReportSuccessfullyFloatingPanel"

interface FloatingPanelsProps {
   isVisible: boolean
}

const anchors = [100, window.innerHeight * 0.2, window.innerHeight * 0.8]
const minHeight = anchors[0]
const maxHeight = anchors[anchors.length - 1]

const CreateIssueReport: React.FC<FloatingPanelsProps> = ({ isVisible }) => {
   const targetRef = useRef<HTMLDivElement>(null)
   const [isReportSubmitted, setIsReportSubmitted] = useState(false)

   const onHeightChange = (height: number) => {
      const ratio = height / maxHeight
      const target = targetRef.current
      if (!target) return
      target.style.height = "100%"
      target.style.backgroundColor = `rgba(247,242,250,${ratio})`
   }

   useEffect(() => {
      if (isVisible) {
         onHeightChange(minHeight)
      }
   }, [isVisible])

   const handleFormSubmit = () => {
      setIsReportSubmitted(true)
   }

   return (
      isVisible && (
         <div style={{ padding: 12 }}>
            {!isReportSubmitted ? (

            <FloatingPanel anchors={anchors} onHeightChange={onHeightChange}>
               <div ref={targetRef}>
                  <div style={{ display: "flex", marginLeft: "1.5rem", marginTop: "1rem" }}>
                     <p style={{ color: "black", fontSize: "25px", fontWeight: "inherit" }}>Create Issue Report</p>
                  </div>
                  <div style={{ marginLeft: '2rem', marginRight: '2rem', marginTop: '1rem' }}>
                     <div>
                        <Form.Item label="Name" labelAlign="left" labelCol={{ span: 24 }}>
                           <Input placeholder="What is the name of your issue?" />
                        </Form.Item>
                     </div>
                     <div>
                     <Form.Item label="Description" labelAlign="left" labelCol={{ span: 24 }}>
                           <Input.TextArea placeholder="Give us a brief description of the issue" rows={4} />
                        </Form.Item>
                     </div>
                  </div>
                  <div style={{ display: 'flex', float: 'right', marginRight: '2rem' }}>
                     <Button
                     onClick={handleFormSubmit}
                        style={{ backgroundColor: "#6750A4", borderRadius: "5rem", color: "white", width: "10rem" }}
                     >
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                           <p style={{ fontSize: "18px" }}>&#43;</p>
                           <p>Submit</p>
                        </div>
                     </Button>
                  </div>
               </div>
            </FloatingPanel>
            ) : (
               <ReportSuccessfullyFloatingPanels isVisible={true}/>
            )
            }
         </div>
      )
   )
}

export default CreateIssueReport
