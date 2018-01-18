const fs = require('fs');
const UserTodo = require('./userTodo.js');
const TodoHandler = require('./todoHandler.js');
const webApp = require('./webapp.js');
const forbiddenUrls = require('./forbiddenUrls.js').forbiddenUrls;
const registered_users = [{userName:'manikm',name:'Manindra Krishna Motukuri'},{userName:'mani',name:'Manindra Krishna Motukuri'}]
let todoDetails = {};
let todos = {};
let allTodos = JSON.parse(fs.readFileSync('./data/todos.js','utf8'));
let todoHandler = new TodoHandler(allTodos);

const decode = function(data){
  let decodedData = decodeURIComponent(data);
  return decodedData.replace(/\+/g,' ');
}

const giveFileType = function(url){
  return url.slice(url.lastIndexOf('.'));
}

const createTodoImgTag = function(id,alt){
  return `<center><img id="${id}" src="/public/docs/To-Do-List.png" alt=${alt}>\n${alt}<br></center>`
}

const createButton = function(name,id,onclickFunc){
  return `<center><button id="${id}" type="button" onclick="${onclickFunc}()" name="button">${name}</button></center>`
}

const createDivision = function(className,innerHtml){
  return `<div class="${className}">${innerHtml}</div>`
}

const createTableRow = function(innerHtml){
  return `<tr>${innerHtml}</tr>`;
}

const createTableData = function(innerHtml){
  return `<td>${innerHtml}</td>`;
}

const contentTypeOfFiles = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'img/jpg',
  '.pdf': 'text/pdf',
  '.gif': 'img/gif',
  '.ico': 'img/ico',
  '.png':'img/png'
}

const giveTime = function(){
  let timeAndDate = new Date();
  return timeAndDate.getHours()+':'+timeAndDate.getMinutes()+':'+timeAndDate.getSeconds();
};

const giveDate = function(){
  let date = new Date();
  return date.getDate()+"/"+(1+date.getMonth())+'/'+date.getFullYear();
};

const giveContentType = function(url){
  let fileType = giveFileType(url);
  return contentTypeOfFiles[fileType];
}

const readAndWriteFile = function(filePath,res){
  fs.readFile(filePath,(err,data)=>{
    if(err){
      res.statusCode = 404;
      res.write('<h1>file not found</h1>');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type',giveContentType(filePath));
      res.write(data);
    };
    res.end();
  });
};

const replaceAndWriteFile = function(filePath,res,content,area){
  fs.readFile(filePath,(err,data)=>{
    if(err){
      res.statusCode = 404;
      res.write('<h1>file not found</h1>');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type',giveContentType(filePath));
      res.write(data.toString().replace(area,content));
    };
    res.end();
  });
}

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/index.html']) && req.user) res.redirect('/public/html/homePage.html');
}

let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(forbiddenUrls) && !req.user) res.redirect('/index.html');
}

const app = webApp.create();

app.use(loadUser);

app.use(redirectLoggedInUserToHome);

app.use(redirectLoggedOutUserToLogin);

app.post('/editTodo',(req,res)=>{
  todoHandler.setTodoBeEdited(req.body.todoId);
})

app.post('/',(req,res)=>{
  res.redirect('/public/html/homePage.html')
})

app.post('/saveEditedTodo',(req,res)=>{
  let todoToBeSaved = todoHandler.getTodoToBeEdited();
  todoToBeSaved.time = new Date().toLocaleString();
  todoToBeSaved.title = req.body.title;
  todoToBeSaved.description = req.body.description;
  todoToBeSaved.todo = req.body.todoList.split('\n')
  todoDetails.addTodo(todoToBeSaved)
  todoHandler.removeTodo(todoToBeSaved.todoId);
  todoHandler.addTodo(todoToBeSaved);
  todoHandler.reset('todoToBeEdited',{});
  allTodos=todoHandler.getTodos();
  let allTodosLIst = JSON.stringify(allTodos,null,2);
  fs.writeFileSync('./data/todos.js',allTodosLIst,'utf8');
})

app.post('/deleteTodo',(req,res)=>{
  let todoId = req.body.todoId;
  todoHandler.removeTodo(todoId);
  allTodos=todoHandler.getTodos();
  let allTodosLIst = JSON.stringify(allTodos,null,2);
  fs.writeFileSync('./data/todos.js',allTodosLIst,'utf8');
})

app.post('/homePage.html',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/indexWithMessage');
    return;
  }
  let sessionid = new Date().getTime();
  todoDetails = new UserTodo(req.body.userName);
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  user.userName = req.body.userName
  res.redirect('/public/html/homePage.html');
});

app.post('/createTodo.html',(req,res)=>{
  todoDetails.addTitle(decode(req.body.title));
  todoDetails.addDescription(decode(req.body.description));
  let idOfTodo = new Date().getTime();
  todoDetails.addTodoId(idOfTodo);
  res.redirect('./public/html/createTodo.html',res);
})

app.post('/save',(req,res)=>{
  todoDetails.addTodo(req.body.todo.split('\n'));
  todoHandler.addTodo(todoDetails)
  let name = todoDetails.userName;
  todoDetails = new UserTodo(name)
  allTodos=todoHandler.getTodos();
  let allTodosLIst = JSON.stringify(allTodos,null,2);
  fs.writeFileSync('./data/todos.js',allTodosLIst,'utf8');
})

app.get('/editTodoPage',(req,res)=>{
  let todoToBeEdited = todoHandler.getTodoToBeEdited()
  todoToBeEdited=JSON.stringify(todoToBeEdited);
  replaceAndWriteFile('./public/html/editTodo.html',res,todoToBeEdited,'{}')
})

app.get('/save/homePage.html',(req,res)=>{
  replaceAndWriteFile('./public/html/homePage.html',res,'<body>\n<center><h3>Todo Saved</h3></center>',"<body>")
})

app.get('/js/createTodo.js',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/editWithMessage',(req,res)=>{
  let alTodos = todoHandler.getTodos();
  alTodos=alTodos.filter((e)=>{
    return req.user.userName == e.userName;
  })
  alTodos = alTodos.map((e)=>{
    let data = createTodoImgTag(e.todoId,e.title)+createButton('Edit',e.todoId,'editTodo');
    data = createDivision('todo',data)
    return createTableData(data)
  });
  let data = ''
  for (var i = 0; i < alTodos.length; i++) {
    data+=alTodos[i]
    if((i+1)%3==0){
      data = createTableRow(data)
    }
  }
  data+="edited successfully"
  replaceAndWriteFile('./public/html/edit.html',res,'<table>'+data,'<table>');
})

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  todoDetails={}
  res.redirect('/index.html');
});

app.get('/',(req,res)=>{
  res.redirect('/index.html');
  return;
});

app.get('/index.html',(req,res)=>{
  readAndWriteFile('./index.html',res);
})

app.get('/public/css/editTodo.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/js/editTodo.js',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/css/index.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/icon.png',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/logout.jpg',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/new',(req,res)=>{
  readAndWriteFile('./public/html/new.html',res);
})

app.get('/js/delete.js',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/css/new.css',(req,res)=>{
  readAndWriteFile('./public/css/new.css',res);
})

app.get('/public/docs/To-Do-List.png',(req,res)=>{
  readAndWriteFile('./public/docs/To-Do-List.png',res);
})

app.get('/implement',(req,res)=>{
  res.end();
})

app.get('/edit',(req,res)=>{
  let alTodos = todoHandler.getTodos();
  alTodos=alTodos.filter((e)=>{
    return req.user.userName == e.userName;
  })
  alTodos = alTodos.map((e)=>{
    let data = createTodoImgTag(e.todoId,e.title)+createButton('Edit',e.todoId,'editTodo');
    data = createDivision('todo',data)
    return createTableData(data)
  });
  let data = ''
  for (var i = 0; i < alTodos.length; i++) {
    data+=alTodos[i]
    if((i+1)%3==0){
      data = createTableRow(data)
    }
  }
  replaceAndWriteFile('./public/html/edit.html',res,'<table>'+data,'<table>');
})

app.get('/public/css/edit.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/js/edit.js',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/delete',(req,res)=>{
  let alTodos = todoHandler.getTodos();
  alTodos=alTodos.filter((e)=>{
    return req.user.userName == e.userName;
  })
  alTodos = alTodos.map((e)=>{
    let data = createTodoImgTag(e.todoId,e.title)+createButton('Delete',e.todoId,'deleteTodo');
    data = createDivision('todo',data)
    return createTableData(data)
  });
  let data = ''
  for (var i = 0; i < alTodos.length; i++) {
    data+=alTodos[i]
    if((i+1)%3==0){
      data = createTableRow(data)
    }
  }
  replaceAndWriteFile('./public/html/delete.html',res,'<table>'+data,'<table>');
})

app.get('/public/css/delete.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/html/homePage.html',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/css/homePage.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/indexWithMessage',(req,res)=>{
  replaceAndWriteFile('./index.html',res,'<center>\nInvalid User Name','</center>');
})

app.get('/public/docs/new.png',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/edit.png',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/delete.png',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/follow.jpg',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/html/createTodo.html',(req,res)=>{
  let title = todoDetails.getTitle();
  let description = todoDetails.getDescription();
  let detailsInHtml = `<h2>${title}</h2>\n<h3>${description}</h2>`
  replaceAndWriteFile('.'+req.url,res,detailsInHtml,'Title');
})

app.get('/public/css/createTodo.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

module.exports = app;
