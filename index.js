const sql = require("./connection")
const express = require("express")
const path = require("path")
const app= new express()

// toparse string based client request body into JavaScript Object
const bodyparser = require("body-parser")
const { count } = require("console")
const urlencodedparser = bodyparser.urlencoded({ extended: false });


//to set the view engine
app.set("view engine", "hbs");

//to use static files
app.use(express.static('public'))

app.get("", (req, res) => {
    res.sendFile(__dirname+"/public/index.html");
});

app.get("/register.html", (req, res) => {
    res.sendFile(__dirname+"/public/register.html");
});

app.get("/login.html", (req, res) => {
    res.sendFile(__dirname+"/public/login.html");
});

app.get("/welcome", (req, res) => {
    res.sendFile(__dirname+"/public/welcome.html");
});

app.get("/done", (req, res) => {
    a=[];
    sql.query("SELECT * from feedback", (err, result) => {
        if (result) {
            for(i=0;i<result.length;i++){
                a[i]=result[i].message;
            }
        }})
    
    res.render("done",{feeds:a}) 

});



//REGISTER
app.post("/index", urlencodedparser, (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const phono = req.body.phoneno;
    const password = req.body.password;
    const conpassword = req.body.conpassword;
    const counter = 0;
    if (password == conpassword) {
        sql.query("INSERT INTO registration (USN,name,phono,password,voted) VALUES (?,?,?,?,?)", [id, name, phono, password, counter],
            (err, result) => {
                if (result) {//if registration success ,allows  user to login
                    res.sendFile(__dirname+"/public/index.html");
                } else {
                    res.sendFile(__dirname+"/public/register.html");
                }
            })
    }
})


//LOGIN
var userid, e;
var a=[];
app.post("/welcome", urlencodedparser, (req, res) => {
    userid= req.body.id; 
    var win_name,win_votes;
    if(req.body.time==3){//if countdown expires---displays result
            sql.query("SELECT name, votes FROM candidates WHERE votes = (SELECT Max(votes) FROM candidates)",(err,result)=>{
            if(result){
                console.log("fff")
                console.log(result)
                win_name=result[0].name;
                win_votes=result[0].votes;
            }
     })


        sql.query("SELECT * from candidates", (err, result) => {
            if (result) {
                res.render("result",{can1:result[0].name,vot1:result[0].votes,
                    can2:result[1].name,vot2:result[1].votes,
                    can3:result[2].name,vot3:result[2].votes,
                    can4:result[3].name,vot4:result[3].votes,
                    can5:result[4].name,vot5:result[4].votes,name:win_name,votes:win_votes}) 
            }})
    }
  
    
    const id = req.body.id;
    const password = req.body.password;
    sql.query("SELECT * FROM registration WHERE USN=?  AND password=?", [id, password], (err, result) => {
        if (result.length > 0) {
            console.log("bbb")
            e = result[0].voted;
            if (e == 1) {//login---if vote is completed---feedback  page
                sql.query("SELECT * from feedback", (err, result) => {
                    if (result) {
                        for(i=0;i<result.length;i++){
                            a[i]=result[i].message;
                        }
                    }})
                
                res.render("done",{feeds:a}) 
            }
          
            if(e==0) {//login---allows user to  vote
                res.sendFile(__dirname+"/public/welcome.html");
            }
        }
    })
})



//FEEDBACK
app.post("/done", urlencodedparser, (req, res) => {
    console.log(userid)
    const id = userid;
    console.log("jjj"+req.body.del);
    console.log(id)
    if(req.body.del==1){//to delete the current user's feedback
        console.log("enter...")
        sql.query("DELETE  FROM feedback WHERE feedid=? ",[id], (err, result) => {
            if (result) {
                console.log('dlted')

            }})
            var a=[];
            sql.query("SELECT * from feedback", (err, result) => {
                if (result) {//displays all  feedback
                    console.log("ssuuu")
                    for(i=0;i<result.length;i++){
                        a[i]=result[i].message;
                    }
                }})
                res.render("done",{feeds:a})     
    }
    var d;
    sql.query("SELECT * FROM registration WHERE USN=? ", [id], (err, result) => {
        if (result.length > 0) {
            d = result[0].voted;

            if (d == 1) {//voted
              
                if( req.body.feed!=undefined){//if users provide---insert's into db
                    const feed = req.body.feed+"---"+userid;
                    sql.query("INSERT INTO feedback (feedid,message) VALUES (?,?)", [id, feed],
                        (err, result) => {
                            if (result) {
                                console.log("insert")
                            }  
                        })
                       
                }
                var a=[];//display feedback
                sql.query("SELECT * from feedback", (err, result) => {
                    if (result) {
                        for(i=0;i<result.length;i++){
                            a[i]=result[i].message;
                        }
                    }})
                 res.render("done",{feeds:a}) 
            }

            else {//to update vote count
                const idno = req.body.voo;
                sql.query("UPDATE candidates SET votes=votes+1 WHERE idno=?", [idno], (err, result) => {
                    if (result) {
                        console.log("succces1")
                    }
                })

                sql.query("UPDATE registration SET voted=1 WHERE USN=?", [id], (err, result) => {
                    if (result) {//to update such that user cannot  vote more than once  
                        console.log("success2");
                    }
                })
                var a=[];
                sql.query("SELECT * from feedback", (err, result) => {
                    if (result) {//displays feedback
                        for(i=0;i<result.length;i++){
                            a[i]=result[i].message;
                        }
                    }})
                res.render("done",{feeds:a})    
            }  }

    })
})


app.listen(3000, () => {
    console.log("listening")
});
