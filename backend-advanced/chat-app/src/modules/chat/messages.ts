import { Elysia} from "elysia"
import { PrismaClient } from "../../generated/prisma"

import { messageDTO } from "./dto/message";
import { userDTO } from "../auth/dto/user";
import { authentificateMiddleware } from "../auth/middlewares/authentificate";
import { messageBody } from "./model";

const database = new PrismaClient()

export const messages = new Elysia()
    .use(authentificateMiddleware)

    // Gets messages from the conversation with another user
    .get("/conversation/:id", async ({ user, params, query }) => {
        const conversationId = Number(params.id)
        const loadMessageCount = 4
        const pageOffset = Number(query.offset) * loadMessageCount | 0

        const conversation = await database.conversation.findUnique({
            where: { id: conversationId },
            include: {
                members: {
                    include: { user: true }
                },
                messages: {
                    skip: pageOffset,
                    take: loadMessageCount,
                    include: { author: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        if (!conversation) {
            throw new Error("Not found")
        }
        const isMember = conversation.members.some(m => m.userId === user.id)
        if (!isMember) {
            throw new Error("Unauthorized")
        }

        return {
            conversation: {
                id: conversation.id,
                members: conversation.members.map(m => userDTO(m.user)),
                messages: conversation.messages.map(msg => messageDTO(msg))
            }
        }
    })

    // Send a message to conversation
    .post("/conversation/:id", async ({ user, params, body }) => {
        const conversationId = Number(params.id)
        const conversation = await database.conversation.findUnique({
            where: { id: conversationId },
            include: {
                members: true
            }
        })

        if (!conversation) {
            throw new Error("Not found")
        }
        const isMember = conversation.members.some(m => m.userId === user.id)
        if (!isMember) {
            throw new Error("Unauthorized")
        }
        if (body.replyId) {
            const replyMessage = await database.message.findUnique({
                where: { id: body.replyId, conversationId: conversationId }
            })
            if (!replyMessage || replyMessage.conversationId !== conversationId) {
                throw new Error("Reply message not found")
            }
        }

        const message = await database.message.create({
            data: {
                conversationId,
                authorId: user.id,
                replyToMessageId: body.replyId,
                content: (body as {message: string}).message.trim()
            }
        })

        // Unread conv stuff
        const otherMembers = await database.conversationMember.findMany({
            where: { conversationId: conversationId }
        })

        otherMembers.forEach(async (lMember) => {
            if (lMember.userId !== user.id) {
                await database.conversationMember.updateMany({
                    where: { userId: lMember.userId, conversationId: conversationId },
                    data: { hasUnread: true }
                })
            }
        })
        return message
    }, {
        body: messageBody
    })
