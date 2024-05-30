const express=require('express')
const router=express.Router()

router.get('/test-admin',(req,res)=>{
    res.send({message:"admin api working"})
})




module.exports=router