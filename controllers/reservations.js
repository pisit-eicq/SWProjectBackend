const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');


//@desc     Get all reservations
//@route    Get /api/v1/reservations
//@access   Private
exports.getReservations = async (req,res,next)=>{
    let query;
    //general user can see only their Reservations
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path:'restaurant',
            select:'name address office_hours tel'
        });
    }else{//if you are admin you can see all
        if(req.params.restaurantId){
            console.log(req.params.restaurantId);
            query = Reservation.find({restaurant : req.params.restaurantId}).populate({
                path : 'restaurant',
                select :'name address office_hours tel'
            });
        }else{
           query = Reservation.find().populate({
            path:'restaurant',
            select:'name address office_hours tel'
            }); 
        }
    }
    try{
        const reservations = await query;
        res.status(200).json({
            success:true,
            count:reservations.length,
            data: reservations});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Reservation"});
    }
};

//@desc     Get single reservation
//@route    Get /api/v1/reservations/:id
//@access   Public
exports.getReservation = async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path:'restaurant',
            select:'name tel'
        });
        if(!reservation){
            return res.status(404).json({
                success:false,
                message:`No reservation with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:reservation});
    }catch(err){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Reservation"});
    }
}

//@desc     Add single Reservation
//@route    POST /api/v1/:restaurantId/reservations/
//@access   Private
exports.addReservation = async (req,res,next)=>{
    try{
        req.body.restaurant = req.params.restaurantId;
        console.log(req.body.restaurant);
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if(!restaurant){
            return res.status(404).json({success:false,message:`No Restaurant with id of ${req.params.restaurantId}`});
        }
        //add user Id to req body
        req.body.user = req.user.id;
        //check for existed Reservation
        const existedReservation = await Reservation.find({user:req.user.id});
        //if the user is not an admin the can only create 3 Reservation
        if(existedReservation.length>=3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reservations`});
        }
        const reservation = await Reservation.create(req.body);
        res.status(200).json({success:true,data:reservation});

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Reservation"});
    }
}

//@desc     Update single Reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation = async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with id of ${req.params.restaurantId}`});
        }
        //Make sure user is the Reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this Reservation`});
        }
        //
        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({success:true,data:reservation});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Reservation"});
    }
};

//@desc     Delete single Reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,message:`No Reservation with id of ${req.params.restaurantId}`});
        }
        //Make sure user is the Reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this Reservation`});
        }
        //
        await reservation.deleteOne();
        res.status(200).json({success:true,data:{}});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Reservation"});
    }
};