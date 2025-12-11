import { PrismaClient } from './generated/prisma'

const database = new PrismaClient()

async function doesClassmateExist(id: number) {
    const exists = await database.classmate.findUnique({
        where: {
            id: Number(id)
        }
    })
    if (!exists) {
        return false
    }
    return true
}

export const utils = {
    doesClassmateExist
}
