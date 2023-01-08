const { Schema, model } = require("mongoose");

const schema = Schema({
    guildID: { type: String, default: "" },
    userID: { type: String, default: "" },
    record: { type: Number, default: 0 },
    man: { type: Number, default: 0 },
    woman: { type: Number, default: 0 }
})

module.exports = model("regstaffmodel", schema)