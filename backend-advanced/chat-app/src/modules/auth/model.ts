import { t } from "elysia"

// Validation schema
export const registerBody = t.Object({
    email: t.String({
        format: "email"
    }),
    password: t.String({
        minLength: 3,
        maxLength: 120
    })
})

export const loginBody = t.Object({
    email: t.String({
        format: "email"
    }),
    password: t.String()
})