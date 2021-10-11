const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next){
    const { username } = request.headers;

    const user = users.find(user => user.username == username);

    if(!user){
        return response.status(404).json({ error: "Username not found!" });
    }

    request.user = user;

    return next();
}

app.post("/users", (request, response) => {
    const { name, username } = request.body;

    if(users.some((user) => user.username == username)){
        return response.status(400).json({ error: "Username already exists!" });
    }

    const user = {
        id: uuidv4(),
        name, 
        username,
        todos: []
    }

    users.push(user);

    return response.status(201).json(user);
})

app.get("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.status(200).json(user.todos);
})

app.post("/todos", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    user.todos.push({
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    });

    return response.status(201).send();
})

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { id } = request.params;
    const { user } = request;
    const { title, deadline } = request.body;

    if(!user.todos.some((todo) => todo.id === id)){
        return response.status(404).json({ error: "Todo not found!" });
    }

    user.todos.find(x => x.id === id).title = title;
    user.todos.find(x => x.id === id).deadline = new Date(deadline);

    return response.status(201).send();
})

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    if(!user.todos.some((todo) => todo.id === id)){
        return response.status(404).json({ error: "Todo not found!" });
    }

    user.todos.find(x => x.id === id).done = true;

    return response.status(201).send();
})

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    if(!user.todos.some((todo) => todo.id === id)){
        return response.status(404).json({ error: "Todo not found!" });
    }

    user.todos.splice(user.todos.map(x => {
        return x.id
    }).indexOf(id), 1);

    return response.status(201).send();
})

app.listen(3333);