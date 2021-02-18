const express = require('express')
const app = express()//express의 function을 이용해 새로운 express app을 만듦
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-www-form-urlencoded 형태를 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 형태를 분석해서 가져올 수 있게 함
app.use(bodyParser.json());

//쿠키
app.use(cookieParser());

//몽고 DB 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => { //루트 디렉터리를 보면 hello world를 출력하게 함
  res.send('Hello World!!!!')
})

app.post('/api/users/register', (req, res) => {

  //회원 가입 시 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body) //body안에는 json형식으로 들어 있음 그 역할을 bodyparser가 해줌
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({ //200은 성공했다는 뜻이고 이 경우 json형태로 다음과 같은 내용을 return함
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    //이메일이 있다면 비밀번호 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

      //비밀번호가 같다면 토큰 생성

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장함 - 쿠키 or 로컬스토리지
        //각각의 장소에 따른 장단점 존재
        res.cookie("x_auth", user.token) //클라이언트 측은 쿠키에 토큰 저장
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

//미들웨어 : endpoint에 request를 받고 callback함수를 실행하기 전에 중간에서 행위함
app.get('/api/users/auth', auth, (req, res) => { //auth는 middleware
  //여기까지 미들웨어를 통과했다는 것은 authentication이 true라는 뜻
  res.status(200).json({
    _id: req.user._id, //auth에서 user를 request에 넣었기 때문에 가능
    isAdmin: req.user.role === 0 ? false : true, //0이면 일반
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image

  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})


const port = 5000 //포트 사용

app.listen(port, () => console.log(`Example app listening on port ${port}!`))