const mongo = require("../database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports.registerAdmin = async (req,res,next) => {
    try{
        const {firstName, lastName, email, password} = req.body;

        if(!(email && password && firstName && lastName)){
            res.status(400).send("All input is required")
        }

        const oldUser = await mongo.selectedDb.collection("adminList").find({email:email}).toArray()
        
        if(oldUser.length>0){
            console.log(oldUser)
            return res.status(409).send("User already exist! Please login")
        }

        let encryptedPassword = await bcrypt.hash(password,10)

        let user = {first_name:firstName, last_name:lastName, email: email.toLowerCase(), password:encryptedPassword}

        let data = await mongo.selectedDb.collection("adminList").insertOne(user)

        let newUser = await mongo.selectedDb.collection("adminList").find({email:email}).toArray()
        newUser = newUser[0]
        const token = jwt.sign(
            {user_id:email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "1h",
            }
        )

        console.log(newUser)

        user = {
            _id:newUser._id,
            first_name:newUser.first_name,
            last_name:newUser.last_name,
            email:newUser.email,
            password:newUser.password,
            token:token
        }

        res.cookie("token",token,{maxAge:3600000})

        res.status(201).send(user)


    }catch(err){
        console.log(err)
    }
}


module.exports.loginAdmin = async (req,res,next) => {
    try{
        const {email,password} =req.body;
        if(!(email && password)){
            res.status(400).send("All inputs are required")
        }

        let user = await mongo.selectedDb.collection("adminList").find({email:email}).toArray()
        user = user[0]
        if(user && (await bcrypt.compare(password,user.password))){
            const token = jwt.sign(
                {user_id:email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "1h"
                }
            )

            user = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                token: token
            }

            res.cookie("token",token,{maxAge:3600000})

            return res.status(200).send(user)
        }
        return res.status(400).send("Invalid Credintials")
    }catch(err){
        console.log(err)
    }
}

module.exports.welcome = async (req,res,next) => {
    try{
        res.send("Welcome Admin")
    }catch(err){
        console.log(err)
    }
}

let seats=[]
for(let j=0;j<10;j++){
var dict = {}
for(let i=0;i<10;i++){
    dict[i]=false
}
seats.push(dict)
}

module.exports.createTheater = async (req,res,next) => {
    try{
        var data =await mongo.selectedDb.collection('theaterDetails').insertOne(req.body)
        res.send(data)
    }catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports.updateTheater = async (req,res,next) => {
    try{
        var data = await mongo.selectedDb.collection('theaterDetails').findOneAndUpdate({name:req.body.name},{$set:req.body})
        res.send(data)
    }catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports.getTheater = async (req,res,next) => {
    try{
        var data = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        res.send(data)
    }catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports.getTheaterByName = async (req,res,next) => {
    try{
        let list = await mongo.selectedDb.collection('theaterDetails').find({name:req.params.name}).toArray()
        res.send(list)
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getBookedMovies = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('bookedShows').find().toArray()
        res.send(data)
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getBookedMoviesD = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('bookedShows').find({name:req.params.theater,movie:parseInt(req.params.movie),date:req.params.date}).toArray()
        
        res.send(data)
    }
    catch(err){
        res.send(err)
    }
}

module.exports.getMovies = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        let movies = []
        let final = []
        for(let i=0;i<data.length;i++){
            var resu = data[i].movieRunning
            for(let j=0;j<4;j++){
                if(movies.includes(resu[j])==false && resu[j]!=""){
                    var obj={
                        name:resu[j],
                        showlist:[[data[i].name,j]]
                    }
                    final.push(obj)
                    movies.push(resu[j])
                }
                else if(movies.includes(resu[j])){
                    for(let x=0;x<final.length;x++){
                        if(final[x].name==resu[j]){
                            final[x].showlist.push([data[i].name,j])
                        }
                    }
                }   
            }
        }
        res.send(final)
    }
    catch(err){
        res.send(err)
    }
}

module.exports.getMoviesbyName = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        let final = []
        for(let i=0;i<data.length;i++){
            var resu = data[i].movieRunning
            for(let j=0;j<4;j++){
                if(resu[j]==req.params.name){
                    final.push([data[i].name,j])
                }  
            }
        }
        if(final.length>0){
            res.send(final)
        }
        else{
            res.send("Shows currently unavailable")
        }
    }
    catch(err){
        res.send(err)
    }
}

