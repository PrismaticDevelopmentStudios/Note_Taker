const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 8080;
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const notes = require('./db/db.json')

let todos = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { v4: uuidv4 } = require('uuid');
uuidv4();

app.use(cors());

app.use(express.static(__dirname + '/public'));

// GET Routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', '/notes.html'))
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        let notes = JSON.parse(data);
        console.log(data, 34);
    })
});

// POST Routes
app.post('/api/notes', (req, res) => {
    console.log(req.body, 40);
    let title = req.body.title;
    let body = req.body.text;
    let data = {
        title: title,
        body: body,
    }
    fs.readFile('db/db.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            objData = JSON.parse(data); //now it an object
            console.log(objData, 52);
            objData.title = req.body.title;
            objData.text = req.body.text; //add/append desired data
            jsonData = JSON.stringify(objData); //convert it back to json
            console.log(objData, 55);
            fs.writeFile('./db/db.json', jsonData, 'utf8', (err) => {
                if (err) throw err;
            }); // write it back 
        }
    });
    res.send(data);
});

// Server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})