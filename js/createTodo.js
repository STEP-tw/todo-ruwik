const sendData = function(){
  let request = new XMLHttpRequest();
  request.open("POST", '/save', true);
  let todoList = document.getElementById('list').innerText
  request.send(`todo=${todoList}`);
  window.location.href='/save/homePage.html';
}
