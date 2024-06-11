const mongoose = require("mongoose"); 

mongoose
    .connect("mongodb+srv://" + process.env.DB_USER_PASS + "@reseau-social.cv9b3tg.mongodb.net/mern-project", 
    {
        // useNewUrlParser: true, 
        // useUnifiedTopology: true, 
        // useCreateIndex: true, 
        // useFindAndModify: false,
    }
    )
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log("Failed to connect to MongoDB", err));