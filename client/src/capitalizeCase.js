const capitalizeCase = (str) => {
    const lower = String(str).toLowerCase();
    return lower.replace(/(^| )(\w)/g, (x) => {
        return x.toUpperCase();
    });
}

module.exports = capitalizeCase;