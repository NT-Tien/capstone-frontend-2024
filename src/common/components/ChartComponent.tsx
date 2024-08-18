// "use client"

// import React, { useEffect } from 'react';
// import ApexCharts from 'apexcharts';
// import dynamic from 'next/dynamic';

// const DynamicApexCharts = dynamic(() => import("apexcharts").then((mod) => mod.default), {
//   ssr: false,
// })

// interface ChartOptions {
//   // Define the types as before
//   colors: string[];
//   series: Array<{
//     name: string;
//     color: string;
//     data: Array<{ x: string; y: number }>;
//   }>;
//   chart: {
//     type: string;
//     height: string;
//     fontFamily: string;
//     toolbar: { show: boolean };
//   };
//   plotOptions: {
//     bar: {
//       horizontal: boolean;
//       columnWidth: string;
//       borderRadiusApplication: string;
//       borderRadius: number;
//     };
//   };
//   tooltip: {
//     shared: boolean;
//     intersect: boolean;
//     style: { fontFamily: string };
//   };
//   states: {
//     hover: {
//       filter: { type: string; value: number };
//     };
//   };
//   stroke: {
//     show: boolean;
//     width: number;
//     colors: string[];
//   };
//   grid: {
//     show: boolean;
//     strokeDashArray: number;
//     padding: { left: number; right: number; top: number };
//   };
//   dataLabels: { enabled: boolean };
//   legend: { show: boolean };
//   xaxis: {
//     floating: boolean;
//     labels: { show: boolean; style: { fontFamily: string; cssClass: string } };
//     axisBorder: { show: boolean };
//     axisTicks: { show: boolean };
//   };
//   yaxis: { show: boolean };
//   fill: { opacity: number };
// }

// const ColumnChart: React.FC = () => {
//   useEffect(() => {
//     const options: ChartOptions = {
//       colors: ["#A3BF37", "#F4E296"],
//       series: [
//         {
//           name: "Organic",
//           color: "#A3BF37",
//           data: [
//             { x: "Mon", y: 231 },
//             { x: "Tue", y: 122 },
//             { x: "Wed", y: 63 },
//             { x: "Thu", y: 421 },
//             { x: "Fri", y: 122 },
//             { x: "Sat", y: 323 },
//             { x: "Sun", y: 111 },
//           ],
//         },
//         {
//           name: "Social media",
//           color: "#F4E296",
//           data: [
//             { x: "Mon", y: 232 },
//             { x: "Tue", y: 113 },
//             { x: "Wed", y: 341 },
//             { x: "Thu", y: 224 },
//             { x: "Fri", y: 522 },
//             { x: "Sat", y: 411 },
//             { x: "Sun", y: 243 },
//           ],
//         },
//       ],
//       chart: {
//         type: "bar",
//         height: "250px",
//         fontFamily: "Inter, sans-serif",
//         toolbar: { show: false },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: "70%",
//           borderRadiusApplication: "end",
//           borderRadius: 8,
//         },
//       },
//       tooltip: {
//         shared: true,
//         intersect: false,
//         style: { fontFamily: "Inter, sans-serif" },
//       },
//       states: {
//         hover: {
//           filter: { type: "darken", value: 1 },
//         },
//       },
//       stroke: {
//         show: true,
//         width: 0,
//         colors: ["transparent"],
//       },
//       grid: {
//         show: false,
//         strokeDashArray: 4,
//         padding: { left: 2, right: 2, top: -14 },
//       },
//       dataLabels: { enabled: false },
//       legend: { show: false },
//       xaxis: {
//         floating: false,
//         labels: {
//           show: true,
//           style: {
//             fontFamily: "Inter, sans-serif",
//             cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
//           },
//         },
//         axisBorder: { show: false },
//         axisTicks: { show: false },
//       },
//       yaxis: { show: false },
//       fill: { opacity: 1 },
//     };

//     const chartElement = document.getElementById("column-chart");
//     let chart: ApexCharts | null = null;

//     if (chartElement && typeof ApexCharts !== "undefined") {
//       chart = new ApexCharts(chartElement, options);
//       chart.render();
//     }

//     return () => {
//       if (chart) {
//         chart.destroy();
//       }
//     };
//   }, []);

//   return <div id="column-chart" />;
// };

// export default ColumnChart;

export default function Chart() {
  return "Chart"
}