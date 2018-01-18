const toListItem = function(innerText){
  return `<li>${innerText}</li>`;
}

const setUpTodo = function(){
  document.getElementById('title').innerText = currentTodo.title
  document.getElementById('description').innerText=currentTodo.description;
  let list = currentTodo.todo.map(e=>toListItem(e));
  list = list.join('\n')
  document.getElementById('list').innerHTML = list;
}

const saveEditedTodo = function(){
  let todoList = document.getElementById('list').innerText
  let title = document.getElementById('title').innerText
  let description = document.getElementById('description').innerText
  let request = new XMLHttpRequest();
  request.open("POST", '/saveEditedTodo', true);
  request.send(`title=${title}&description=${description}&todoList=${todoList}`);
  window.location.href='/editWithMessage';
}

window.onload = setUpTodo;
