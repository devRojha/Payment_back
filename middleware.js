const jwt = require("jsonwebtoken");
const JWT_Secret = require("./routes/config");

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }

    const token = authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(token, JWT_Secret); //didn't check id in db
        if(decoded.userId){
            req.userId = decoded.userId;
            next();
        }
        else{
            res.json({message:"wrong token"})
        }
    }
    catch(e){
        return res.status(403).json({message:"not allow"})
    }
}

module.exports = {authMiddleware}