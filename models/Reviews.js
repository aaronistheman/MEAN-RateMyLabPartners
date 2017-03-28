var mongoose = require('mongoose');



var ReviewSchema = new mongoose.Schema({
    // label of the class in which the reviewer had this partner
    // in (e.g. CHE 2B)
    class: String,

    rating: { type: Number, max: 5, min: 1 },

    // the body of the review, where the reviewer can give explanations or
    // say whatever
    body: String,

    // The lab partner for whom this is a review for.
    labPartner: { type: mongoose.Schema.Types.ObjectId,
        ref: 'LabPartner' }
});


mongoose.model('Review', ReviewSchema);