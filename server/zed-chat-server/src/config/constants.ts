import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export const jwtConstants = {
    refreshSecret: process.env.REFRESH_COOKIE_SIGNED_SECRET
}

export const options: TypeOrmModuleOptions = {
    type: "mysql",
    host: "hcm4e9frmbwfez47.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    port: 3306,
    username: "kug2zfxokj8n4t2j",
    password: "ebogm84ggoq34204",
    database: "elokhe5atpjpk6zz",
    synchronize: true,
    entities:  ['src/entities/*.ts']
  }
  
export const optionsDev: TypeOrmModuleOptions = {
    type: "mysql",
    host: "mysql",
    port: 3306,
    username: "root",
    password: "root",
    database: "zed-chat",
    synchronize: true,
    entities:  ['src/entities/*.ts']
}