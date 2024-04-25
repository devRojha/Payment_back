
const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.use(express.json());

router.get('/balance',authMiddleware, async (req, res) =>{
    const userId = req.userId
    console.log(userId)
    try{
        const user = await User.findOne({_id:userId})
        console.log(user)
        const UserAccount = await Account.findOne({UserId:userId})
        res.status(200).json({
            Name: `${user.FirstName} ${user.LastName}`,
            Balance: UserAccount.Balance,
            message: "you can check your balance"
        })
    }
    catch(e){
        res.status(500).json({message:"enternal server down"})
    }
})

router.post('/transfer', authMiddleware, async (req, res) =>{
    try{
        const session = await mongoose.startSession();
        session.startTransaction();

        const amount = Number(req.body.amount); 
        const to = req.body.to;
        const userId = req.userId;
        const sender = await Account.findOne({UserId:userId}).session(session);
        if(sender.Balance < amount){
            await session.abortTransaction();
            return res.status(400).json({message: "Insufficient balance"})
        }
        else{
            const recever = await User.findOne({_id:to}).session(session);
            console.log(recever)
            if(!recever){
                await session.abortTransaction();
                return res.status(400).json({message: "Invalid account"})
            }
            else{
                await Account.updateOne(
                    {
                        UserId: userId
                    },
                    {
                        $inc:{
                            Balance: -amount
                        }
                    }
                    // {Balance: Balance - amount}
                ).session(session);

                await Account.updateOne(
                    {
                        UserId: to
                    },
                    {
                        $inc:{
                            Balance: amount
                        }
                    }
                    // {Balance: Balance + amount}
                ).session(session);
            }
        }
        await session.commitTransaction();
        return res.status(200).json({
            message: "Transfer successful"
        })
    }
    catch(e){
        res.status(500).json({message:"Payment fail"})
    }
})


module.exports = router