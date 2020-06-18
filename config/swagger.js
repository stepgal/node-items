const mongoose = require('mongoose');
const swaggerJSDoc = require("swagger-jsdoc");
const m2s = require('mongoose-to-swagger');
const definitions = require("../schemas/definitions");
const SWAGGER = require("./");

const swaggerSpec = swaggerJSDoc(SWAGGER.options);

Object.keys(definitions).forEach((key) => {
    swaggerSpec.definitions[key] = definitions[key];
});

module.exports = swaggerSpec;
