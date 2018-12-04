// Password must have 1 uppercase letter, 1 lowercase letter, be atleast 8 characters, and have one special character.
const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
const checkPasswordStrength = value => strongRegex.test(value) ? true : false;

module.exports = checkPasswordStrength;