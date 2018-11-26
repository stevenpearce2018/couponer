const capitalizeCase = str => String(str).toLowerCase().replace(/(^| )(\w)/g, (x) => x.toUpperCase());

module.exports = capitalizeCase;