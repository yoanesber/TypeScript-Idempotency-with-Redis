// Register ts-node to allow Sequelize CLI to read TypeScript files
require('ts-node/register');

// Import the Sequelize configuration
// and export it for Sequelize CLI to use
const config = require('./src/config/sequelizer.config.ts');
module.exports = config.default || config;