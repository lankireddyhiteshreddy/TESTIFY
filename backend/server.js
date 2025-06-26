const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');


require('dotenv').config();
require('./config/passport/passport')(passport);
require('./config/db');
const initModels = require('./models/initModels');

initModels();
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser()); //used to read cookies
app.use(passport.initialize());
app.use(cors({
    origin:'http://localhost:3001',
    credentials:true
}));

app.use('/api/auth',require('./routes/auth'));
app.use('/api',require('./routes/protected'));
app.use('/api/test',require('./routes/uploadRoutes'));  
app.use('/api/tests',require('./routes/tests'));
app.use('/api/questions',require('./routes/questions'));
app.use('/api/responses',require('./routes/responses'));

app.listen(process.env.PORT,()=>console.log('Server running !!'));

