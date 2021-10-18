const connectDB = require('./startup/db');
const express = require('express');
const cors = require('cors');
const app = express();
const users = require('./routes/users');
const router = require('./routes/auth');
const { post } = require('./routes/users');
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', router)
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});