const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Number, default: Date.now() },
    token: { type: String, unique: true, required: true },
})

module.exports = mongoose.model('access', schema);