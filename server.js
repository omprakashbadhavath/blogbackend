const exp=require('express');
const app=exp()
require('dotenv').config()
const mongoClient=require('mongodb').MongoClient
//import API's routes
const userApp=require('./APIs/user-api')
const authorApp=require('./APIs/author-api')
const adminApp=require('./APIs/admin-api')
const path=require('path')


app.use(exp.static(path.join(__dirname,'../frontend/build')))
// to parse the body of the req
app.use(exp.json())
//connect to db
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get db obj
    const blogdb=client.db('blogdb')

    
    //get collection obj
    const usersCollection=blogdb.collection('usersCollection')
    const articlescollection=blogdb.collection('articlescollection')
    const authorscollection=blogdb.collection('authorscollection')
    //share collection obj with express app
    app.set('usersCollection',usersCollection)
    app.set('articlescollection',articlescollection)
    app.set('authorscollection',authorscollection)
    //cofirm db connection
    console.log("DB connection success")

})
.catch(err=>console.log("Err in DB connection",err))


//if path start with user-app,send req to userApp
app.use('/user-api',userApp)
// //if path start with admin-app,send req to adminApp
 app.use('/admin-api',adminApp)
// //if path start with author-app,send req to authorApp
 app.use('/author-api',authorApp)


 app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../frontend/build/index.html'))
 })

//express err handler
app.use((err,req,res,next)=>{
    res.send({message:"error", payload:err})
})

const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`server running on ${port}`))