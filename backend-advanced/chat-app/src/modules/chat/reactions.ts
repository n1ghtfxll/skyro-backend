import { Elysia } from "elysia"
import { PrismaClient } from "../../generated/prisma"

import { authentificateMiddleware } from "../auth/middlewares/authentificate";
import { reactionBody } from "./model";

const database = new PrismaClient()

export const reactions = new Elysia()
    .use(authentificateMiddleware)

    // Get all availible reactions
    .get("/reactions", async => {
        const emojis = database.emoji.findMany()
        return emojis
    })

    // React to a message
    .put("/conversation/:id/react", async ({user, params, body}) => {
        const conversationId = Number(params.id)
        const messageId = body.messageId
        const conversation = await database.conversation.findUnique({
            where: { id: conversationId },
            include: {
                members: true
            }
        })
        if (!conversation) {
            throw new Error("Conversation not found")
        }

        const message = await database.message.findUnique({
            where: { id: messageId, conversationId: conversationId }
        })
        if (!message) {
            throw new Error("Message not found")
        }
        const isMember = conversation.members.some(m => m.userId === user.id)
        if (!isMember) {
            throw new Error("Unauthorized")
        }
        const reactions = message.reactions as Array<{ userId: number; emojiId: number }>
        const existingReaction = reactions.some(r => r.userId === user.id && r.emojiId === body.reactionId)
        if (existingReaction) {
            const updatedReactions = reactions.filter(r => !(r.userId === user.id && r.emojiId === body.reactionId))
            const updated = await database.message.update({
                where: { id: messageId },
                data: { reactions: updatedReactions }
            })
            return updated
        }
        const updatedReactions = [...reactions, { userId: user.id, emojiId: body.reactionId }]
        const updated = await database.message.update({
            where: { id: messageId },
            data: { reactions: updatedReactions }
        })
    
        return updated
    },{
        body: reactionBody
    })