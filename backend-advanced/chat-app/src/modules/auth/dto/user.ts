import { User } from "../../../generated/prisma";

export const userDTO = (user: User) => {
    return {
        id: user.id,
        email: user.email,
    }
}