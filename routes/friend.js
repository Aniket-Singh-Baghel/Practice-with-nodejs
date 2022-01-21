var express = require('express');
var router = express.Router();
var mongoose=require('mongoose')

const friendSchema=mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
})

module.exports=mongoose.model('friend',friendSchema)
