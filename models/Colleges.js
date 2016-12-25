var mongoose = require('mongoose');



var CollegeSchema = new mongoose.Schema({
	name: String,
	// set of related LabPartner instances
});



mongoose.model('College', CollegeSchema);