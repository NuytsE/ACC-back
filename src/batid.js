exports.getbatid = async (fn) => {
  return new Promise(async (resolve) => {
    const fromFile = require("rdf-utils-fs/fromFile");
    const stream = fromFile("files\\LBDFile.ttl");
    var batidname = "";
    var batid = "";
    stream.on("data", (quad) => {
    // if the triple starts with 'focusnode props:batid', the object is the name of the batid
      if (
        quad.subject.value === `http://example.org/${fn}` &&
        quad.predicate.value === "https://w3id.org/props#batid"
      ) {
        batidname = quad.object.value;
    // due to level 2 structure, 'schema:value' of this batidname is the actual batid
      } else if (
        quad.subject.value === batidname &&
        quad.predicate.value === "http://schema.org/value"
      ) {
        batid = quad.object.value;
      }
    });
    stream.on('end', function () {
        if (batid === "") {
            batid = "undefined"
            resolve(batid)
        } else {
            resolve(batid);
        }
    })
  });
};
