import { Elysia } from "elysia";
const fs = require('fs');

const app = new Elysia()
  .get("/", () => "Hello :)").listen(3000)


  // List Classmates
  .get('/classmates', () => {
    const classmateList = fs.readFileSync('classmates.json', 'utf-8');
    return JSON.parse(classmateList);
  })


  // Add Classmates
  .post('/classmates', ({body}: {body: any}) => {
    const classmateList = JSON.parse(fs.readFileSync('classmates.json', "utf-8")) as any[];
    let highestId = Math.max(...classmateList.map(el => Number(el.id) || 0));
    const newClassmateId = highestId + 1

    const newClassmate = {
      id: newClassmateId,
      name: body.name,
      surname: body.surname,
      age: body.age
    }
    classmateList.push(newClassmate)
    fs.writeFileSync('classmates.json', JSON.stringify(classmateList, null, 2), 'utf-8');
    return {
      status: 'success',
      message: 'Successfully created',
    }
  })


  // Delete Classmates
  .delete('/classmates/:id', ({params}: {params: any}) => {
    const classmateList = JSON.parse(fs.readFileSync('classmates.json', "utf-8")) as any[]
    const classmateId = Number(params.id)
    const classmateExists = classmateList.find(el => el.id === classmateId)
    if (!classmateExists) {
      return {
        status: 'error',
        message: 'Cant find user with that id'
      };
    }
    const updatedList = classmateList.filter(el => el.id !== classmateId)
    fs.writeFileSync('classmates.json', JSON.stringify(updatedList, null, 2))

    return {
      status: 'success',
      message: 'Successfully deleted',
    }
  })


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
