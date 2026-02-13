import { t } from "elysia"

export const secondMemberBody = t.Object({
    secondMember: t.Number()
})

export const conversationNameBody = t.Object({
    name: t.String()
})

export const messageBody = t.Object({
    message: t.String(),
    replyId: t.Optional(t.Number())
})

export const reactionBody = t.Object({
    reactionId: t.Number(),
    messageId: t.Number()
})