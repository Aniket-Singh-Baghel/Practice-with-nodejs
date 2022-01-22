var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
const { Passport } = require('passport');
const passport = require('passport');
var passportLocalMongoose  =require('passport-local-mongoose');

mongoose.connect('mongodb+srv://aniket_2000:sheryians@123@cluster0.8phqz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

var userSchema=mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  profilepic:{
    type:Array,
  },
  share:Array,
  s:String,
  books:[{type:mongoose.Schema.Types.ObjectId,ref:'book'}],
  friends:Array

})
userSchema.plugin(passportLocalMongoose);
// mongoose.plugin(passportLocalMongoose)

module.exports=mongoose.model('user',userSchema)