const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const taskBoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tasks: [taskSchema], 
});

const TaskBoardModule = mongoose.model('TaskBoard', taskBoardSchema);
module.exports = TaskBoardModule;
