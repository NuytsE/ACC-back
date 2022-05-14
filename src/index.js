const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const helmet = require('helmet')
const multer = require('multer')
const cors = require('cors')
const validate = require('./validator')
const { type } = require('@testing-library/user-event/dist/type')

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
    validate()

    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});