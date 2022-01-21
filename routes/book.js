var express = require('express');
var router = express.Router();
var mongoose=require('mongoose')

const bookSchema=mongoose.Schema({
  dis:String,
  profilepic:{
    type:Array,
  },
  like:{
    type:Array,
    default:[]
  },
  time: {
    type:Date,
    default:Date.now
  },
  comment:Array,
  user:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
})


module.exports=mongoose.model('book',bookSchema)
