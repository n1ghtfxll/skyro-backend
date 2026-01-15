import { Elysia } from "elysia";
import { PrismaClient } from './generated/prisma'
import { utils } from './utils'

const database = new PrismaClient() 
const app = new Elysia()

  // Add a classmate
  .post("/classmates", async ({ body }: { body: any }) => {
    const classmate = await database.classmate.create({
      data: {
        name: body.name,
        surname: body.surname,
        age: body.age,
        class: body.class
      }
    });

    let primaryRole = null;

    if (body.primaryRole) {
      primaryRole = await database.primaryRole.create({
        data: {
          role: body.primaryRole.role,
          classmateId: classmate.id
        }
      });
    }

    let secondaryRoles = [];

    if (Array.isArray(body.secondaryRoles)) {
      secondaryRoles = await Promise.all(
        body.secondaryRoles.map((role: any) =>
          database.secondaryRole.create({
            data: {
              role: role.role,
              classmateId: classmate.id
            }
          })
        )
      );
    }

    return {
      status: "success",
      message: "Classmate and roles created successfully",
      classmate,
      primaryRole,
      secondaryRoles
    };
  })


  // Update a classmate
  .put('/classmates/:id', async ({ params, body }: { params: any; body: any }) => {
    const id = Number(params.id);
    const exists = await utils.doesClassmateExist(id);
    if (!exists) {
      return {
        status: 'error',
        message: 'Cant find user with that id'
      };
    }

    const classmate = await database.classmate.update({
      where: { id },
      data: {
        name: body.name,
        surname: body.surname,
        age: body.age,
        class: body.class
      }
    });

    let primaryRole = null;

    if (body.primaryRole) {
      const existingPrimary = await database.primaryRole.findUnique({
        where: { classmateId: id }
      });

      if (existingPrimary) {
        primaryRole = await database.primaryRole.update({
          where: { classmateId: id },
          data: { role: body.primaryRole.role }
        });
      } else {
        primaryRole = await database.primaryRole.create({
          data: {
            role: body.primaryRole.role,
            classmateId: id
          }
        });
      }
    }

    let secondaryRoles = [];

    if (Array.isArray(body.secondaryRoles)) {
      await database.secondaryRole.deleteMany({
        where: { classmateId: id }
      });

      secondaryRoles = await Promise.all(
        body.secondaryRoles.map((role: any) =>
          database.secondaryRole.create({
            data: {
              role: role.role,
              classmateId: id
            }
          })
        )
      );
    }

    return {
      status: 'success',
      message: `Classmate with id ${id} updated successfully`,
      classmate,
      primaryRole,
      secondaryRoles
    };
  })


  // Delete a classmate 
  .delete('/classmates/:id', async ({ params }: { params: any }) => {
    const id = Number(params.id);

    const exists = await utils.doesClassmateExist(id);
    if (!exists) {
      return {
        status: 'error',
        message: 'Cant find user with that id'
      };
    }

    await database.secondaryRole.deleteMany({
      where: {
        classmateId: id
      }
    });

    await database.primaryRole.deleteMany({
      where: {
        classmateId: id
      }
    });

    await database.classmate.delete({
      where: {
        id
      }
    });

    return {
      status: 'success',
      message: `Classmate with id ${id} deleted successfully`
    };
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

    if (query.primaryRole) {
      whereClause.primaryRole = {
        equals: query.primaryRole
      }
    }

    if (query.secondaryRoles) {
      whereClause.secondaryRoles = {
        equals: query.secondaryRoles
      }
    }

    return await database.classmate.findMany({
      where: whereClause,
      include: {
        primaryRole: true,
        secondaryRoles: true
      },
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