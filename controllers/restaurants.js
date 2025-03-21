const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//@desc     get all restaurants
//@route    get /api/v1/restaurants
//@access   public
exports.getRestaurants =async (req,res,next)=>{
    let query;
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const skip = (page - 1) * limit;
        const queryStr = JSON.stringify(req.query);
        const queryObj = JSON.parse(queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`));

        query = Restaurant.find(queryObj).skip(skip).limit(limit);

        const restaurants = await query;

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

//@desc     get single restaurant
//@route    get /api/v1/restaurants/:id
//@access   public
exports.getRestaurant =async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:restaurant});
    }catch(err){
        res.status(400).json({success:false});
    }
    
}

//@desc     post single restaurant
//@route    post /api/v1/restaurants/
//@access   private
exports.createRestaurant =async (req,res,next)=>{
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({
        success:true, data:restaurant
    });
};

//@desc     Update single restaurant
//@route    Put /api/v1/restaurants/:id
//@access   private
exports.updateRestaurant =async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators :true
        });
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:restaurant});
    }catch(err){
        res.status(400).json({success:false});
    }
}

//@desc     delete single restaurant
//@route    delete /api/v1/restaurants/:id
//@access   private
exports.deleteRestaurant =async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(400).json({success:false});
        }
        await Reservation.deleteMany({restaurant:req.params.id});
        await Restaurant.deleteOne({_id:req.params.id});

        res.status(200).json({success:true,data:{} });
    }catch(err){
        res.status(400).json({success:false});
    }
}