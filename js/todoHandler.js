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
  getIndex(id){
    for (let index = 0;index < this.todos.length;index++) {
      if(id==this.todos[index].todoId){
        return index;
      }
    }
    return -1
  }
  removeTodo(id){
    let index = this.getIndex(id);
    this.todos.splice(index,1);
    console.log(index);
  }
}

module.exports = TodoHandler;
