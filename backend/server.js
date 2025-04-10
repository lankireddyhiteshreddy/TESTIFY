const express = require('express');
const passport = require('passport');
require('dotenv').config();
require('./config/passport')(passport);
require('./config/db');

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth',require('./routes/auth'));
app.use('/api',require('./routes/protected'));

app.listen(process.env.PORT,()=>console.log('Server running !!'));

