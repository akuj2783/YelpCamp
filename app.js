if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express=require('express');
const mongoose = require('mongoose');
const path=require('path');
const methodOverride=require('method-override');
const session=require('express-session');
const flash=require('connect-flash');
const ejsMate=require('ejs-mate');
const joi=require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo")(session);



const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/expressError');

const {campgroundSchema,reviewSchema}=require('./schemas.js');
const Campground=require('./models/campground');
const Review=require('./models/review');

const User = require('./models/user');

const app=express();

const dbUrl= process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
 
mongoose.connect(dbUrl)
.then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log('sorry !! error occured while connecting to DB ');
})
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(mongoSanitize());



const store = new MongoDBStore({
    url: dbUrl,
    secret:"thisistopsecret",
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig={
    store,
    name:'session',
    secret:'thisshouldbeabetersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly: true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up middleware to handle flash messages,
//once we install flash, res get a method called locals 
//`.locals` is a property of the `res` object. 
//It is used to store data that is specific to the current  
//request. In this case, it is used to store the flash message.
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campground')
const reviewRoutes=require('./routes/reviews')


app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

PORT=process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`)
})