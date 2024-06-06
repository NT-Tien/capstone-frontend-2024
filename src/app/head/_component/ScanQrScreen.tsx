"use client"
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import React, { useState } from "react"
import { Button, Card, Footer, NavBar, Space, Toast } from "antd-mobile"
import { MoreOutline } from "antd-mobile-icons"
// @ts-ignore
import QrReader from "react-qr-scanner"
import ScanResults from "./ScanResults"
import { Avatar } from 'antd';

const ScanQrScreen: React.FC = () => {
   const router = useRouter(); // Use the useRouter hook to get the router object
   const [delay, setDelay] = useState<number>(100);
   const [result, setResult] = useState<string>("No result");

   const right = (
      <div style={{ fontSize: 24 }}>
         <Space style={{ "--gap": "16px" }}>
            <MoreOutline />
         </Space>
      </div>
   )

   const back = () =>
      Toast.show({
         content: "Clicked the back area",
         duration: 1000,
      })

   const handleScan = (data: string | null) => {
      if (data) {
         setResult(data);
      }
   }

   const handleError = (err: any) => {
      console.error(err)
   }

   const handleNavigateToScanResults = () => {
      router.push('/head/_component/ScanResults');
   };


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
               onBack={back}
               right={right}
               style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
            >
               Scanner
            </NavBar>
         </div>
         <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "calc(100vh / 2)" }}>
               <QrReader
                  delay={delay}
                  style={{ width: "90%", borderRadius: "6%" }}
                  onError={handleError}
                  onScan={handleScan}
               />
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
            <div style={{ paddingBottom: "50px" }}>
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
                     <Button
                        onClick={handleNavigateToScanResults}
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
                     {/* {showScanResults && <ScanResults/>} */}
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
   );
}

export default ScanQrScreen;
