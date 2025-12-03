const express = require("express");
const router = express.Router();
const policyController=require("../../controller/customerController/policyController")


router.get("/get-policy", policyController.getPolicy);

module.exports = router;