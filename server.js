const http = require('http');
const fs = require('fs');
const PORT = 8000;
const webApp = require('./webApp.js');

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

const registered_users = [{userName:'manikm',name:'Manindra Krishna Motukuri'}]

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/public/html/login.html','/public/html/guestBook.html']) && req.user) res.redirect('/public/html/writeCommentHere.html');
}

let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/logout']) && !req.user) res.redirect('/public/html/login.html');
}

const app = webApp.create();

app.use(loadUser);

app.use(redirectLoggedInUserToHome);

app.use(redirectLoggedOutUserToLogin);

app.post('/login',(req,res)=>{
  nameOfUser = req.body.userName;
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/public/html/writeCommentHere.html');
});

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

const server = http.createServer(app);
server.listen(PORT);
console.log(`listening on port ${PORT}`);
