var mongoose = require('mongoose');



var LabPartnerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,

    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }

    // set of related Review instances
});


mongoose.model('LabPartner', LabPartnerSchema);