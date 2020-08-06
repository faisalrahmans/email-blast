const Promise = require('bluebird');
const fs = require('fs');
const readline = require('readline');
const path = require('path')
const csv = require('csvtojson')
const nodemailer = require('nodemailer')

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

// read line by line with delay
; (async () => {
    const csvFile = path.resolve(__dirname, 'test.csv');
    const fileStream = fs.createReadStream(csvFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        await Promise.delay(1000); // delay 1s
        console.log(await readFromString(line));
        const data = await readFromString(line);
        const [Name, Email] = data;
        transporter.sendMail({
            from: account.user,
            to: Email,
            subject: 'subject email',
            text: '##Plaintext version of the message##',
        }, (error, info) => {
            if (error) {
                return console.log(error);
            } else
                console.log('Message sent: %s', info.messageId);
        });

    }
})()