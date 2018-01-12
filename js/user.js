class UserTodo {
  constructor(userName) {
    this.userName = userName;
    this.time = new Date().toLocaleString();
    this.todo = []
    this.title = '';
    this.description = '';
  }
  addTodo(todoList){
    this.todo = todoList
  }
  addTitle(title){
    this.title = title;
  }
  addDescription(description){
    this.description = description;
  }
  getTitle(){
    return this.title;
  }
  getDescription(){
    return this.description;
  }
}

module.exports=UserTodo;
