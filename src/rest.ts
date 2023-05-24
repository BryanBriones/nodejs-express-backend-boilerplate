import express = require('express');
import bodyParser = require('body-parser');
import sqlite3 = require('sqlite3');
import cors = require('cors');



var app = express();
app.use(cors({
    origin: 'http://localhost:8080'
  }));
  
var jsonParser = bodyParser.json();

console.log('INITIALIZING DB..')
// //CREATE SQLLITE SERVER 
var db=new sqlite3.Database('./db/CGI.db', sqlite3.OPEN_READWRITE, (err)=>{
    if (err && err.name == "SQLITE_CANTOPEN") {
        console.log('CGI DB NOT FOUND, CREATING CGI DB..')
        createDB();
        return;
        } else if (err) {
            console.log("Getting error " + err);
    }
    console.log('CGI FOUND, FETCHING TABLES DATA FROM CGI DB')
    getTables(db);
});




app.post('/login', jsonParser, async (req,res)=>{
    var loginData = await login(db,req.body);
    if(loginData){

        res.send({status:"OK", data:loginData});
    }
    else{

        res.send({status:"FAILED", data:{message:"Login not found. Email or Password might be incorrect."}});
    }
   

})

app.get('/careerobjectives',jsonParser, async (req,res)=>{
    var careerObjData = await getCareerObjectives(db);
    if(careerObjData){

        res.send({status:"OK", data:careerObjData});
    }
    else{

        res.send({status:"FAILED", data:{message:"No Career Objectives found"}});
    }

})

app.post('/addcareerobjectives',jsonParser, async (req,res)=>{
    var careerObjData = await addCareerObjectives(db,req.body);
    if(careerObjData){

        res.send({status:"OK", data:careerObjData});
    }
    else{

        res.send({status:"FAILED", data:{message:"No Career Objectives added"}});
    }

})

app.delete('/deletecareerobjectives/:id',jsonParser, async (req,res)=>{
    var careerObjData = await deleteCareerObjective(db,req.params.id);
    if(careerObjData){

        res.send({status:"OK", data:careerObjData});
    }
    else{

        res.send({status:"FAILED", data:{message:"No Career Objectives deleted"}});
    }

})

app.put('/updatecareerobjectives/:id',jsonParser, async (req,res)=>{
    var careerObjData = await updateCareerObjective(db,req.body,req.params.id);
    if(careerObjData){

        res.send({status:"OK", data:careerObjData});
    }
    else{

        res.send({status:"FAILED", data:{message:"No Career Objectives deleted"}});
    }

})




//SQLITE FUNCTIONS
function createDB() {
    var newdb = new sqlite3.Database('./db/CGI.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
        }
        createTables(newdb);
    });
}

function createTables(newdb) {
    newdb.exec(`
    create table users (
        id INTEGER  primary key AUTOINCREMENT,
        username text not null,
        password text not null
    );
    insert into users (id, username, password)
        values (1,'aaronbryan.briones@gmail.com', 'P@ssw0rd');

        create table careerobjectives (
            id INTEGER  primary key AUTOINCREMENT,
            name text null,
            targetdate text null,
            datecompleted text null
        );
    
        insert into careerobjectives (id, name, targetdate, datecompleted)
        values 
        (1,'Deliver great product/service for the development team in CGI for Self development and client satisfaction', 'Jan 2024', '-'),
        (2,'If opportunity arise,wanted to lead a project in development and get certifications for personal growth', 'Jan 2024', '-');
        `, ()  => {
            getTables(newdb);
    });
}

async function  getTables(db) {
    
   await  db.all(`
    select id, username, password from users`, (err, rows) => {
        console.log("USERS TABLE")
        console.log("-------------------------------")
        console.log(`Id \t Username \t\t\ Password`)
        rows.forEach(row => {
            console.log(row.id + "\t" +
            row.username + "\t" +
            row.password);
        });
    });

    await  db.all(`
    select id, name, targetdate,datecompleted  from careerobjectives`, (err, rows) => {
        console.log("CAREER OBJECTIVES TABLE")
        console.log("-------------------------------")
        console.log(`Id \t Name \t\t\ Targetdate  \t\t\ Date Completed`)
        rows.forEach(row => {
            console.log(row.id + "\t" +
            row.name + "\t" +
            row.targetdate + "\t" +
            row.datecompleted);
        });
    });
}

//SQLLITE CRUD COMMANDS

async function login(db,params){
    return new Promise((resolve, reject) => {

        var query = `SELECT * FROM users WHERE username = '`  + params.username + `' AND password = '` + params.password + `'`;
        db.all(query, (err, rows) => {
   
           if(rows){
               rows.forEach(row => {
                   console.log("LOGIN FOUND FOR: "+
                   row.username + "\t" +
                   row.password);
               });
   
               resolve(rows[0]);
           }
           else{
            reject(err);
           }
   
        });
    });
}

async function getCareerObjectives(db){
    return new Promise((resolve, reject) => {

        var query = `SELECT * FROM careerobjectives`;
        db.all(query, (err, rows) => {
   
           if(rows){
               rows.forEach(row => {
                   console.log("FETCH ALL CAREER OBJECTIVES: "+
                   row.id + "\t" +
                   row.name+ "\t" +
                   row.targetdate + "\t" +
                   row.datecompleted );
               });
   
               resolve(rows);
           }
           else{
            reject(err);
           }
   
        });
    });
}


async function addCareerObjectives(db,params){
    return new Promise((resolve, reject) => {

        var query = `INSERT INTO careerobjectives(name,targetdate,datecompleted) VALUES (?,?,?)`;
        db.run(query,[params.name,params.targetdate,params.datecompleted], function(err) {
   
           if(!err){
              
                   console.log("ADDED CAREER OBJECTIVE");
             
   
               resolve(true);
           }
           else{
            reject(err);
           }
   
        })
    });
}

async function deleteCareerObjective(db,id){
    return new Promise((resolve, reject) => {

        var query = `DELETE FROM careerobjectives WHERE id= ${id}`;
        db.run(query, function(err) {
   
           if(!err){
              
                   console.log("DELETED CAREER OBJECTIVE");
             
   
               resolve(true);
           }
           else{
            reject(err);
           }
   
        })
    });
}


async function updateCareerObjective(db,params,id){
    return new Promise((resolve, reject) => {

        var query = `UPDATE careerobjectives SET name=?, targetdate=?, datecompleted=? WHERE id= ${id}`;
        db.run(query,[params.name,params.targetdate,params.datecompleted], function(err) {
   
           if(!err){
              
                   console.log("UPDATED CAREER OBJECTIVE");
             
   
               resolve(true);
           }
           else{
            reject(err);
           }
   
        })
    });
}



app.listen(3000, () =>
 console.log('CGI App Backend listening in port 3000')
)
