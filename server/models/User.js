const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10 //salt가 몇 글자인지 나타냄 salt를 생성하고 이를 이용해 암호화
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, //빈칸 삭제
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
})

userSchema.pre('save', function (next) {

  var user = this; // 위를 가리키게 됨
  //비밀번호를 바꿀 때만 암호화된 비밀번호가 만들어지도록
  if (user.isModified('password')) {//비밀번호 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err)

      //plain:user.passwod , 해쉬된 비밀번호 : hash
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err)
        user.password = hash
        next()
      })
    })
  } else { //비밀번호 변경이 아닐 시 그냥 빠져나감
    next()
  }
}) //저장하기 전에 function수행

userSchema.methods.comparePassword = function (plainPassword, cb) {

  //plain : 123456789 db : 암호화된 비밀번호
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch)
  })
}

userSchema.methods.generateToken = function (cb) {
  var user = this;

  //jsonwebtoken을 이용해서 토큰 생성
  //user._id + secretToken으로 토큰 생성 secretToken을 넣으면 user._id를 얻게됨
  var token = jwt.sign(user._id.toHexString(), 'secretToken')
  // user._id + 'secretToken' = token 
  // -> 
  // 'secretToken' -> user._id
  user.token = token
  user.save(function (err, user) { //서버측에 토큰 저장
    if (err) return cb(err)
    cb(null, user)
  })
}

userSchema.statics.findByToken = function(token, cb) {
  var user = this;

  //토큰을 복호화함
  jwt.verify(token, 'secretToken', function (err, decoded) {    //유저 아이디를 이용해서 유저를 찾음
    //클라이언트에서 가져온 토큰과 db에 저장된 토큰 일치 여부 확인
    user.findOne({ "_id": decoded, "token": token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user)
  })
})
}


const User = mongoose.model('User', userSchema)

module.exports = { User }//외부에서 사용할 수 있도록 함