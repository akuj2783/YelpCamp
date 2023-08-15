const Review=require('../models/review');
const Campground=require('../models/campground');


module.exports.createReview=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    const review=new Review(req.body.review);
    review.author=req.user._id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','new review added');
    res.redirect(`/campgrounds/${campground._id}`);

}

/*  The `$pull` operator is used to remove reference of a document from a collection. In this case, 
    the document that is being removed is the review with the ID `reviewId`.
 The `reviews` field is the field in the campground document that contains the list of reviews,
 once the reference is gone then we delete the review itself using findbyIdAndDelete */ 
module.exports.deleteReview=async(req,res)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{ $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','review deleted');
    res.redirect(`/campgrounds/${id}`);
}