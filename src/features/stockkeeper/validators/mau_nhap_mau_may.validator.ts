export class mau_nhap_mau_may_validator {
   static validate(obj: any) {
      if (!Array.isArray(obj)) {
         console.log("Not array")
         return false
      }

      for (const item of obj) {
         if (
            !("Mã mẫu máy" in item) ||
            !("Tên mẫu máy" in item) ||
            !("Miêu tả" in item) ||
            !("Số lượng nhập" in item)
         ) {
            console.log("Missing key")
            return false
         }

         if (
            typeof item["Mã mẫu máy"] !== "string" ||
            typeof item["Tên mẫu máy"] !== "string" ||
            typeof item["Miêu tả"] !== "string" ||
            typeof item["Số lượng nhập"] !== "number"
         ) {
            console.log("Invalid type")
            return false
         }
      }

      return true
   }
}
