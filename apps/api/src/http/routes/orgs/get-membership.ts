import { auth } from "@/http/middlewares/auth";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const schema = {
  
}

export async function getMembership(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().register(auth).get('/organization/:slug/membership', {}, async (req, reply) => {

  })
}