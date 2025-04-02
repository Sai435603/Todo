const express = require('express');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");

const PORT = 3000;
const FILE_PATH = './Todo.json';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const readTodos = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file:", err);
        return [];
    }
};

const writeTodos = (todos) => {
    try{
    fs.writeFileSync(FILE_PATH, JSON.stringify(todos, null, 2));
    }
    catch(err){
         console.log("Error writing File: ", err);
    }
};

app.get('/', (req, res) => {
    res.render('index.ejs', { todos: readTodos() });
});

app.post("/add", (req, res) => {
    const { todo } = req.body;
    console.log("Received task:", req.body);
    if (!todo) {
        return res.status(400).json({ success: false, message: "Task cannot be empty" });
    }

    let todos = readTodos();
    const newTodo = { id: uuidv4(), task: todo };

    todos.push(newTodo);
    writeTodos(todos);

    res.status(201).json({ success: true, todo: newTodo });
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
    }
    return res.json({ success: false });
});

app.get("/fetch/:id", (req, res) => {
    let todos = readTodos();
    let taskId = req.params.id;
    let task = todos.find(todo => todo.id === taskId);

    if (task) {
        return res.json({ success: true, task: task.task });
    } else {
        return res.status(404).json({ success: false, message: "Task not found" });
    }
});


app.delete('/delete/:id', (req, res) => {
    let todos = readTodos();
    let updatedTodos = todos.filter(todo => todo.id !== req.params.id);
    if (todos.length === updatedTodos.length) {
        return res.status(404).json({ message: "Task not found" });
    }
    writeTodos(updatedTodos);
    res.status(200).json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
