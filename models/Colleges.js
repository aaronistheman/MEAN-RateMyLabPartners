var mongoose = require('mongoose');



var CollegeSchema = new mongoose.Schema({
	name: String,


    // array of related LabPartner instances
    labPartners: [{ type: mongoose.Schema.Types.ObjectId,
        ref: 'LabPartner' }]
});



mongoose.model('College', CollegeSchema);