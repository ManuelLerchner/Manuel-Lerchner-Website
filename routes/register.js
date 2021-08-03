const express = require("express");
const router = express.Router();

//  Get /
router.get("/", function (req, res) {
    res.render("register");
});

module.exports = router;
