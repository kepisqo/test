const User = require('../models/user');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto')

sgMail.setApiKey('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')

exports.getLogin = (req, res, next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('account/login', {
        path: '/login',
        title: 'Login',
        errorMessage: errorMessage
        //isAuthenticated: req.session.isAuthenticated,
    });
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({where:{ email: email}})
        .then((user) => {
            if(!user){
                req.session.errorMessage = 'Bu mail adresi ile kayıt bulunamamıştır!'
                req.session.save(function(err){
                    console.log(err)
                    return res.redirect('/login');
                })
                
            }
            console.log(password);
            console.log(user.password);
            bcrypt.compare(password, user.password)
                .then(isSuccess => {
                    if (isSuccess) {
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        if(user.isAdmin == 1){req.session.isAdmin= true}else{req.session.isAdmin = false}
                        return req.session.save(function (err) {
                            var url = req.session.redirectTo || '/';
                            delete req.session.redirectTo;
                            return res.redirect(url);
                        });
                    }
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        });

    // if ((email == 'ziya@gmail.com') && (password == '1234')) {
    //     // res.cookie('isAuthenticated', true);
    //     // res.cookie('isAdmin', true);
    //     req.session.isAuthenticated = true;
    //     req.session.isAdmin = true;
    //     res.redirect('/');
    // } else {
    //     // res.cookie('isAuthenticated', false);
    //     // res.cookie('isAdmin', false);
    //     // req.session.isAuthenticated = false;
    //     // req.session.isAdmin = false;
    //     res.redirect('/login');
    // }
    // res.redirect('/');
}

exports.getRegister = (req, res, next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('account/register', {
        path: '/register',
        title: 'Register',
        errorMessage: errorMessage
    });
}

exports.postRegister = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({where:{ email: email}})
                .then((user) => {
                    if(user){
                        req.session.errorMessage = 'Bu mail adresi daha önce kullanılmıştır.'
                        req.session.save(function(err){
                            console.log(err)
                            console.log('Bu mail adresi kullanılmış');
                        })
                        return res.redirect('/register');
                    }
                    return bcrypt.hash(password, 10);
                    
                })
                .then((hashedPassword) => {
                    if(hashedPassword){
                        console.log('Email2****************')
                        console.log(hashedPassword);
                        User.create({
            
                            name: name,
                            email: email,
                            password: hashedPassword,
                            isAdmin: true,
                    
                            })
                            .then(user => {
                                _user = user;
                                return user.getCart();
                            }).then(cart => {
                                if (!cart) {
                                    return _user.createCart();
                                }
                                return cart;
                            })
                            .then(() => {

                                res.redirect('/login');

                                const msg = {
                                    to: email, // Change to your recipient
                                    from: 'ulkuyasar@ysfbilisim.com.tr', // Change to your verified sender
                                    subject: 'Hesabınız oluşturuldu.',
                                    html: '<strong>Hesabınız başarılı bir şekilde oluşturldu.</strong>',
                                  }
                                  sgMail
                                    .send(msg)
                                    .then(() => {
                                      console.log('Email sent')
                                    })
                                    .catch((error) => {
                                      console.error(error)
                                    })
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
}

exports.getReset = (req, res, next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render('account/reset', {
        path: '/reset-password',
        title: 'Reset Password',
        errorMessage: errorMessage
    });
}

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err){
            console.log(err)
            return res.redirect('/reset-password')
        }
        const token = buffer.toString('hex')

        User.findOne({where:{ email: email}})
            .then(user => {
                if (!user){
                    req.session.errorMessage = 'Mail adresi bulunamdı'
                    req.session.save(function(err){
                        console.log(err)
                        return res.redirect('/reset-password')
                    })
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;

                return user.save()
            })
            .then(result => {
                res.redirect('/')
                
                console.log("http://localhost:3000/reset-password/" + token)
                const msg = {
                    to: email, // Change to your recipient
                    from: 'ulkuyasar@ysfbilisim.com.tr', // Change to your verified sender
                    subject: 'Parola Reset',
                    html: `
                    
                        <p>Parollanızı güncellemek için aşağıdaki linke tıklayınız.</p>
                        <p>
                            <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
                        </p>
                    `,
                  }
                  sgMail
                    .send(msg)
                    .then(() => {
                      console.log('Email sent')
                    })
                    .catch((error) => {
                      console.error(error)
                    })
            }).catch((error) => {
                console.error(error)
            })
    })
    

    
}

exports.getNewPassword = (req, res, next) => {

    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    const token = req.params.token;

    User.findOne({where:{
        resetToken: token,
        /*resetTokenExpiration: {
            $gt: Date.now()
        }*/
    }}).then(user => {
        console.log(user)
        res.render('account/new-password', {
            path: '/new-password',
            title: 'New Password',
            errorMessage: errorMessage,
            userId: user.id,
            passwordToken: token
        });
    }).catch(err => {
        console.log(err);
    })
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let _user;

    User.findOne({where:{
        resetToken: token,
        /*resetTokenExpiration: {
            $gt: Date.now()
        },*/
        id: userId
    }}).then(user => {
        _user = user;
        return bcrypt.hash(newPassword, 10);
    }).then(hashedPassword => {
        _user.password = hashedPassword;
        _user.resetToken = null;
        _user.resetTokenExpiration = null;
        return _user.save();
    }).then(() => {
        res.redirect('/login');
    }).catch(err => { console.log(err) });
}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/')
    });
}