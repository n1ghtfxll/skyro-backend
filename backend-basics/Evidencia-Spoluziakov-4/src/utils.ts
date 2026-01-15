import { PrismaClient } from './generated/prisma'

const database = new PrismaClient()

async function doesClassmateExist(id: number) {
    const exists = await database.classmate.findUnique({
        where: {
            id: Number(id)
        }
    })
    return !!exists
}

export const utils = {
    doesClassmateExist
}