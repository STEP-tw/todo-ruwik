const editTodo = function(){
  let request = new XMLHttpRequest();
  request.open("POST", '/editTodo', true);
  let id = event.target.id;
  request.send(`todoId=${id}`);
  window.location.href='/editTodoPage';
}
