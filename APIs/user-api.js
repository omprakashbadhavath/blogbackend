const express=require('express')
const router=express.Router()
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
require("dotenv").config()
const verifyToken=require('../MiddleWares/verifyToken')



let usersCollection;
let articlescollection
//get usercollection app
router.use((req,res,next)=>{
    usersCollection=req.app.get('usersCollection')
    articlescollection=req.app.get('articlescollection')
   next()
})
//get user registration route
router.post('/user',expressAsyncHandler(async(req,res)=>{
    //get user resource from the client
    const newUser=req.body;
    //check for duplicate users
    const dbuser=await usersCollection.findOne({username:newUser.username})
    //if userfound in db
    if(dbuser!==null){
     res.send({message:"user exists"})
    }else{
     //hash the password 
     const hashedPassword=await bcryptjs.hash(newUser.password,6)
     //replace plaine pass with hashed pass
     newUser.password=hashedPassword;
     //create user
      await usersCollection.insertOne(newUser)
      //send res
      res.send({message:"User created"})
    }
 
 
 })
 );


//user login
router.post('/login',expressAsyncHandler(async(req,res)=>{
    //get cred obj from client
    const userCred=req.body
    //check for username
const dbuser=await usersCollection.findOne({username:userCred.username})
if(dbuser===null)
{
    res.send({message:"invalid username"})
}else{
    //check for password
   const  status= await bcryptjs.compare(userCred.password,dbuser.password)
   if(status===false){
    res.send({message:"invalid password"})
   }else{
//creat jwt and encode it
const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:'1d'})
 //send res
 res.send({message:"login success",token:signedToken,user:dbuser})
   }
}
   
    
   
}));

//get  articles of all users
router.get("/articles",verifyToken,expressAsyncHandler(async(req,res)=>{
    //get articlecollection from express app
 const articlescollection=req.app.get('articlescollection');
    //get all articles
    let articlesList= await articlescollection.find({status:true}).toArray()
    //send response
    res.send({message:'articles',payload: articlesList})

}));

//post comments for an arcicle by atricle id
router.post(
    "/comment/:articleId",verifyToken,
    expressAsyncHandler(async (req, res) => {
      //get user comment obj
      const userComment = req.body;
      const articleIdFromUrl=(+req.params.articleId);
      //insert userComment object to comments array of article by id
      let result = await articlescollection.updateOne(
        { articleId: articleIdFromUrl},
        { $addToSet: { comments: userComment } }
      );
      console.log(result);
      res.send({ message: "Comment posted" });
    })
  );




module.exports=router