export class mau_nhap_linh_kien_1_validator {
   static validate(obj: any) {
      if (!Array.isArray(obj)) {
         console.log("Not array")
         return false
      }

      for (const item of obj) {
         if (
            !("Mã linh kiện" in item) ||
            !("Tên linh kiện" in item) ||
            !("Tên mẫu máy" in item) ||
            !("Số lượng nhập" in item)
         ) {
            console.log("Missing key")
            return false
         }

         if (
            typeof item["Mã linh kiện"] !== "string" ||
            typeof item["Tên linh kiện"] !== "string" ||
            typeof item["Tên mẫu máy"] !== "string" ||
            typeof item["Số lượng nhập"] !== "number"
         ) {
            console.log("Invalid type")
            return false
         }
      }

      return true
   }
}
