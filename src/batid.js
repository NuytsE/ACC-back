exports.getbatidname = async (fn) => {
  return new Promise(async (resolve) => {
    const fromFile = require("rdf-utils-fs/fromFile");
    const stream1 = fromFile("files\\LBDFile.ttl");
    var batidname = "";
    stream1.on("data", (quad) => {
    // if the triple starts with 'focusnode props:batid', the object is the name of the batid
      if (
        quad.subject.value === `http://example.org/${fn}` &&
        quad.predicate.value === "https://w3id.org/props#batid"
      ) {
        batidname = quad.object.value;
      }})

    stream1.on('end', function () {
        if (batidname === "") {
            batidname = "undefined"
            resolve(batidname)
        } else {
            resolve(batidname);
        }
    })
  });
};

exports.getbatid = async (batidname) => {
  return new Promise(async (resolve) => {
    const fromFile = require("rdf-utils-fs/fromFile");
    const stream2 = fromFile("files\\LBDFile.ttl")
    var batid = "";

    // due to level 2 structure, 'schema:value' of this batidname is the actual batid
    stream2.on("data", (quad) => {
      if (
        quad.subject.value === batidname &&
        quad.predicate.value === "http://schema.org/value"
      ) {
        batid = quad.object.value;
      }
    })

    stream2.on('end', function () {
        if (batid === "") {
            batid = "undefined"
            resolve(batid)
        } else {
            resolve(batid);
        }
    })
  });
};