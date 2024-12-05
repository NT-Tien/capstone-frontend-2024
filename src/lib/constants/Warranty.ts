export const SendWarrantyTypeErrorId = "bc4b133f-3911-464a-a3fd-1850bd88ead9"
export const ReceiveWarrantyTypeErrorId = "2d45b02b-f4b7-470b-815f-817628fee1fd"
export const DisassembleDeviceTypeErrorId = "52CD07EE-B12B-4C82-A787-FC63D027D4BD".toLowerCase()
export const AssembleDeviceTypeErrorId = "A235E96C-86B5-4BD4-A1F6-FCF4BBCE0E6E".toLowerCase()
export const InstallReplacementDeviceTypeErrorId = '09ef1061-33f2-431f-ac11-62419896d979'
export const DismantleReplacementDeviceTypeErrorId = 'adb5908e-3212-44a5-b663-911cda778ee9'

export const DismantleOldDeviceTypeErrorId = "2dd17dcc-c571-4248-ac8b-3a77ef2a12bc"
export const InstallNewDeviceTypeErrorId = "67597aa6-2ee8-40c1-a2ac-b66b06d206e8"

export const SystemTypeErrorIds = new Set([
   SendWarrantyTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   DismantleOldDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   AssembleDeviceTypeErrorId,
])
