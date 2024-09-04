"use client"

import dynamic from "next/dynamic"
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type Props = {
   series: number[]
   text: string[]
   colors?: string[]
    width?: number
    height?: number
}

const PieChart: React.FC<Props> = (props) => {
   return (
      <ReactApexChart
         options={{
            chart: {
               fontFamily: "Satoshi, sans-serif",
               type: "donut",
            },
            colors: props.colors ?? ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF"],
            labels: props.text,
            legend: {
               show: false,
               position: "bottom",
            },

            plotOptions: {
               pie: {
                  donut: {
                     size: "65%",
                     background: "transparent",
                  },
               },
            },
            dataLabels: {
               enabled: false,
            },
            responsive: [
               {
                  breakpoint: 2600,
                  options: {
                     chart: {
                        width: props.width ?? 300,
                        height: props.height ?? 300,
                     },
                  },
               },
            ],
         }}
         series={props.series}
         type="donut"
         height={props.height}
         width={props.width}
      />
   )
}

export default PieChart
