const express = require("express");

const router = express.Router();

router.get("/", function (req, res) {
    res.render("projects/" + "lambdaCalculus");
});

module.exports = router;
