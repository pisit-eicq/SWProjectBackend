const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
//
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
//
dotenv.config({ path: './config/config.env' });
//
connectDB();
const app = express();
//add cookie parser
app.use(cookieParser());
//add body parser
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());
//
//rate limit
const limiter = rateLimit({
    windowsMs:10*60*1000, // 10mins
    max : 100
});
app.use(limiter);

const restaurants = require('./routes/restaurant');
const reservation = require('./routes/reservation');
const auth = require('./routes/auth');
const { version } = require('mongoose');

app.use('/api/v1/restaurants', restaurants);
app.use('/api/v1/:restaurantId/reservations', reservation); // Correct mounting
app.use('/api/v1/reservations', reservation);
app.use('/api/v1/auth', auth);


const PORT = process.env.PORT || 5000;
const server =  app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on ${process.env.HOST}:${PORT}`));

process.on('unhandledRejection',(err,promise) =>{
    console.log(`Error: ${err.message}`);

    server.close(()=>process.exit(1));
});

//
const swaggerOption={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
            title:'Library API',
            version: '1.0.0',
            description: 'Frontend Project API'
        },
        servers:[
            {
                url : process.env.HOST+':'+PORT+'/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOption);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));