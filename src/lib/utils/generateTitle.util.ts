import AppConsts from "@/lib/constants/AppConsts"

export function generateTitle(title: string) {
   return `${title} | ${AppConsts.name}`
}
