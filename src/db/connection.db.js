const mariadb = require('mariadb')

const pool = mariadb.createPool({
    host: process.env.DB_HOST           ||'localhost',
    port: process.env.DB_PORT           || 3306, 
    user: process.env.DB_USER           ||'root', 
    password: process.env.DB_PASSWORD   ||'claveSecreta',
    database: process.env.DB_DATABASE   ||'employees_dev',
    connectionLimit: 5,
});

module.exports=pool