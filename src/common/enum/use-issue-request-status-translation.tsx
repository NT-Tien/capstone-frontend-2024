import { useTranslation } from "react-i18next"
import { FixRequestStatus } from "./fix-request-status.enum"
import { FixType } from "./fix-type.enum"

export const useIssueRequestStatusTranslation = () => {
   const { t } = useTranslation()

   const getStatusTranslation = (status?: string): string => {
      switch (status) {
         case FixRequestStatus.PENDING:
            return t("status.pending")
         case FixRequestStatus.APPROVED:
            return t("status.approved")
         case FixRequestStatus.REJECTED:
            return t("status.rejected")
         default:
            return "-"
      }
   }

   const getFixTypeTranslation = (type: FixType) => {
      switch (type) {
         case FixType.REPLACE:
            return t("fixType.replace")
         case FixType.REPAIR:
            return t("fixType.repair")
         default:
            return type
      }
   }

   return { getStatusTranslation, getFixTypeTranslation }
}
