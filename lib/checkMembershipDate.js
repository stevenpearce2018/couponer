const moment = require("moment")
let today = new Date();
let dd = today.getDate();
let mm = today.getMonth()+1; //January is 0!
const yyyy = today.getFullYear();
if(dd<10) dd = '0'+dd
if(mm<10) mm = '0'+mm
today = yyyy + '-' + mm + '-' + dd;

const checkMembershipDate = membershipDate => moment(membershipDate).isAfter(today)

module.exports = checkMembershipDate;