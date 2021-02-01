const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', express.static('public'));



// Classes and functions
class Note {
    constructor(title, text, id) {
        Note.lastId++;
        this.id = id ? id : Note.lastId;
        this.title = title;
        this.text = text;
    }
}
var loadNotes = function() {
    let arr = JSON.parse(fs.readFileSync(db, 'utf-8'));
    notes = [];
    for (let note of arr) {
        notes.push(new Note(note.title, note.text, note.id));
    }
    Note.lastId = notes.length > 0 ? notes[notes.length - 1].id : 0;
}
var saveNotes = function() {
    fs.writeFileSync(db, JSON.stringify(notes, null, 4), 'utf-8');
}



// Initialize db
const dir = './db';
const db = './db/db.json';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
if (!fs.existsSync(db)) fs.writeFileSync(db, '[]', 'utf-8');



// Start db
let notes = [];
console.log(`Loading notes...`);
loadNotes();
console.log(`Notes loaded.`);
console.log(`Last note ID: ${Note.lastId}`);



// API routes
app.get("/api/notes", function(req, res) {
    loadNotes();
    res.json(notes);
});
app.post("/api/notes", function(req, res) {
    loadNotes();
    notes.push(new Note(req.body.title, req.body.text));
    saveNotes();
    res.json(notes[notes.length - 1]);
    console.log(`Note ${notes[notes.length - 1].id} added.`);
    console.log(notes[notes.length - 1]);
});
app.delete("/api/notes/:id", function(req, res) {
    loadNotes();
    let delId = req.params.id;
    let delIndex = notes.findIndex(note => note.id == delId);
    let delNote;
    if (delIndex === -1) {
        res.json({ error: `note not found` });
        console.log(`Note ${delId} not found.`);
    } else {
        delNote = notes[delIndex];
        delNote.deleted = true;
        notes.splice(delIndex, 1);
        saveNotes();
        res.json(delNote);
        console.log(`Note ${delId} deleted.`);
        console.log(delNote);
        if (notes.length === 0) console.log(`All notes have been deleted.`);
    }
});



// HTML routes
app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/notes.html"));
});
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});


// Listen on port
app.listen(port, function() {
    console.log(`App listening on port ${port}.`);
});