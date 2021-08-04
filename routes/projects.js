const express = require("express");
const fs = require("fs");

const router = express.Router();

//  Get /
router.get("/", function (req, res) {
    res.render("error/pageNotFound", { layout: "error" });
});

//  Get /
router.get("/*", function (req, res) {
    let path = "./views/projects" + req.path + ".hbs";

    if (fs.existsSync(path)) {
        res.render("projects" + req.path);
    } else {
        res.render("error/pageNotFound", { layout: "error" });
    }
});

module.exports = router;
