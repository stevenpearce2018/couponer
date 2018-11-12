const mongoose = require('mongoose')
const searchableMongoIDs = IDS => {
    const arrayLength = IDS.length;
    let i = 0;
    let searchAbleIDS = []
    for(;i < arrayLength;i++) {
      searchAbleIDS.push(mongoose.Types.ObjectId(IDS[i]))
    }
    return searchAbleIDS;
}

module.exports = searchableMongoIDs;