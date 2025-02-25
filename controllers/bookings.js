const Booking = require('../models/Booking');
const Campground = require('../models/Campground');
//@desc Get all appointments
//@routeGET /api/v1/appointments
//@access Public
exports.getBookings=async (req,res,next)=>{
    let query;
    //General users can see only their appointments!
if(req.user.role !== 'admin'){
       query=Booking.find({user:req.user.id}).populate({
       path:'campground',
       select:'name province tel'
    }
);
    
    }else{ //If you are an admin, you can see all!
        if (req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Booking.find({ campground: req.params.campgroundId }).populate({
            path: "campground",
            select: "name province tel",
            });
        }
        else
        query=Booking.find().populate({
            path:'campground' ,
            select:'name province tel'
        });
    }
   
    try {
    const bookings = await query;

    res.status (200).json({
    success:true,
    count: bookings.length,
    data: bookings
    });
} catch (error) {
    console.log(error);
    return res.status(500).json({success:false, message:
        "Cannot find Bookings"});
    }
};
exports.getBooking = async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id).populate({
        path: 'campground',
        select: 'name description tel'
      });
  
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `No booking with the id of ${req.params.id}`
        });
      }
  
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Cannot find Booking" });
    }
  };
  exports.addBooking = async (req, res, next) => {
    try {
      req.body.campground = req.params.campgroundId;
  
      const campground = await Campground.findById(req.params.campgroundId);
      if (!campground) {
        return res.status(404).json({
          success: false,
          message: `No campground with the id of ${req.params.campgroundId}`
        });
      }
      //add user Id to req.body
       req.body.user=req.user.id;
//Check for existed appointment
const existedBooking =await Booking.find({user:req.user.id});
//If the user is not an admin, they can only create 3 appointment.
if(existedBooking.length >= 3 && req.user.role !== 'admin'){
return res.status(400).json({success:false,message: `The user with ID ${req.user.id} has already made 3 bookings`});
}
      const booking = await Booking.create(req.body);
  
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Cannot create Booking"
      });
    }
  };
    
exports.updateBooking=async (req,res, next)=> {
    try{
        let booking = await Booking.findById(req.params.id) ;
        if(!booking){
            return res.status(404).json({success:false, message:` No Booking with the id of ${req.params.id}`});
                
    } 
    //Make sure user is the appointment owner
if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
     return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this `});
}
    booking=await Booking.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidator:true
});
   res.status(200).json({
    success:true,
    data:booking
   });
}
catch(error) {
    console.log(error);
    return res.status(500).json({success:false,message:"Cannot update Booking"});
}
};
// controllers/appointments.js

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
      const booking = await Booking.findById(req.params.id);
  
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `No booking found with id of ${req.params.id}`,
        });
      }
      //Make sure user is the appointment owner
      if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
        return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this booking`});
        }
      await booking.deleteOne();
  
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      console.error(error);
       return res.status(500).json({
        success: false,
        message: "Cannot delete booking"
      });
    }
  };
  