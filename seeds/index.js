const mongoose = require('mongoose');
const Campground=require('../models/campground');
const cities = require('./cities');
const {descriptors,places}=require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log('sorry !! error occured while connecting to DB ');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i <200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author:'64cb46cc3ed7dd60812ab2b7',//daddy101
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry:{
                type:'Point',
                coordinates:[cities[random1000].longitude , cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dfdjorecn/image/upload/v1691348545/YelpCamp/ptfkao36rd9k0ug7bjfd',
                    filename: 'YelpCamp/vstccryzbauvq7iqvpt8'
                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})