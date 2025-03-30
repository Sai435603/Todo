const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");

const PORT = 3000;
const FILE_PATH = './Todo.json';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(express.json()); 

// Function to read JSON file
const readTodos = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file:", err);
        return [];
    }
};

// Function to write JSON file
const writeTodos = (todos) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(todos, null, 2));
};

app.get('/', (req, res) => {
    let todos = readTodos();
    res.render('index.ejs', { todos });
});
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    let todos = readTodos();
    const taskToEdit = todos.find(todo => todo.id === id);

    if(!taskToEdit){
        return res.status(404).redirect("/");
    }
    res.render('edit.ejs', { task: taskToEdit });
});

app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    let todos = readTodos();
    const updatedTodos = todos.filter(todo => todo.id !== id);
    if (todos.length === updatedTodos.length) {
        return res.status(404).json({ message: "Task not found" });
    }
    writeTodos(updatedTodos);
    res.status(200).json({ message: "Task deleted successfully" });
});

app.post("/edit/:id", (req, res) => {
    let todos = readTodos();  
    let taskId = req.params.id;
    let updatedTask = req.body.task;

    let taskIndex = todos.findIndex(todo => todo.id === taskId);
    if (taskIndex !== -1) {
        todos[taskIndex].task = updatedTask;
        writeTodos(todos); 
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});
app.post('/add', (req, res) => {
    const Task = { id: uuidv4(), task: req.body.todo };

    if (Task.task) {
        let todos = readTodos();
        todos.push(Task);
        writeTodos(todos);
    }

    res.redirect('/');
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
