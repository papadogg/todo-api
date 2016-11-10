var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');

var todos = [];
var nextTodoId = 1;

app.use(bodyParser.json());

app.get('/',function(req, res){
    res.send("TODO API");
});

app.get('/todos', function(req, res){
    res.json(todos);
});

app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id,10);
    var matchedTodo;

    todos.forEach(function(todo){
        if(todo.id === todoId){
            matchedTodo = todo;
        } 
    });
   
    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos',function(req,res){
    var body = req.body;
    
    body.id = nextTodoId;
    todos.push(body);
    
    res.json(body);
    
    nextTodoId++;
    
    
});

app.listen(PORT, function(){
    console.log("Server is running on port: " + PORT);
});