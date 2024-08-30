"use client"

import { Button } from "antd"
import { useRef, useState } from "react"
import { CanvasPath, ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas"

export default function App() {
   const canvasRef = useRef<ReactSketchCanvasRef | null>(null)
   const [strokes, setStrokes] = useState<CanvasPath[]>([])
   const [isFocused, setIsFocused] = useState<boolean>(false)
   

   async function handleExport() {
      const canvas = canvasRef.current

      if (canvas) {
         const image = await canvas.exportImage("png")

         console.log(image)

         const download = document.getElementById("download") as HTMLAnchorElement
         download.href = image
         download.download = "sketch.png"

         download.click()
      }
   }

   function clear() {
      const canvas = canvasRef.current

      if (canvas) {
         canvas.clearCanvas()
      }
   }

   return (
      <div>
         <h1>Draw here!</h1>
         <div className="flex gap-3">
            <Button onClick={handleExport} disabled={strokes.length === 0}>
               Export and Download
            </Button>
            <Button onClick={clear} disabled={strokes.length === 0}>
               Clear
            </Button>
         </div>
         <a className="hidden" id="download"></a>
         <div>{isFocused ? <p>Canvas is focused</p> : <p>Not focused</p>}</div>
         <div onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <ReactSketchCanvas
               ref={canvasRef}
               onChange={(e) => {
                  setStrokes(e)
               }}
               width="100%"
               height="500px"
               canvasColor="white"
               exportWithBackgroundImage
               strokeColor="#a855f7"
            />
         </div>
      </div>
   )
}
