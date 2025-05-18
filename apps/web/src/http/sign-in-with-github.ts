import { api } from './api-client'

interface SignInWithGithubRequest {
  code: string
}
interface SignInWithGithubResponse {
  token: string
}

export async function signInWithGithub({ code }: SignInWithGithubRequest) {
  const result = await api
    .post('session/github', {
      json: {
        code,
      },
    })
    .json<SignInWithGithubResponse>()

  return result
}
