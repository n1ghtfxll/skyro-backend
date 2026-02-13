import { Elysia } from "elysia";
import { PrismaClient } from "../../../generated/prisma";

const database = new PrismaClient()

export const authentificateMiddleware = new Elysia()
    .derive({as: 'scoped'}, async ({headers}) => {
        const authHeader = headers.authorization;
        
        if (!authHeader) {
            throw new Error("Authorization header missing")
        }

        const token = authHeader.substring(7)

        const user = await database.user.findFirst({
            where: {
                token: token
            }
        })

        if (!user) {
            throw new Error("Unauthorized")
        }

        return {
            user
        } 
    })