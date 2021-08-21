const express = require("express");
const router = express.Router();
const fs = require("fs");

function loadProjects() {
    const out = { projects: {} };

    var files = fs.readdirSync("./views/projects").sort();

    console.log(files)

    files.forEach((file) => {
        fs.readFile("./views/projects/" + file, "utf8", (err, data) => {
            var lines = data.split("\n");

            var title = lines[1].match(/"([^"]+)"/)[1];
            var descr = lines[2].match(/"([^"]+)"/)[1];
            var image = lines[3].match(/"([^"]+)"/)[1];
            var link = lines[4].match(/"([^"]+)"/)[1];

            projectData = {
                title: title,
                description: descr,
                image: image,
                link: link
            };

            out.projects[file.split(".")[0]] = projectData;
        });
    });

    return out;
}

const prj = loadProjects();

//  Get /
router.get("/", function (req, res) {
    res.render("home", prj);
});

module.exports = router;
