const express = require("express");
const router = express.Router();

//  Get /controller
router.get("/", function (req, res) {
    res.render("controller");
});

module.exports = router;
