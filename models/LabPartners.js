var mongoose = require('mongoose');



var LabPartnerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,

    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }

    // array of related Review instances
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
});


mongoose.model('LabPartner', LabPartnerSchema);