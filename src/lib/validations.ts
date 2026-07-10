import { z } from "zod"

import { CLIENT_STATUSES } from "@/types/client"

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(120, { message: "Name is too long" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Phone is required" })
    .max(40, { message: "Phone is too long" })
    .regex(/^[+\d][\d\s()-]*$/, { message: "Enter a valid phone number" }),
  status: z.enum(CLIENT_STATUSES, {
    message: "Status is required",
  }),
})

export type ClientFormValues = z.infer<typeof clientSchema>
