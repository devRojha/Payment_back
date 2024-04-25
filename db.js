
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://devraj:devraj227804@cluster0.7lfewmr.mongodb.net/Paytm")

const AccountSchema = mongoose.Schema({
    UserId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    Balance:{
        type: Number,
        required: true
    }
})

const UserSchema = mongoose.Schema({
    UserName:{
        type: String,
        required: true
    },
    FirstName:{
        type: String,
        required: true
    },
    LastName: String,
    Password:{
        type: String,
        required: true
    },
})

const User = mongoose.model("User", UserSchema)

const Account = mongoose.model("Account", AccountSchema)

module.exports = {  
    User,
    Account 
}