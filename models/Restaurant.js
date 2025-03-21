const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    office_hours: {
        open: {
            type: String,
            required: [true, 'Please add a start time'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please add a valid start time in HH:mm format']
        },
        close: {
            type: String,
            required: [true, 'Please add an end time'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please add a valid end time in HH:mm format']
        },
        tz: {
            type: String,
            required: [true, 'Please add a timezone'],
            match: [/^UTC[+-]\d{1,2}$/, 'Please add a valid timezone in UTC±HH format']
        }
    },
    tel: {
        type: String
    } 
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//reverse populate appointment
RestaurantSchema.virtual('Reservations',{
    ref : 'Reservation',
    localField : '_id',
    foreignField: 'restaurant',
    justOne : false
});
module.exports = mongoose.model('Restaurant', RestaurantSchema);
