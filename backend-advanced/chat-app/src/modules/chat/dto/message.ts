import { Message, User } from "../../../generated/prisma";
import { userDTO } from "../../auth/dto/user";

type MessageWithAuthor = Message & {
    author: User
}

export const messageDTO = (message: MessageWithAuthor) => {
    return {
        id: message.id,
        content: message.content,
        author: userDTO(message.author),
        replyToMessageId: message.replyToMessageId,
        reactions: message.reactions,
        createdAt: message.createdAt
    }
}