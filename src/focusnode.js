exports.convertfocusnode = async (focusnode) => {
  return new Promise(async (resolve) => {
    const fromFile = require("rdf-utils-fs/fromFile");
    const stream1 = fromFile("files\\LBDFile.ttl");
    const stream2 = fromFile("files\\LBDFile.ttl")
    var fn = "";
    var property = false
    stream1.on("data", (quad) => {
    // if the triple starts with 'focusnode schema:value', the subject is a property of a building element
      if (quad.subject.value === `http://example.org/${focusnode}` && quad.predicate.value === "http://schema.org/value") {
          property = true
    // if the triple starts with 'focusnode rdf:type', the subject is a building element 
      } else if (quad.subject.value === `http://example.org/${focusnode}` && quad.predicate.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" ) {
        fn = focusnode
      }
    });

    // if the property is in the object position, the subject is the desired building element (declared as 'fn')
    stream2.on("data", (quad) => {
        if (quad.object.value === `http://example.org/${focusnode}` && property === true) {
            fn = quad.subject.value.slice(19)
        }
    })

    stream2.on("end", function () {
      if (fn === "") {
        fn = "undefined";
        resolve(fn);
      } else {
        resolve(fn);
      }
    });
  });
};
