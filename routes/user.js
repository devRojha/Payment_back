
const express = require("express");
const zod = require("zod");
const {User,Account }= require("../db");
const JWT_Secret = require("./config");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const router = express.Router();

router.use(express.json());

const SignupSchema = zod.object({
    UserName: zod.string().email(),
    FirstName: zod.string(),
    LastName: zod.string(),
    Password: zod.string(),
})
const SigninSchema = zod.object({
    UserName: zod.string(),
    Password: zod.string(),
})

router.post('/signup',async function(req,res){
    const body = req.body;
    const {success} = SignupSchema.safeParse(body)
    if(!success){
        return res.json({
            message: "Incorrect input"
        })
    }
    try{
        const userfind = await User.findOne({
            UserName: body.UserName
        })
        if(userfind){
            res.json({
                message: "user allready exist",
                id: `with id ${userfind._id}`
            })
        }
        else{
            const dbUser = await User.create({
                UserName: body.UserName,
                FirstName: body.FirstName,
                LastName: body.LastName,
                Password: body.Password,
            })
        
            const token = jwt.sign({
                userId: dbUser._id
            }, JWT_Secret)
    
            //initialization balance
            const UserId = dbUser._id;
            await Account.create({
                UserId,
                Balance: (1 + Math.random() * 10000).toFixed(2)
            })
    
            res.json({
                message: "User created successfully",
                token: token
            })
        }
    }
    catch(e){
        res.status(403).json({message:"wrong input"})
    }
})

router.post('/signin',async function(req,res){
    const UserName = req.body.UserName
    const Password = req.body.Password
    try{
        const dbUser = await User.findOne({UserName:UserName})
        // console.log(dbUser);
        if((dbUser.UserName == UserName) && (dbUser.Password == Password)){
            const token = jwt.sign({
                userId: dbUser._id 
            }, JWT_Secret)
            res.json({
                message: "User Login successfully",
                token: token
            })
        }
        else{
            res.json({
                message: "Error while logging in"
            })
        }
    }
    catch(e){
        res.status(403).json({message:"wrond input"})
    }
})

router.put('/update',authMiddleware ,async function(req,res){
    const updatedata = req.body;
    console.log(updatedata)
    const {success} = SignupSchema.safeParse(req.body)
    if(success){
        try{
            await User.updateOne(
                {
                    _id:req.userId
                },
                updatedata
            )
            res.status(200).json({message: "Updated successfully"})
        }
        catch(e){
            console.log(e);
            res.status(411).json({message: "Error while updating information"});
        }
    }
    else{
        res.status(500).json({message: "Error while updating information"});
    }
})

router.get("/bulk", async (req , res)=>{
     const filter = (req.query.filter || "");
     const users = await User.find({
         $or: [{
             FirstName: {
                 "$regex": filter
             }
         },{
             LastName: {
                 "$regex": filter
             }
         },{
            UserName:{
                "$regex":filter
            }
         }]
     })
     res.json({
        user: users.map(user => ({
            UserName: user.UserName,
            FirstName: user.FirstName,
            LastName: user.LastName,
            _id: user._id
        }))
     })
})

module.exports = router;
