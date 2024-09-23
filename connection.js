const  mysql=require("mysql")

const sql=mysql.createConnection(
    {   host:"localhost",
        user:"root",
        password:"5689",
        database:"database"
    });

    module.exports=sql;