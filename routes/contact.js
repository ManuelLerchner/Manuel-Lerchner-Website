const express = require("express");
const router = express.Router();

//  Get /contact
router.get("/", function (req, res) {
    res.render("contact");
});

module.exports = router;
