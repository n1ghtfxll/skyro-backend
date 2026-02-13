import { Elysia } from "elysia"
import { PrismaClient } from "../../generated/prisma"

import { conversationDTO } from "./dto/conversation"
import { authentificateMiddleware } from "../auth/middlewares/authentificate";
import { secondMemberBody, conversationNameBody } from "./model";

const database = new PrismaClient()

export const conversations = new Elysia()
    .use(authentificateMiddleware)

    // Gets conversations in which the logged in user is
    .get("/conversations", async ({ user }) => {
        const conversations = await database.conversation.findMany({
            where: {
                members: {
                    some: { userId: user.id }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        })

        // sort conversations before returning
        const conversationsLastMessage = await Promise.all(
            conversations.map(async (conversation) => {
            const lastMessage = await database.message.findFirst({
                where: {
                    conversationId: conversation.id
                },
                orderBy: {id: "desc"}
            })
            return {conversation, lastMessageTime: lastMessage?.createdAt || new Date(0)}
        })
    )
        const sorted = conversationsLastMessage.sort((a, b) => {
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        })
        return {
            conversations: sorted.map(({conversation: c}) => {
                const isUnread = c.members.find(m => m.userId === user.id)?.hasUnread ?? false
                return conversationDTO(c, isUnread)
            })
        }
    })

    // Create a conversation
    .post("/conversations", async ({ user, body}) => {
        const secondMemberId = body.secondMember
        const otherUser = await database.user.findUnique({ where: { id: secondMemberId } })
        if (!otherUser) {
            throw new Error("User not found")
        }
        const existing = await database.conversation.findFirst({
            where: {
                members: {
                    some: { userId: user.id }
                },
                AND: {
                    members: {
                        some: { userId: secondMemberId }
                    }
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        })
        if (existing && existing.members.length === 2) {
            return {
                conversation: conversationDTO(existing),
                alreadyExists: true
            }
        }
        const conversationName = "New conversation"
        const created = await database.conversation.create({
            data: {
                name: conversationName,
                members: {
                    create: [
                        { userId: user.id, hasUnread: false },
                        { userId: secondMemberId, hasUnread: false }
                    ]
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        })

        return {
            conversation: conversationDTO(created)
        }
    }, {
        body: secondMemberBody
    })

    // Rename a conversation
    .put("/conversation/:id/", async ({ user, params, body}) => {
        const conversationId = Number(params.id)
        const newConversationName = body.name
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
        const updatedConversationName = await database.conversation.update({
            where: { id: conversationId },
            data: { name: newConversationName }
        })

        return {
            conversation: {
                id: updatedConversationName.id,
                name: updatedConversationName.name
            }
        }
    }, {
        body: conversationNameBody
    })
