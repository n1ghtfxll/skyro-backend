import { Conversation, User, ConversationMember } from "../../../generated/prisma";
import { userDTO } from "../../auth/dto/user";

type ConversationWithMembers = Conversation & {
    members: (ConversationMember & {
        user: User
    })[]
}

export const conversationDTO = (conversation: ConversationWithMembers, isUnread: boolean = false) => {
    return {
        id: conversation.id,
        name: conversation.name,
        unread: isUnread,
        members: conversation.members.map(member => userDTO(member.user))
    }
}