const express = require("express");
const router = express.Router();

//  Get /about
router.get("/", function (req, res) {
    res.render("impressum");
});

module.exports = router;