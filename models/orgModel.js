const { Schema, model } = require('mongoose');

const orgSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});

const Organisation = model('Organisation', orgSchema);

module.exports = Organisation;