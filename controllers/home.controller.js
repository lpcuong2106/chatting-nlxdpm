const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const home = require('../models/home.model')
const JWTHelper = require('../helpers/auth.helper')
const user = require('../models/user.model')
const upload = require('../helpers/storeImage.helper')
const bcrypt = require('bcrypt');
const token_key = process.env.ACCESS_TOKEN_SECRET;

module.exports.register = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                return res.sendStatus(500)
            }

            try {
                // console.log(req.body)
                const { email, password, lastName, firstName, sex } = req.body
                // const email = req.user.data.email
                if (!email || !password || !lastName || !firstName || !sex)
                    return res.sendStatus(404)

                let image;

                if (!req.file) {
                    image = (sex == 0) ? 'male-avatar.png' : 'female-avatar.png'
                } else {
                    image = req.file.filename
                }

                const data = {
                    email: email,
                    password: password,
                    DOB: null,
                    firstName: firstName,
                    lastName: lastName,
                    sex: sex,
                    image: image,
                    template: 0
                }

                const result = await home.register(data)

                const userToken = {
                    email: email,
                    firstName: firstName,
                    lastName: lastName
                }
                //set token
                const token = await JWTHelper.createToken(userToken, process.env.ACCESS_TOKEN_SECRET, '48h')
                delete result.password
                return res.status(200).json({
                    message: 'Đăng ký thành công',
                    data: result,
                    token: token
                })
            } catch (err) {
                console.error(err)
                return res.sendStatus(500)
            }
        })
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
}

module.exports.verifyEmail = async (req, res) => {
    try {
        const { email } = req.body
        if (!email)
            return res.sendStatus(404)
        const checkEmail = await user.findByEmail(email)
        if (checkEmail) {
            return res.status(200).json({
                message: 'Email đã được đăng ký!'
            })
        }
        const token = await JWTHelper.createToken({ email }, process.env.ACCESS_TOKEN_SECRET, '10m')
        const oAuth2Option = {
            clientId: process.env.EMAIL_CLIENT_ID,
            clientSecret: process.env.EMAIL_CLIENT_SECRET,
            redirectUri: process.env.EMAIL_REDIRECT_URI
        }

        const oAuth2Client = new google.auth.OAuth2(oAuth2Option)
        oAuth2Client.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN })
        const accessToken = await oAuth2Client.getAccessToken()

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'titustran0601@gmail.com',
                clientId: process.env.EMAIL_CLIENT_ID,
                clientSecret: process.env.EMAIL_CLIENT_SECRET,
                refreshToken: process.env.EMAIL_REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        let info = await transporter.sendMail({
            from: `'${email}'`,
            to: email,
            subject: 'Confirm your account on Merry-chat',
            html: ` <form style="padding: 0 20px; width: 600px; height: 300px; margin: 0 auto; border: 1px solid lightgrey; border-radius: 10px;">
                        <h1 style="margin-bottom: 15px; width: 100%; color: #5865F2; text-align: center;">MERRY CHAT</h1>
                        <h3 style="color: grey; font-size: 17px;"> Xác nhận email đăng nhập cùng Merry!</h3>
                        <p style="font-size: 17px; width: 100%; color: grey">Xin chào!</p>
                        <p style="font-size: 17px; width: 100%; color: grey; text-align: justify;">Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Để bắt đầu, chúng tôi cần bạn xác nhận email này chính là bạn. Hãy nhấp vào nút bên dưới để tiếp tục:</p>
                        <p style="margin-top: 10px;">
                            <a id="click-to-verify"  style="
                                    display: block;
                                    width: 150px; 
                                    height: 35px; 
                                    background-color: #5865F2; 
                                    color: white; 
                                    font-size: 17px; 
                                    text-align: center; 
                                    line-height: 35px; 
                                    border-radius: 4px;
                                    text-decoration: none;" 
                                href="http://localhost:3000/register/${token}">
                                Xác nhận email!
                            </a>
                        </p>
                    </form>
                    `
        })
        // console.log("Message sent: %s", info.accepted)
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
        return res.status(200).json({
            message: 'Vui lòng kiểm tra gmail!'
        })
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
}

module.exports.login = async(req, res) => {
    try {

        const {email, password} = req.body;

        if (!email || !password) {
            return res.sendStatus(404)
        }
        const resultLogin = await home.login(email);
        if(!resultLogin){
            return res.sendStatus(404)
        }
        
        if (resultLogin.length !== 1 || !(await bcrypt.compare(password, resultLogin[0].password))) {
            return res.sendStatus(404);
        }

        const InfoUserLogin = {
            email: email,
            firstName: resultLogin[0].firstName,
            lastName: resultLogin[0].lastName,
        }

        const token = await JWTHelper.createToken(InfoUserLogin, token_key, "48h");
        if(!token) {
            return res.sendStatus(404)
        }else{
            //luu thong tin vua dang nhap vao arr
            const userId = resultLogin[0].id;
            return res.status(200).json({
                userId: userId,
                token: token,
                userAvatar: resultLogin[0].image
            })
        }

    }catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
}

module.exports.checkToken = (req, res) => {
    res.status(200).json({
        message: 'Token hợp lệ'
    })
}