import { Elysia } from "elysia";
import { PrismaClient } from './generated/prisma'

const database = new PrismaClient() 
const app = new Elysia()

  // Add a classmate
  .post("/classmate", async ({body}: {body: any}) => {
    const classmate = await database.Classmate.create({
      data: body
    })
    return {
      status: 'success',
      message: 'Classmate added successfully',
      classmate: classmate
    }
  })

  // Update a classmate
  .put('/classmate/:id', async ({params, body}: {params: any, body: any}) => {
    try {
      const classmate = await database.Classmate.update({
        where: {
          id: Number(params.id)
        },
        data: body
      })
      return {
        status: 'success',
        message: 'Classmate with id ' + params.id + ' updated successfully',
        classmate: classmate
      }
    } catch (error: any) {
      return {
        status: 'error', 
        message: 'Classmate with id ' + params.id + ' not found',
      }
    }
  })

  // Delete a classmate
  .delete('/classmate/:id', async ({params}: {params: any}) => {
    try {
      await database.Classmate.delete({
        where: {
          id: Number(params.id)
        }
      })
      return {
        status: 'success',
        message: 'Classmate with id ' + params.id + ' deleted successfully',
      }
    } catch (error: any) {
      return {
        status: 'error', 
        message: 'Classmate with id ' + params.id + ' not found',
      }
    }
  })

  // List classmates
  .get("/classmates", async ({query}: {query: any}) => {
    const whereClause: any = {}

    if (query.name) {
      whereClause.name = {
        equals: query.name
      }
    }

    if (query.surname) {
      whereClause.surname = {
        equals: query.surname
      }
    }

    if (query.class) {
      whereClause.class = {
        equals: query.class
      }
    }

    if (query.lowerAge) {
      whereClause.age = {
        lte: Number(query.lowerAge)
      }
    }

    if (query.higherAge) {
      whereClause.age = {
        gte: Number(query.higherAge)
      }
    }

    return await database.Classmate.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    })
  })

  // Run elysia on port 3000
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
