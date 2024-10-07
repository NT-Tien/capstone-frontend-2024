const RequestErrors = [
   {
      label: "+ Tạo vấn đề mới",
      value: "create",
   },
   {
      label: "Vấn đề nguồn điện",
      options: [
         { label: "Máy không khởi động được", value: "Máy không khởi động được" },
         { label: "Dây điện bị sờn", value: "Dây điện bị sờn" },
         { label: "Điện áp không ổn định gây ra sự cố", value: "Điện áp không ổn định gây ra sự cố" },
      ],
   },
   {
      label: "Vấn đề cơ khí",
      options: [
         { label: "Mô tơ bị kẹt", value: "Mô tơ bị kẹt" },
         { label: "Dây curoa bị trượt hoặc đứt", value: "Dây curoa bị trượt hoặc đứt" },
         { label: "Bánh răng bị mòn", value: "Bánh răng bị mòn" },
         { label: "Máy cần tra dầu", value: "Máy cần tra dầu" },
      ],
   },
   {
      label: "Vấn đề chỉ",
      options: [
         { label: "Chỉ liên tục bị đứt", value: "Chỉ liên tục bị đứt" },
         { label: "Chỉ bị rối dưới vải", value: "Chỉ bị rối dưới vải" },
         { label: "Chỉ suốt không bắt được", value: "Chỉ suốt không bắt được" },
         { label: "Sức căng của chỉ trên có vấn đề", value: "Sức căng của chỉ trên có vấn đề" },
      ],
   },
]

export default RequestErrors
