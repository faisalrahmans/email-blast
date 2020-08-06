const nodemailer = require('nodemailer');
const csv = require('csvtojson/v1');
const template = require('./template.js');

const account = {
    name: 'Tester 1',
    user: 'tester@example.com'
}

var transporter = nodemailer.createTransport({

    // host: 'smtp.mailtrap.io', // Host mailtrap.io
    // port: 2525,
    // auth: {
    //     user: 'ad7e681d2e7473',
    //     pass: '2df84ed9038c8f'
    // },
    host: '127.0.0.1', // Host Mailcatcher
    port: 1025,
    secure: false,
    pool: true,
    rateLimit: true,
    maxConnections: 2,
    maxMessages: 5
});

var testfile = './test_list1.csv';
// my test list on csv format

var sendlist = [];
// empty array where we'll keep all our contacts

var message_increment = 0;
// variable to move to the next contact

function trigger_sending(env) {
    //env passes our email and name to 
    //customize the message

    var emailbody = template.generate(env.Name).toString();
    //generates a string to send  

    //the personalized HTML     

    transporter.sendMail({
        from: account.name,
        to: env.Email, //email address of our recipient          
        subject: env.Designation,
        text: '##Plaintext version of the message##',
        html: emailbody
    }, (error, info) => {
        if (error) {
            return console.log(error);
        } else
            console.log('Message sent: %s', info.messageId);
    });
}

function get_list() {
    csv().fromFile(testfile)
        .on('json', (jsonObj) => {
            sendlist.push(jsonObj);
            trigger_sending(sendlist[message_increment]);
            if (message_increment < sendlist.length) {
                message_increment++;
                // if our increment is less than our list length, 
                // we'll keep sending          
            }
        })
        .on('done', () => {
            console.log('Sending Email !');
        })
}

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
        get_list();
        // trigger the whole app once the mail server is ready     
    }
});