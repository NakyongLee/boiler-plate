const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증 처리 담당

    //클라이언트 측 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    //토큰을 복호화하여 유저 찾기
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        //없으면 no
        if (!user) return res.json({ isAuth: false, error: true })
        //유저가 있으면 인증 완료
        req.token = token;
        req.user = user;
        next();
    })
}


module.exports = { auth };