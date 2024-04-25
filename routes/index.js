const express = require("express");
const UserRouter = require("./user")
const AccountRouter = require("./account")
const cors = require("cors");

const router = express.Router();

router.use(cors())
router.use("/user", UserRouter);
router.use("/account", AccountRouter)

module.exports = router;