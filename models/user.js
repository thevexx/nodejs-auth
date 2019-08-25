const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs')

const schema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
})

schema.methods.comparePassword = function (candidatePassword, cb) {
    return bcrypt.compareSync(candidatePassword, this.password)
}

schema.pre('save', function () {
    this.password = bcrypt.hashSync(this.password);
});

module.exports = mongoose.model('users', schema);