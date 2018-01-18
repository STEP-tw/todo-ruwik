const deleteTodo = function(){
  let request = new XMLHttpRequest();
  request.open("POST", '/deleteTodo', true);
  let id = event.target.id;
  request.send(`todoId=${id}`);
  window.location.reload();
}
