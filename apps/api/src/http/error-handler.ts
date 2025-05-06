import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { BadRequestError } from './routes/_errors/bad_request_error'
import { UnauthorizedError } from './routes/_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (err, req, reply) => {
  if (err instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    })
  }

  if (err instanceof BadRequestError) {
    return reply.status(400).send({
      message: err.message,
    })
  }

  if (err instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: err.message,
    })
  }

  console.error(err)

  return reply.status(500).send({ message: 'Internal server error.' })
}
