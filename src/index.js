const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const multer = require("multer");
const cors = require("cors");
const nReadlines = require("n-readlines");

const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, "files");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + ".ttl");
  },
});

const upload = multer({
  storage: storage,
});

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
app.use(cors());

app.listen(4800, () => {
  console.log("process.platform", process.platform);
  console.log("HTTP server is up on port " + 4800);
});

app.get("/test", (req, res) => {
  return res.send("it works!");
});

app.post("/upload", upload.single("LBDFile"), (req, res) => {
  try {
    res.send(req.file);
  } catch (err) {
    res.send(400);
  }
});

app.get("/report", async (req, res) => {
  try {
    const { spawn } = require("child_process");
    //pyshacl -s C:\Users\emman\OneDrive\Documenten\'21-'22\Thesis\rulebooks\rulebook.ttl -m -i rdfs -a -j -f human C:\Users\emman\OneDrive\Documenten\'21-'22\Thesis\modeldump\bibliotheekEdegem.ttl
    {/*const report = spawn("pyshacl", [
      "--shacl",
      `${process.cwd()}\\files\\rulebook.ttl`,
      "-m",
      "-i",
      "rdfs",
      "-a",
      "-j",
      "-f",
      "human",
      `${process.cwd()}\\files\\LBDFile.ttl`,
      "--output",
      `${process.cwd()}\\files\\report`,
    ]);
  */}

    const broadbandLines = new nReadlines("files\\report");

    let line;
    var temp = {};
    var dict = {};
    var allResults = [];

    while ((line = broadbandLines.next())) {
      const splitted = String(line).split(":");

      if (splitted[0].slice(0, 20) === "Constraint Violation") {
        if (Object.keys(temp).length !== 0) {
          temp["id"] = "156978";
          allResults.push(temp);
        }
        var temp = {};
        var shape = ""
        if (splitted[0].slice(24,62) === "QualifiedValueShapeConstraintComponent") {
          var shape = "Stair"
        } else if (splitted[0].slice(24,51) === "MinCountConstraintComponent" ) {
          var shape = "MVD"
        }
      } else if (splitted[0].substring(1) === "Severity")
        temp["severity"] = splitted[2].slice(0, splitted[2].length - 1);
      else if (splitted[0].substring(1) === "Source Shape")
        if (shape !== "") {
          temp["sourceShape"] = shape
        } else {
         temp["sourceShape"] = splitted[2].slice(0, splitted[2].length - 1); 
        }
        
      else if (splitted[0].substring(1) === "Focus Node")
        temp["focusNode"] = splitted[2].slice(0, splitted[2].length - 1);
      else if (splitted[0].substring(1) === "Message")
        temp["message"] = splitted[1].slice(0, splitted[1].length - 1);
    }
    temp["id"] = "156978";
    allResults.push(temp);
    dict["results"] = allResults;

    res.status(200).send(dict);
  } catch (error) {
    res.status(400).send(error);
  }
});
