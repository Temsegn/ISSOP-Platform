const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const swaggerServe = swaggerUi.serve;
const swaggerSetup = swaggerUi.setup(swaggerDocument);

module.exports = {
  swaggerServe,
  swaggerSetup,
};
