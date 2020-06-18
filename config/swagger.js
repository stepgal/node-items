const swaggerJSDoc = require("swagger-jsdoc");
const definitions = require("../schemas/definitions");
const SWAGGER = require("./");

const swaggerSpec = swaggerJSDoc(SWAGGER.options);

Object.keys(definitions).forEach((key) => {
    swaggerSpec.definitions[key] = definitions[key];
});

module.exports = swaggerSpec;
