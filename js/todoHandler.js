class TodoHandler {
  constructor(todos=[]) {
    this.todos = todos;
  }
  addTodo(todo){
    this.todos.push(todo);
  }
  getTodos(){
    return this.todos;
  }
}

module.exports = TodoHandler;
