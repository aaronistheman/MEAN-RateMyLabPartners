var mongoose = require('mongoose');



var LabPartnerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,

    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

    // array of related Review instances
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
});


LabPartnerSchema.virtual('numReviews').get(function() {
    // get number of reviews
    return this.reviews.length;
});


LabPartnerSchema.set('toJSON', { virtuals: true});
mongoose.model('LabPartner', LabPartnerSchema);