import { Avatar } from "antd"
import { Button, Card, Footer, NavBar, Space, Toast } from "antd-mobile"
import { MoreOutline } from "antd-mobile-icons"
import React, { Component, ChangeEvent } from "react"
// @ts-ignore
import QrReader from "react-qr-scanner"
import ScanResults from "./ScanResults"

interface TestState {
   delay: number
   result: string
}

class ScanQrScreen extends Component<{}, TestState> {
   right = (
      <div style={{ fontSize: 24 }}>
         <Space style={{ "--gap": "16px" }}>
            <MoreOutline />
         </Space>
      </div>
   )

   back = () =>
      Toast.show({
         content: "点击了返回区域",
         duration: 1000,
      })

   constructor(props: {}) {
      super(props)
      this.state = {
         delay: 100,
         result: "No result",
      }

      this.handleScan = this.handleScan.bind(this)
      this.handleError = this.handleError.bind(this)
   }


   handleScan(data: string | null) {
      if (data) {
         this.setState({
            result: data,
         })
      }
   }

   handleError(err: any) {
      console.error(err)
   }

   render() {
      const containerStyle: React.CSSProperties = {
         display: "flex",
         justifyContent: "center",
         alignItems: "flex-start",
      }

      const qrReaderContainerStyle: React.CSSProperties = {
         display: "flex",
         flexDirection: "column",
         justifyContent: "center",
         alignItems: "center",
         height: "calc(100vh / 2)",
      }

      const previewStyle: React.CSSProperties = {
         width: "90%",
         borderRadius: "6%",
      }

      return (
         <div>
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
                  onBack={this.back}
                  right={this.right}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
               >
                  Scanner
               </NavBar>
            </div>
            <div style={containerStyle}>
               <div style={qrReaderContainerStyle}>
                  <QrReader
                     delay={this.state.delay}
                     style={previewStyle}
                     onError={this.handleError}
                     onScan={this.handleScan}
                  />
                  {/* <p>{this.state.result}</p> */}
               </div>
            </div>
            <div className={`card`} style={{ marginTop: "1rem" }}>
               <Card
                  style={{
                     backgroundColor: "white", //#FEF7FF
                     marginLeft: "1rem",
                     marginRight: "1rem",
                     marginBottom: "0.5rem",
                     border: "0.5px solid #6750A4",
                  }}
               >
                  <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                     <Avatar style={{ fontSize: "18px", textAlign: "center", backgroundColor: "#6750A4" }}>AI</Avatar>
                     <div>
                        <p>Hello there!</p>
                        <p>Please place the QR Code in the box above</p>
                     </div>
                  </div>
               </Card>
            </div>
            <div style={{ position: "relative", minHeight: "100vh" }}>
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
                              style={{
                                 backgroundColor: "#6750A4",
                                 borderRadius: "5rem",
                                 color: "white",
                                 width: "18rem",
                              }}
                           >
                              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                 <p style={{ fontSize: "18px" }}>&#43;</p>
                                 <p>Manually Input ID</p>
                              </div>
                           </Button>
                        </div>
                     </div>
                  }
                  style={{
                     position: "fixed",
                     bottom: 0,
                     width: "100%",
                     backgroundColor: "white", // Optional: Adjust based on your Footer style
                  }}
               />
            </div>
         </div>
      )
   }
}

export default ScanQrScreen
