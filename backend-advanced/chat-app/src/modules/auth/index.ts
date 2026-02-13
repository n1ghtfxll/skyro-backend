import {Elysia,t} from "elysia";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { registerBody, loginBody } from "./model";
import { userDTO } from "./dto/user";
import { authentificateMiddleware } from "./middlewares/authentificate";

const database = new PrismaClient()


export const auth = new Elysia({ prefix: "/auth" })
    .post("/register", async ({ body }) => {
        const existingUser = await database.user.findFirst({
            where: {
                email: body.email
            }
        })

        if (existingUser) {
            return {
                status: "error",
                message: "User already exists"
            }
        }

        const hashedPassword = await bcrypt.hash(body.password, 12);

        const user = await database.user.create({
            data: {
                email: body.email,
                password: hashedPassword,
                token: crypto.randomBytes(22).toString('base64url')
            }
        })

        return {
            user: userDTO(user),
            token: user.token
        }
    },{
        body: registerBody
    })


    .post("/login", async ({body}) => {
        // Get user
        let user = await database.user.findFirst({
            where: {
                email: body.email
            }
        })

        // Check if user exists
        if (!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        // Validate password
        const isPasswordCorrect = await bcrypt.compare(body.password, user.password)
        if (!isPasswordCorrect) {
            return {
                status: "error",
                message: "Invalid password"
            }
        }


        // Create new token
        user = await database.user.update({
            where: {
                id: user.id
            },
            data: {
                token: crypto.randomBytes(22).toString('base64url')
            }
        })


        // Return user and token
        return {
            user: userDTO(user),
            token: user.token // <-- send updated token
        }
        }, {
        body: loginBody
    })



    .use(authentificateMiddleware)
    .post('/logout', async ({user}) => {
        await database.user.update({
            where: {
                id: user.id
            },
            data: {
                token: null
            }
        })

        return {
            status: "success",
            message: "Logout successful"
        }
    })