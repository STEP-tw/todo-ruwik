const fs = require('fs');
const UserTodo = require('./user.js');
const TodoHandler = require('./todoHandler.js');
const webApp = require('./webApp.js');
const registered_users = [{userName:'manikm',name:'Manindra Krishna Motukuri'}]
let todoDetails = {};
let todos = {};
let allTodos = JSON.parse(fs.readFileSync('./data/todos.js','utf8'));

const giveFileType = function(url){
  return url.slice(url.lastIndexOf('.'));
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

let forbiddenUrls = ['/homePage','/public/html/homePage.html','/new','/public/html/createTodo.html','/implement','/edit','/delete']

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

app.post('/',(req,res)=>{
  console.log(req.body);
  res.redirect('/public/html/homePage.html')
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
  res.redirect('/public/html/homePage.html');
});

app.get('/js/createTodo.js',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/index.html');
});

app.post('/save',(req,res)=>{
  todoDetails.addTodo(req.body.todo.split('/n'));
  allTodos.push(todoDetails);
  let allTodosLIst = JSON.stringify(allTodos,null,2);
  fs.writeFileSync('./data/todos.js',allTodosLIst,'utf8');
})

app.get('/',(req,res)=>{
  res.redirect('/index.html');
  return;
});

app.get('/index.html',(req,res)=>{
  readAndWriteFile('./index.html',res);
})

app.get('/public/css/index.css',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/public/docs/icon.png',(req,res)=>{
  readAndWriteFile('.'+req.url,res);
})

app.get('/new',(req,res)=>{
  readAndWriteFile('./public/html/new.html',res);
})

app.get('/public/css/new.css',(req,res)=>{
  readAndWriteFile('./public/css/new.css',res);
})


app.get('/implement',(req,res)=>{
  res.end()
})

app.get('/edit',(req,res)=>{
  res.end()
})

app.get('/delete',(req,res)=>{
  res.end()
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

app.post('/createTodo.html',(req,res)=>{
  console.log(todoDetails);
  todoDetails.addTitle(req.body.title);
  todoDetails.addDescription(req.body.description)
  res.redirect('./public/html/createTodo.html',res);
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
