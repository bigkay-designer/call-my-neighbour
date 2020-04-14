let mongoose = require('mongoose');
//Schema setUp
let neighborSchema = new mongoose.Schema({
  name: String,
  image: String,
  desc: String,
  service:String,
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment',
    }
  ]
});

//passing Schema to to mongoose.model
let neighbor = mongoose.model('neighbor', neighborSchema);

module.exports = neighbor;