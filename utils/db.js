const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/learnings');

// const Contact = mongoose.model('Contact', {
//     nama: {
//         type: String,
//         required: true,
//     }, nohp: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//     },
// });

// // tambah 1 data
// const one = new Contact({
//     nama: "sara",
//     nohp: '081237131016',
//     email: 'sara.admin@emai.com'
// });
// one.save().then((contact) => console.log(contact));
