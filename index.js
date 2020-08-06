const Promise = require('bluebird');
const { RateLimit } = require('async-sema');
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const nodemailer = require('nodemailer');
const Mustache = require('mustache');
// const template = require('./template.js');

const account = {
    name: 'Sender Example',
    user: 'sender@example.com'
}

var transporter = nodemailer.createTransport({
    host: '127.0.0.1', // Host Mailcatcher
    port: 1025,
    secure: false,
    pool: true
});

const readFromString = (csvStr) =>
    csv({
        noheader: true,
        output: "csv"
    })
        .fromString(csvStr)
        .then(v => v[0]);

; (async () => {
    const template = fs.readFileSync('./template.mustache', 'utf8');
    const csvFile = path.resolve(__dirname, 'test.csv');
    const fileStream = fs.createReadStream(csvFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // read line by line with sema
    const lim = RateLimit(5); // rps
    for await (const line of rl) {
        await lim();
        const data = await readFromString(line);
        const [Name, Email, Address, City] = data;
        const templateData = {
            name: Name,
            email: Email,
            address: Address,
            city: City
        }
        await transporter.sendMail({
            from: account.user,
            to: templateData.email,
            subject: templateData.name,
            text: 'Tester Plain Text Email',
            html: Mustache.render(template, templateData)
        });
        console.log('Message sent: %s', Email);
    }
})();