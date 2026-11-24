import {Sequelize} from 'sequelize'

const {
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST='localhost',
    DB_PORT= 5432
} = process.env


export const sequelize = new Sequelize(DB_NAME,DB_USER,DB_PASSWORD,{
    host:DB_HOST,
    port:Number(DB_PORT),
    dialect:'postgres',
    logging:false
})