const express = require('express');
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false, limit: '150mb' }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(methodOverride('_method'));

const PORT = process.env.PORT || 80;
const IP = process.env.IP || "127.0.0.1"

// ! check required directories

if (!fs.existsSync(__dirname + '/users')) {
    fs.mkdirSync(__dirname + '/users');
}
let fileName;

//  ! GET REQ

app.get('/', checkNotSignIn, (req, res) => {
    res.render('index');
});

app.get('/login', checkNotSignIn, (req, res) => {
    res.render('login', { msg: '' });
});

app.get('/signup', checkNotSignIn, (req, res) => {
    res.render('signup', { msg: '' })
});

app.get('/app', checkSignIn, (req, res) => {
    res.render('app');
});

app.get('/home', checkSignIn, (req, res) => {
        fs.readFile(__dirname + '/users/'+ fileName, 'utf8', async (err, file) => {
            if (err) {
                res.render('home', { file: "error", name: req.session.user.name });
            } else if (file == '') {
                res.render('home', { file: "empty", name: req.session.user.name });
            } else {
                const apps = await JSON.parse(file);
                res.render('home', { file: apps, name: req.session.user.name });
            }
        });
});

// ! DELETE REQ

app.delete('/delete', checkSignIn, (req, res) => {
    const id = req.query.id;
    fs.readFile(__dirname + '/users/' + fileName, 'utf8', async (err, file) => {
        if (err) {
            console.error(err);
        } else {
            let apps = await JSON.parse(file);
            apps.cred = apps.cred.filter((e) => e.id != id);
            if (apps.cred.length > 0) {
                fs.writeFileSync(__dirname + '/users/' + fileName, JSON.stringify(apps));
            } else {
                fs.writeFileSync(__dirname + '/users/' + fileName, '');
            }
            res.status(204).redirect('/home');
        }
    });
});

// ! POST REQ

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

app.post('/login', async (req, res) => {
    const mail = await req.body.email;
    const pass = await req.body.pass;
    const fn = __dirname + '/users.json'
    fs.readFile(fn, 'utf8', async (err, file) => {
        if (err) {
            res.redirect('/login');
        } else if (file =='') {
            res.render('signup', { msg: 'create a user first' });
        }
        else {
            const data = await JSON.parse(file);
            const uname = data.cred.find(user => user.email === mail);
            if (uname == null) {
                res.render('signup', { msg: 'User does not exist' });
            } else {
                if (await bcrypt.compare(pass, uname.pass)) {
                    fileName = uname.file;
                    req.session.user = uname;
                    res.redirect('/home');
                } else {
                    const msg = 'check email or password';
                    res.render('login', { msg: msg });
                }
            }
        }
    })
});

app.post('/signup', async (req, res) => {
    let users = {
        cred: []
    }
    const name = await req.body.name;
    const mail = await req.body.email;
    const pass = await req.body.pass;
    const uuid = Date.now();
    const filename = name + uuid + '.json';
    const fn = __dirname + '/users.json'
    hashpass = await bcrypt.hash(pass, 10);
    const nid = Date.now().toString();
    if (fs.existsSync(fn)) {
        fs.readFile(fn, 'utf8', async (err, file) => {
            if (err) {
                res.send("error");
            } else if (file == '') {
                users.cred.push({ id: nid, name: name, email: mail, pass: hashpass, file: filename });
                fs.writeFileSync(fn, JSON.stringify(users));
                fs.writeFileSync(__dirname + '/users/' + filename, '');
                res.redirect('/login');
            } else {
                users = await JSON.parse(file);
                if (users.cred.find(user => user.email === mail)) {
                    const msg = "Email id exists"
                    res.render('signup', {msg: msg})
                } else {
                    users.cred.push({ id: nid, name: name, email: mail, pass: hashpass, file: filename });
                    fs.writeFileSync(fn, JSON.stringify(users));
                    fs.writeFileSync(__dirname + '/users/' + filename, '');
                    res.redirect('/login');
                }
            }
        });
    } else {
        users.cred.push({ id: nid, name: name, email: mail, pass: hashpass, file: filename });
        fs.writeFileSync(fn, JSON.stringify(users));
        fs.writeFileSync(__dirname + '/users/' + filename, '');
        res.redirect('/login');
    }
});

app.post('/app', async (req, res) => {
    let apps = {
        cred: []
    }
    const name = await req.body.name;
    const mail = await req.body.email;
    const pass = await req.body.pass;
    const url = await req.body.url;
    const fn = __dirname + '/users/'+ fileName;
    const nid = Date.now().toString();
    if (fs.existsSync(fn)) {
        fs.readFile(fn, 'utf8', async (err, file) => {
            if (err) {
                res.send("error");
            } else if (file == '') {
                apps.cred.push({ id: nid, name: name, email: mail, pass: pass, url: url });
                fs.writeFileSync(fn, JSON.stringify(apps));
                res.redirect('/home');
            } else {
                apps = await JSON.parse(file);
                apps.cred.push({ id: nid, name: name, email: mail, pass: pass, url: url });
                fs.writeFileSync(fn, JSON.stringify(apps));
                res.redirect('/home');
            }
        });
    } else {
        apps.cred.push({ id: nid, name: name, email: mail, pass: pass, url: url });
        fs.writeFileSync(fn, JSON.stringify(apps));
        res.redirect('/home');
    }
});

// ! functions

function checkSignIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}
function checkNotSignIn(req, res, next) {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        next();
    }
}

// ! 404 page

app.get('/:id', (req, res) => {
    res.render('error');
});

// ! STARTING TO LISTEN ON SERVER

app.listen(process.env.PORT, process.env.IP, () => {
    console.log(`Server started at http://${IP}:${PORT}`);
});

//  TODO 
// * different files for different users 
// * store the user specific file name with the initial profile during signup
// * create a folder for different user profiles
// * render user specific files
// * logout and login check mechanism
// * limited privileges
// * error 404 page
// * Session management
// * add styling
// * A case for a email with _ in the exact place of a '.' . For e.g. tim.man@gmail.com & tim_man@gmail.com.
// * Perfectly Unique file names to minimize chances of conflict
// * password validation
// ! add a log file
// ! Forgot password option
// ! PWA config
// ! caching strategies
// ? ADMIN  PRIVILEGES
// ? MONGODB ALTERNATIVE
// ? PASSPORT LOGIN
// ? O Auth
