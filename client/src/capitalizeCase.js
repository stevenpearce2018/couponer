const capitalizeCase = str => str.toLowerCase().replace(/(^| )(\w)/g, (x) => x.toUpperCase());

module.exports = capitalizeCase;