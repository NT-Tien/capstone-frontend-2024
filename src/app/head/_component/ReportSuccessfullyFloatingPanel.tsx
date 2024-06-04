import React, { useEffect, useRef, useState } from "react"
import { Button, FloatingPanel, Footer, Result } from "antd-mobile"
import { CheckCircleFill, ClockCircleOutline } from "antd-mobile-icons"

interface FloatingPanelsProps {
   isVisible: boolean
}

const anchors = [100, window.innerHeight * 0.2, window.innerHeight * 0.8]
const minHeight = anchors[0]
const maxHeight = anchors[anchors.length - 1]

const ReportSuccessfullyFloatingPanels: React.FC<FloatingPanelsProps> = ({ isVisible }) => {
   const targetRef = useRef<HTMLDivElement>(null)

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

   return (
      isVisible && (
         <div style={{ padding: 12, backgroundColor: '#F7F2FA' }}>
            <FloatingPanel anchors={anchors} onHeightChange={onHeightChange} style={{ backgroundColor: '#F7F2FA' }}>
               <div ref={targetRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: '#F7F2FA' }}>
                  <div className="reprot">
                     <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                        <CheckCircleFill style={{ fontSize: "150px", color: "#10B981" }} />
                     </div>
                     <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <p style={{ fontSize: "25px", fontWeight: "bold", color: "black" }}>
                           Report Created Successfully
                        </p>
                        <p style={{ fontSize: "18px", color: "black" }}>
                           Your report has been successfully submitted to the system. Please wait 1-2 business days for
                           our technicians to service your machine.
                        </p>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <Button style={{ backgroundColor: "#6750A4", borderRadius: "5rem", color: "white" }}>
                           <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <ClockCircleOutline style={{ fontSize: '18px' }} />
                              <p style={{ fontSize: '18px' }}>Go to Report History</p>
                           </div>
                        </Button>
                     </div>
                  </div>
               </div>
            </FloatingPanel>
         </div>
      )
   )
}

export default ReportSuccessfullyFloatingPanels
