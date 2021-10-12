const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');

//method override
const methodOverride = require('method-override');

const app = express();

const port = 3000;

//setup 
app.use(methodOverride('_method'));


// flash
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

// flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,

}))
app.use(flash());


//setup EJS
app.set('view engine', 'ejs');

//byuild in middle ware
app.use(express.static('public'));
//third party middle ware
app.use(expressLayouts);

app.set('layout', 'layouts/main-layout');
app.use(express.urlencoded({ extended: true }));

app.set('layout', 'layouts/main-layout');

app.get('/', (req, res) => {

    const mahasiswa = [{ nama: 'sandhika', email: 'sandhika.admin@email.com' }, { nama: 'budi', email: 'budi.admin@email.com' }];

    res.render('index', {
        nama: 'sandhika',
        title: 'halaman home'
    })
});

app.get('/about', (req, res) => {
    res.render('about', { nama: 'wahyu', title: 'Halaman About' });
});

app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();

    res.render('contact', { title: 'Halaman Contact', contacts: contacts, msg: req.flash('msg') });
});


//proses crud
app.get('/contact/add', (req, res) => {
    res.render('add-contact', { title: 'Form tambah Contact' });
});

// app.get('/contact/delete/:nama', async (req, res) => {

//     const contact = await Contact.findOne({ nama: req.params.nama });

//     if (!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     } else {
//         Contact.deleteOne({ _id: contact._id }).then((result) => {
//             //res.send('data berhasil disimpan');
//             req.flash('msg', 'data kontak berhasil dihapus');

//             res.redirect('/contact');

//         });
//     }
// });

app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    res.render('edit-contact', { title: 'Halaman Edit Contact', contact: contact });
});

app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });

    res.render('detail', { title: 'Halaman Detail Contact', contact: contact });
});

//proses
//tambah data contact
app.post('/contact', [
    body('nama').custom(async (value) => {

        const duplikat = await Contact.findOne({ nama: value });

        if (duplikat) {
            throw new Error('Nama contact sudah digunakan');

        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(400).json({errors: errors.array()});
        res.render('add-contact', {
            title: 'Form Tambah Data Contact',
            errors: errors.array(),
        });

    } else {
        Contact.insertMany(req.body, (error, result) => {

            //console.log(req.body)
            //res.send('data berhasil disimpan');
            req.flash('msg', 'data kontak berhasil ditambahkan');

            res.redirect('/contact');
        })

    }
});

app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value });

        if (duplikat && value !== req.body.oldnama) {
            throw new Error('Nama contact sudah digunakan');

        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        //console.log(req.body);
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            errors: errors.array(),
            contact: req.body,
        });


    } else {
        console.log(req.body);
        await Contact.updateMany(
            { _id: req.body._id },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                },
                
            }, 
            ).then((result) => {

                req.flash('msg', 'data kontak berhasil diubah');
                res.redirect('/contact');
                //res.send('data berhasil disimpan');
            });

    }
});

app.delete('/contact', async (req, res) => {
    //res.send(req.body);
    const contact = await Contact.findOne({ nama: req.body.nama });

    if (!contact) {
        res.status(404);
        res.send('<h1>404</h1>');
    } else {
        Contact.deleteOne({ _id: contact._id }).then((result) => {
            //res.send('data berhasil disimpan');
            req.flash('msg', 'data kontak berhasil dihapus');

            res.redirect('/contact');

        });
    }
});

app.listen(port, () => {
    console.log(`Mongo contact app | listening at http://localhost:${port}`);
});