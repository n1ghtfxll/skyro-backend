import { Elysia } from "elysia";
const fs = require('fs');

const app = new Elysia()
  .get("/", () => "/list-classmates for the list \n/create-classmate?name=test&surname=testovaci to create a classmate").listen(3000)
  .get('/list-classmates', () => {
    const data = fs.readFileSync('classmates.json', 'utf-8');
    return JSON.parse(data);
  })

  .get('/create-classmate', ({query}) => {
    const { name, surname } = query
    const data = JSON.parse(fs.readFileSync('classmates.json', "utf-8"));
    data.push({ name, surname })
    fs.writeFileSync('classmates.json', JSON.stringify(data, null, 2)
, 'utf-8');
    return 'Successfully created'
  })


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);