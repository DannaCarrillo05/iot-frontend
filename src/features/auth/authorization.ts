import { createAccessControl } from "better-auth/plugins"

const statements = {
	users: ["read", "update", "delete", "create"],
} as const

export const accessControl = createAccessControl(statements)
