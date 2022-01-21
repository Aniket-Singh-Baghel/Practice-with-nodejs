var express = require('express');
const passport = require('passport');
// const users = require('./users');
var router = express.Router();
var userModel=require('./users')
var bookModel=require('./book')
const multer  = require('multer')
const mailer=require('./nodemailer')
const {v4:uuidv4}=require('uuid')
const message=require('messagebird')
// x=uuid.create()
// mailer("jiji")

const localStrategy = require('passport-local');
// const { Passport, session, authenticate } = require('passport');

// const { populate } = require('./users');
// const { default: messagebird } = require('messagebird');

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix+file.originalname)
  }
})
const upload = multer({ storage: storage })

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index');
})

router.post('/register',function(req,res ,next){
  var newUser = new userModel({
    username : req.body.username,
    email:req.body.email,
    name:req.body.name,
  })
  userModel.register(newUser , req.body.password )
  .then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  }).catch(function(e){
    res.send(e);
  })
})

router.get('/like/:p',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(j){
    bookModel.findOne({_id:req.params.p})
    .then(function(i){
      if(i.like.indexOf(j._id)==-1){
        i.like.push(j._id)
      }
      else{
        i.like.pop(j._id)
      }
      i.save()
      .then(function(cs){
        res.redirect('/profile')
      })
  })
  })
})

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res,next){
  
})

router.get('/profile',isLoggedIn,function(req,res){
    userModel.findOne({username:req.session.passport.user})
      .then(function(founduser){
        bookModel.find()
        .populate('user')
        .then(function(a){
          userModel.find()
          .then(function(c){
            res.render('profile',{a:a,b:founduser,c:c})
          })
      })
    })
})

router.get('/logout' , function(req, res){
  req.logout();
  res.redirect('/');
})

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

router.get('/delshare/:n',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    i.share.splice(req.params.n,1)
    i.save()
    res.redirect('/recived')
  })
})

router.post('/submit',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(us){
    bookModel.create({
      dis:req.body.dis,
      user:us
    })
    .then(function(u){
      u.populate('books')
      us.books.push(u._id)
      us.save()
    })
    .then(function(cu){
      res.redirect('/profile')
    })
    
  })
})
  
router.get('/delete/:p',isLoggedIn,function(req,res){
  bookModel.findOneAndDelete({_id:req.params.p})
  .then(function(a){ 
    res.redirect('/profile')
  })
})

router.get('/update/:p',isLoggedIn,function(req,res){
  bookModel.findOne({_id:req.params.p})
  .populate('user')
  .then(function(a){
    res.render("update",{a})
  })
})

router.post('/edit/:p',isLoggedIn,function(req,res){
  bookModel.findOneAndUpdate({_id:req.params.p},{name:req.body.name,price:req.body.price,dis:req.body.dis,imgurl:req.body.imgurl})
  .then(function(a){
    res.redirect('/profile')
  })
})

router.get("/user",isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate('books')
  .then(function(us){
    res.render('user',{a:us})
  })
})

router.post('/comment/:p',isLoggedIn,function(req,res){
  bookModel.findOne({_id:req.params.p})
  .then(function(a){
    a.comment.push([req.body.comment,req.session.passport.user])
    a.save()
    res.redirect('/profile')
  })
})

router.post('/upload',isLoggedIn,upload.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    i.profilepic.push(req.file.filename)
    i.save()
    res.redirect('/user')
  })
})

router.get('/deleteuser/:p',isLoggedIn,function(req,res){
  userModel.findOneAndDelete({_id:req.params.p})
  .then(function(a){
    res.redirect('/')
  })
})

router.get('/share/:x/:y',function(req,res){
  userModel.findOne({_id:req.params.x})
  .then(function(i){
    bookModel.findOne({_id:req.params.y})
    .populate('user')
    .then(function(j){
        console.log(j.user.name)
        i.share.push([j,j.user.name,j.user.profilepic])
        i.save()
        res.redirect('/profile')
    })
  })
})

router.get('/recived',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(b){
    userModel.find()
    .then(function(c){
        res.render('share',{b:b,c:c})
    })
  })
})

router.get('/user/:m',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    var b=i.profilepic.splice(req.params.m,1)
    i.profilepic.push(b)
    i.save()
    res.redirect('/user')
  })
})

router.get('/loginpage',function(req,res){
  res.render('loginpage')
})

router.post('/search',function(req,res){
  userModel.find({username:req.body.search} || {name:req.body.name})
  .then(function(e){
    userModel.findOne({usename:req.session.passport.user})
    .then(function(b){
      res.render('search',{data:e,b:b})
    })
  })
})

router.get('/forgotpass',function(req,res){
  res.render('forgot')
})
// console.log(uuid())
router.post('/password',function(req,res){
  userModel.findOne({email:req.body.email})
  .then(function(v){
    var x=uuidv4()
    v.s=x
    v.save()
    var new1=`http://localhost:3000/cretep/${v._id}/${x}`
    mailer(req.body.email,new1)
    res.send("done")
  })
})

router.get('/cretep/:id/:a',function(req,res){
  userModel.findOne({_id:req.params.id})
  .then(function(i){
    var j=req.params.id
    if(i.s==req.params.a){
      res.render('setpass',{j})
    }
    else{
      res.send("not done")
    }
  })
})

router.post('/setpass/:id',function(req,res){
  userModel.findOne({_id:req.params.id})
  .then(function(a){
    if(req.body.password1==req.body.password2){
      a.setPassword(req.body.password1,function(err){
        a.save(function(err){
          console.log(err)
          res.redirect('/login')
        })
      })
    }else{
      res.send("enter same password in both field")
    }
  })
})

router.get('/allfriend',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    userModel.find()
    .then(function(user){
      res.render('friends',{b:i,user:user})
    })
  })
})

router.get('/add/:id',function(req,res){
  userModel.findOne({usename:req.session.passport.user})
  .then(function(i){
    userModel.findOne({_id:req.params.id})
    .then(function(j){
      if(i.friends.indexOf(j.name)==-1){
        i.friends.push(j.name)
        i.save()
      }
      res.redirect('/allfriend')
    })
  })
})

router.get('/remove/:a',function(req,res){
  userModel.findOne({usename:req.session.passport.user})
  .then(function(m){
    m.friends.pop(req.params.a)
    m.save()
    res.redirect('/allfriend')
  })
})

module.exports = router; 