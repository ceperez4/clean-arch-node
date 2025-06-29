import 'dotenv/config'
import { get } from 'env-var'

export const envs = {
    port: get('PORT').required().asPortNumber(),
    authTokenSecretKey: get('AUTH_TOKEN_SECRET_KEY').required().asString(),
    pathUserFiles: get('PATH_USER_FILES').required().asString(),
}