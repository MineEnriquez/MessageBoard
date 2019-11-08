const express = require("express");
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('express-flash');
const Schema = mongoose.Schema;

app.listen(8000, () => console.log("listening on port 8000"));
app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(flash());

mongoose.connect('mongodb://localhost/MessageBoard', { useNewUrlParser: true });

const MessageSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: { type: String, required: [true, "Name is required"] },
    messageContent: { type: String, required: [true, "Message must have a title"], minlength: [10, "Message must have at least 10 characters"] },
    // comments: [CommentSchema]
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true })


const CommentSchema = new Schema({
    message: { type: Schema.Types.ObjectId, ref: 'Message' },
    username: { type: String, required: [true, "Name is required"] },
    commentContent: { type: String, required: [true, "Comment must have a title"], minlength: [10, "Comment must have at least 10 characters"] },
}, { timestamps: true })



// create an object that contains methods for mongoose to interface with MongoDB
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);


app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.get('/', (req, res) => {
    Message.find()
        .then(messages => {
            console.log(messages);
            res.render('index', { messagesArray: messages });
        })
});

app.post('/newdojomessage', (req, res) => {
    const newdojomessage = new Message(req.body);
    newdojomessage.save()
        .then(() => {
            res.redirect('/');

        })
        .catch(err => {
            console.log("We have an error!***************", err);
            for (var key in err.errors) {
                console.log(err.errors[key].message);
                req.flash('Errors', err.errors[key].message);
            }
            res.redirect('/');
        });
});


app.post('/newdojocomment/:name', (req, res) => {

    Comment.create(req.body, function(err, data){
        if(err){
            console.log("-----------------ERROR CREATING THE COMMENT--------------");
        }
        else {
            Message.findOneAndUpdate({name: req.params.name}, {$push: {comments: {username: req.body.username, commentContent: req.body.commentContent}}}, function (err, data) {
                if (err) {
                    console.log("problems trying to push the data");
                }
                else {
                    console.log("DONE!!");
                    res.redirect('/');
                }
            })
         }
   })    

})

