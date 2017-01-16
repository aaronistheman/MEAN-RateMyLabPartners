var mongoose = require('mongoose');



var LabPartnerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,

    // set of related Review instances
});


mongoose.model('LabPartner', LabPartnerSchema);