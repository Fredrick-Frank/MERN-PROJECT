const express = require('express');
const colors = require('colors')
const cors = require('cors')
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const schema = require('../schema_data/schema.');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

const app = express();

//Connect to our MongoDB Database:
connectDB();

//adding the cors middleware function
app.use(cors());

//graphql endpoint validating point...
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development',
    }),
);

app.listen(port, console.log(`Server running on port ${port}`));
