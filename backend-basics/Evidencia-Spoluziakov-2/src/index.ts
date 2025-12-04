import { Elysia } from "elysia";
const fs = require('fs');

const app = new Elysia()
  .get("/", () => "Hello :)").listen(3000)


  // List Classmates
  .get('/classmates', () => {
    const data = fs.readFileSync('classmates.json', 'utf-8');
    return JSON.parse(data);
  })


  // Add Classmates
  .post('/classmates', ({body}: {body: any}) => {
    const data = JSON.parse(fs.readFileSync('classmates.json', "utf-8")) as any[];

    if (!body.id) {
      return {
        status: 'error',
        message: 'You forgot to specify an id'
      };
    }
    const id = Number(body.id)
    const exists = data.find(el => el.id === id)
    if (exists) {
      return {
        status: 'error',
        message: 'A user with this id already exists',
      }
    }
    data.push(body)
    fs.writeFileSync('classmates.json', JSON.stringify(data, null, 2), 'utf-8');
    return {
      status: 'success',
      message: 'Successfully created',
    }
  })


  // Delete Classmates
  .delete('/classmates/:id', ({params}: {params: any}) => {
    const data = JSON.parse(fs.readFileSync('classmates.json', "utf-8")) as any[]
    const id = Number(params.id)
    const exists = data.find(el => el.id === id)
    if (!exists) {
      return {
        status: 'error',
        message: 'Cant find user with that id'
      };
    }
    const updatedList = data.filter(el => el.id !== id)
    fs.writeFileSync('classmates.json', JSON.stringify(updatedList, null, 2))

    return {
      status: 'success',
      message: 'Successfully deleted',
    }
  })


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);