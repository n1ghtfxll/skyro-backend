import { Elysia } from "elysia";
import { openapi } from '@elysiajs/openapi'

import { auth } from "./modules/auth";
import { chat } from "./modules/chat/";

const app = new Elysia()
  .use(openapi())

  .onError(({ code, error }) => {
    if (code === 'VALIDATION')
        return {
            status: "error",
            type: "validation",
            errors: error.all.map((error) => {
              return {
                property: error.path,
                message: error.message
              }
            })
        }
  })
  .use(auth)
  .use(chat)

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);