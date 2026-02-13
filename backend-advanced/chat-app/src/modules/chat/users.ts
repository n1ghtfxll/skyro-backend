import { Elysia } from "elysia";
import { PrismaClient } from "../../generated/prisma";

import { userDTO } from "../auth/dto/user";
import { authentificateMiddleware } from "../auth/middlewares/authentificate";

const database = new PrismaClient()


export const users = new Elysia()
    .use(authentificateMiddleware)

    .get('/profiles', async ({user}) => {
        const allUsers = await database.user.findMany()
        
        return {
            user: allUsers.map(u => userDTO(u))
        }
    })
    .get('/profile', async ({user}) => {
        return {
            user: userDTO(user)
        }
    })