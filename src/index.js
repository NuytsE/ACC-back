const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const multer = require("multer");
const cors = require("cors");
const nReadlines = require("n-readlines");
const { getbatid, getbatidname } = require("./batid.js");
const { convertfocusnode, isproperty } = require("./focusnode.js");
const fs = require("fs");

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
    let report = spawn("pyshacl", ["--shacl",`${process.cwd()}\\files\\rulebook.ttl`,"-m","-i","rdfs","-a","-j","-f","human",`${process.cwd()}\\files\\LBDFile.ttl`,"--output",`${process.cwd()}\\files\\report`,])

    var comp = false;

    while (comp === false) {
      const broadbandLines = new nReadlines("files\\report");
      if (broadbandLines.next().length >= 0) {
        comp = true;
      }
    }

    const broadbandLines = new nReadlines("files\\report");

    let line;
    var temp = {};
    var dict = {};
    var allResults = [];
    var conforming = false;

    while ((line = broadbandLines.next())) {
      const splitted = String(line).split(":");
      if (splitted[0].slice(0, 20) === "Constraint Violation") {
        if (Object.keys(temp).length !== 0) {
          const content = `\n\nA ${temp.severity} was found in the ${temp.sourceShape} shape \nThe building element with name "${temp.focusNode}" and id ${temp.batid} does not comply.\n${temp.message}`;
          fs.appendFile("files\\validation report.txt", content, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
          allResults.push(temp);
        }
        temp = {};
        var shape = "";
        if (
          splitted[0].slice(24, 62) === "QualifiedValueShapeConstraintComponent"
        ) {
          shape = "Stair";
        } else if (
          splitted[0].slice(24, 51) === "MinCountConstraintComponent"
        ) {
          shape = "MVD";
        }
      } else if (splitted[0].substring(1) === "Severity")
        temp["severity"] = splitted[2].slice(0, splitted[2].length - 1);
      else if (splitted[0].substring(1) === "Source Shape")
        if (shape !== "") {
          temp["sourceShape"] = shape;
        } else {
          temp["sourceShape"] = splitted[2].slice(0, splitted[2].length - 1);
        }
      else if (splitted[0].substring(1) === "Focus Node") {
        //pySHACL sometimes returns a property as a 'focusnode', while the actual building element is desired in this application
        //the returned 'focusnode' is converted to the name of the building element (declared as 'fn') to be able to retrieve the batid
        const property = await isproperty(
          splitted[2].slice(0, splitted[2].length - 1)
        );
        const fn = await convertfocusnode(
          splitted[2].slice(0, splitted[2].length - 1),
          property
        );
        const batidname = await getbatidname(fn);
        const batid = await getbatid(batidname);

        temp["focusNode"] = fn;
        temp["batid"] = batid;
      } else if (splitted[0].substring(1) === "Message")
        temp["message"] = splitted[1].slice(0, splitted[1].length - 1);
      else if (splitted[0] === "Conforms") {
        if (splitted[1].slice(1, 5) === "True") {
          conforming = true;
        }
      }
    }

    if (conforming === false) {
      allResults.push(temp);
      dict["results"] = allResults;
    } else {
      dict["results"] = "conforms";
    }

    res.status(200).send(dict);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/download", async function (req, res) {
  const file = "files\\validation report.txt";
  res.download(file);
});
