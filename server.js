var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;


var todos = [];
var nextTodoId = 1;

app.use(bodyParser.json());

app.get('/',function(req, res){
    res.send("TODO API");
});

app.get('/todos', function(req, res){
    var queryParams = req.query;
    var filteredTodos = todos;
    
    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
        filteredTodos = _.where(filteredTodos,{completed:true});
    } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
        filteredTodos = _.where(filteredTodos,{completed:false});
    }
    
    if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0){
        filteredTodos = _.filter(filteredTodos,function(todo){return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase())>-1});
    }
    
    res.json(filteredTodos);
});

app.get('/todos/:id',function(req,res){
    var todoId = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{id:todoId});

    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos',function(req,res){
    var body = _.pick(req.body, 'description', 'completed');
    
//    if(!_.isBoolean(body.completed) ||
//      !_.isString(body.description) ||
//      body.description.trim().length === 0){
//        return res.status(400).send();
//    }
//    
//    body.description = body.description.trim();
//    body.id = nextTodoId;
//    nextTodoId++;
//    
//    todos.push(body);    
//    res.json(body);
    
    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    },function(e){
        res.status(400).json(e);
    });
    
});

app.delete('/todos/:id',function(req,res){
   var todoId = parseInt(req.params.id,10);
   var matchedTodo = _.findWhere(todos, {id: todoId}); 
    
    if(matchedTodo){
        todos = _.without(todos,matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.put('/todos/:id',function(req, res){
    var todoId = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos, {id: todoId}); 
    var body = _.pick(req.body, 'description', 'completed');
    var validAttribures = {};
    
    if(!matchedTodo){
       return res.status(404).send();
    }
    
    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttribures.completed = body.completed;
    } else if(body.hasOwnProperty('completed')){
       return res.status(400).send();
    }
    
    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttribures.description = body.description;
    } else if(body.hasOwnProperty('description')){
       return res.status(400).send();
    }
    
    _.extend(matchedTodo,validAttribures);
    res.json(matchedTodo);
})

db.sequelize.sync().then(function(){
   app.listen(PORT, function(){
    console.log("Server is running on port: " + PORT);
}); 
});

