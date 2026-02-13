import {Elysia} from "elysia";
import { PrismaClient } from "../../generated/prisma";

import { reactions } from "./reactions";
import { conversations } from "./conversations";
import { messages } from "./messages";
import { users } from "./users"

const database = new PrismaClient()


export const chat = new Elysia({ prefix: "/chat" })
    .use(reactions)
    .use(conversations)
    .use(messages)
    .use(users)