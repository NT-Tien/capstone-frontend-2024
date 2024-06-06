import React, { useState } from "react"
import { Button, Card, Footer, List, NavBar, Space, Toast } from "antd-mobile"
import { SearchOutline, MoreOutline, CloseOutline, AntOutline, RightOutline, AddOutline } from "antd-mobile-icons"
import CreateIssueReport from "./CreateIssueReportFloatingPanel"

interface ScanResultProps {
   isDirect: boolean
}

const ScanResults: React.FC<ScanResultProps> = ({ isDirect }) => {
   const [isPanelVisible, setIsPanelVisible] = useState(false)

   const handleButtonClick = () => {
      setIsPanelVisible(true)
   }
   const onClick = () => {
      Toast.show("点击了卡片")
   }

   const onHeaderClick = () => {
      Toast.show("点击了卡片Header区域")
   }

   const onBodyClick = () => {
      Toast.show("点击了卡片Body区域")
   }
   const right = (
      <div style={{ fontSize: 24 }}>
         <Space style={{ "--gap": "16px" }}>
            <MoreOutline />
         </Space>
      </div>
   )

   const back = () =>
      Toast.show({
         content: "点击了返回区域",
         duration: 1000,
      })

   return (
      <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
         <div
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: "#FEF7FF",
               paddingTop: "0.5rem",
               paddingBottom: "0.5rem",
            }}
         >
            <NavBar
               onBack={back}
               right={right}
               style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
            >
               Scan Results
            </NavBar>
         </div>
         <div style={{ marginTop: "3rem" }}>
            <List>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "8.2rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Device ID</p>
                     <p style={{ margin: 0 }}>AABBCC333</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "10rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Name</p>
                     <p style={{ margin: 0 }}>Carbon Airaeter</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "8.5rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Category</p>
                     <p style={{ margin: 0 }}>Manual Machines</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "5rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Production Date</p>
                     <p style={{ margin: 0 }}>24/05/2010</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "3.5rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Last Servicing Date</p>
                     <p style={{ margin: 0 }}>24/05/2024</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "9rem" }}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Position</p>
                     <p style={{ margin: 0 }}>A001</p>
                  </div>
               </List.Item>
               <List.Item style={{ display: "block", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                  <div style={{}}>
                     <p style={{ margin: 0, fontWeight: "bold" }}>Description</p>
                     <p style={{ margin: 0 }}>
                        This product has been in service for more than 14 years. Please be wary of performance issues
                        throughout usage
                     </p>
                  </div>
               </List.Item>
            </List>
         </div>
         <div style={{ position: "relative", minHeight: "" }}>
            <div style={{ paddingBottom: "50px" /* Adjust based on the Footer height */ }}>
               {/* Your main content here */}
            </div>
            <Footer
               label=""
               content={
                  <div style={{ display: "flex", gap: "3rem" }}>
                     <Button
                        style={{
                           borderColor: "#454545",
                           borderWidth: "0.5px",
                           borderStyle: "solid",
                           borderRadius: "5rem",
                           color: "#6750A4",
                        }}
                     >
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                           <p style={{ fontSize: "18px" }}>&#8592;</p>
                           <p>Back</p>
                        </div>
                     </Button>
                     <div>
                        <Button
                           onClick={handleButtonClick}
                           style={{ backgroundColor: "#6750A4", borderRadius: "5rem", color: "white", width: "18rem" }}
                        >
                           <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                              <p style={{ fontSize: "18px" }}>&#43;</p>
                              <p>Make Report</p>
                           </div>
                        </Button>
                        <CreateIssueReport isVisible={isPanelVisible}/>
                     </div>
                  </div>
               }
               style={{
                  position: "fixed",
                  bottom: 0,
                  width: "100%",
                  backgroundColor: "white",
               }}
            />
         </div>
      </div>
   )
}

export default ScanResults
