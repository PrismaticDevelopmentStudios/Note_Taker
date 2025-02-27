const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const url = require('url');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

const PORT = process.env.port || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new UX/UI note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        readAndAppend(newNote, './db/db.json');
        res.json(`Note added successfully 🚀`);
    } else {
        res.error('Error in adding note');
    }
});

// Delete route to delete a note
app.delete(`/api/notes/:id`, (req, res) => {
    console.info(`${req.method} request received to delete a note`);

    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) throw err;
        let reqId = req.params.id;
        const notes = JSON.parse(data);
        let newNotes = [];
        notes.forEach(note => {
            if (note.id !== reqId) {
                newNotes.push(note);
                fs.writeFile('./db/db.json', JSON.stringify(newNotes), (err) => {
                    console.log(err);
                });
            }
        });
    });
    res.send('Note Deleted');
});

var server = app.listen(process.env.PORT || 3001, function() {
    var port = server.address().port;
    console.log("Express is working on port " + port);
});