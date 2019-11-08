const express = require("express");
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('express-flash');

app.listen(8000, () => console.log("listening on port 8000"));
app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(flash());

mongoose.connect('mongodb://localhost/MessageBoard', { useNewUrlParser: true });

const CommentSchema = new mongoose.Schema({
    username: { type: String, required: [true, "Name is required"] },
    commentContent: { type: String, required: [true, "Comment must have a title"], minlength: [1, "Comment must have at least 1 characters"] },
}, { timestamps: true })

const MessageSchema = new mongoose.Schema({
    username: { type: String, required: [true, "Name is required"] },
    messageContent: { type: String, required: [true, "Message must have a title"], minlength: [1, "Message must have at least 1 characters"] },
    comments: [CommentSchema]
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


app.post('/newdojocomment/:id', (req, res) => {
    var commentario = new Comment();
    commentario.username = req.body.username;
    commentario.commentContent = req.body.commentContent;
    console.log(commentario);
    Comment.create(req.body, function(err, data){
        if(err){
            console.log("-----------------ERROR CREATING THE COMMENT--------------");
        }
        else {
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: commentario}}, function (err, data) {
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

