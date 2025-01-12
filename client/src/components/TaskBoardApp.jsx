import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Input from "./Input";
const TaskBoardApp = () => {
  const [isTaskboardDraged, setIsTaskboardDraged] = useState(false);
  const [taskBoards, setTaskBoards] = useState([]);
  const [taskBoardTitle, setTaskBoardTitle] = useState("");
  const [boardEditStates, setBoardEditStates] = useState({});
  const [taskEditStates, setTaskEditStates] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if token is not available
      toast.error("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/boards", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch boards");
      const data = await response.json();
      setTaskBoards(data);
      const initialEditStates = data.reduce((acc, board) => {
        acc[board._id] = null;
        return acc;
      }, {});
      setBoardEditStates(initialEditStates);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error('Failed to load boards');
    }
  };
  const handleCreateTaskBoard = async () => {
    if (!taskBoardTitle.trim()) {
      toast.error('Please enter a board title');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: taskBoardTitle,
          tasks: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task board');
      }

      const result = await response.json();
      setTaskBoards((prevBoards) => [...prevBoards, result]);
      setTaskBoardTitle('');
      setBoardEditStates((prevStates) => ({
        ...prevStates,
        [result._id]: null, // Reset the new board's edit state
      }));
      toast.success('Task board created successfully');
    } catch (error) {
      console.error('Error creating task board:', error);
      toast.error('Failed to create task board');
    }
  };


  const handleEditTaskBoard = async (boardId, newTitle) => {
    if (!newTitle.trim()) {
      toast.error('Board title cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/boards/${boardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTitle }),
      });
      if (!response.ok) throw new Error("Failed to edit task board");
      setTaskBoards(
        taskBoards.map((board) =>
          board._id === boardId ? { ...board, name: newTitle } : board
        )
      );
      setBoardEditStates((prevState) => ({
        ...prevState,
        [boardId]: null,
      }));
      toast.success('Board name updated successfully');
    } catch (error) {
      console.error("Error editing task board:", error);
      toast.error('Failed to update board name');
    }
  };


  const handleDeleteTaskBoard = async (boardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/boards/${boardId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete task board");
      setTaskBoards(taskBoards.filter((board) => board._id !== boardId));
      toast.success('Board deleted successfully');
    } catch (error) {
      console.error("Error deleting task board:", error);
      toast.error('Failed to delete board');
    }
  };

  const updateFullTaskBoards = async (newTaskBoards) => {
    if (isTaskboardDraged) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/boards/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ taskBoards: taskBoards }),
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        const newTask = await response.json();
        setTaskBoards(newTask.taskBoards);
        setIsTaskboardDraged(false)
        toast.success('Changes saved successfully');
        return true;
      } catch (e) {
        console.error("Error adding task:", e);
        toast.error('Failed to save changes');
        return false;
      }
    }
    return true;
  }
  const handleAddTask = async (boardId, taskTitle, taskDescription) => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      toast.error('Task title and description are required');
      return;
    }

    const res = await updateFullTaskBoards();
    if (res) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/boards/${boardId}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription
          }),
        });

        if (!response.ok) throw new Error("Failed to add task");

        const newTask = await response.json();
        console.log(newTask)

        setTaskBoards((prevTaskBoards) =>
          prevTaskBoards.map((taskBoard) =>
            taskBoard._id == newTask.taskboard._id ? newTask.taskboard : taskBoard
          )
        );
        toast.success('Task added successfully');
      } catch (error) {
        console.error("Error adding task:", error);
        toast.error('Failed to add task');
      }
    }
  };

  const handleEditTask = async (boardId, taskId, newTitle, newDescription) => {
    if (!newTitle?.trim() || !newDescription?.trim()) {
      toast.error('Task title and description are required');
      return;
    }

    const res = await updateFullTaskBoards();
    if (res) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/boards/${boardId}/tasks/${taskId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTitle, description: newDescription }),
          }
        );

        if (!response.ok) throw new Error("Failed to edit task");
        const updatedTask = await response.json();
        console.log(updatedTask)

        setTaskBoards((prevTaskBoards) =>
          prevTaskBoards.map((taskBoard) =>
            taskBoard._id == updatedTask.taskboard._id ? updatedTask.taskboard : taskBoard
          )
        );

        setTaskEditStates(prev => {
          const newState = { ...prev };
          delete newState[taskId];
          return newState;
        });


        toast.success('Task updated successfully');
      } catch (error) {
        console.error("Error editing task:", error);
        toast.error('Failed to update task');
      }
    }
  };


  const handleDeleteTask = async (boardId, taskId) => {
    const res = await updateFullTaskBoards();
    if (res) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/boards/${boardId}/tasks/${taskId}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error('Failed response:', await response.json());
          throw new Error("Failed to delete task");
        }

        setTaskBoards((prevBoards) =>
          prevBoards.map((board) =>
            board._id === boardId
              ? { ...board, tasks: board.tasks.filter((task) => task._id !== taskId) }
              : board
          )
        );
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error('Failed to delete task');
      }
    }
  };
  const handleOnDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return; // Dropped outside the board

    const sourceBoardIndex = taskBoards.findIndex(
      (board) => board._id === source.droppableId
    );
    const destBoardIndex = taskBoards.findIndex(
      (board) => board._id === destination.droppableId
    );

    const newBoards = [...taskBoards];
    const sourceBoard = { ...newBoards[sourceBoardIndex] };
    const destBoard = sourceBoardIndex === destBoardIndex
      ? sourceBoard
      : { ...newBoards[destBoardIndex] };

    const [movedTask] = sourceBoard.tasks.splice(source.index, 1);
    destBoard.tasks.splice(destination.index, 0, movedTask);

    if (sourceBoardIndex === destBoardIndex) {
      newBoards[sourceBoardIndex] = sourceBoard;
    } else {
      newBoards[sourceBoardIndex] = sourceBoard;
      newBoards[destBoardIndex] = destBoard;
    }

    setTaskBoards(newBoards);
    setIsTaskboardDraged(true);

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 relative">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: 'white',
              borderRadius: '8px',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#EF4444',
              color: 'white',
              borderRadius: '8px',
            },
          },
        }}
      />
      <Button
        onClick={() => { updateFullTaskBoards() }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg absolute top-4 right-4 transform transition-all duration-200 hover:scale-105 shadow-md"
      >
        Save
      </Button>
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Task Board App
        </h1>
        <div className="mb-8 flex justify-center">
          <Input
            type="text"
            value={taskBoardTitle}
            onChange={(e) => setTaskBoardTitle(e.target.value)}
            placeholder="Enter board title"
            className="border border-gray-300 rounded-lg p-2 mr-3 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
          />
          <Button
            onClick={handleCreateTaskBoard}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-105 shadow-md"
          >
            Create Board
          </Button>
        </div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {taskBoards.map((board) => (
              <div
                key={board._id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-80 flex flex-col"
              >
                {/* Task Board Header */}
                <div className="flex justify-between items-center mb-4">
                  {boardEditStates[board._id] !== null ? (
                    <Input
                      type="text"
                      value={boardEditStates[board._id]}
                      onChange={(e) =>
                        setBoardEditStates({
                          ...boardEditStates,
                          [board._id]: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded-lg p-2 w-3/4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-800">{board.name}</h2>
                  )}

                  <div className="flex space-x-2">
                    {boardEditStates[board._id] !== null ? (
                      <Button
                        onClick={() => {
                          handleEditTaskBoard(board._id, boardEditStates[board._id]);
                          setBoardEditStates((prevState) => ({
                            ...prevState,
                            [board._id]: null,
                          }));
                        }}
                        className="text-emerald-500 hover:text-emerald-600 transition-colors duration-200 font-medium"
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          setBoardEditStates({ ...boardEditStates, [board._id]: board.name })
                        }
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                      >
                        Edit
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDeleteTaskBoard(board._id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Tasks */}
                <Droppable droppableId={board._id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3 flex-1"
                    >
                      {(board.tasks || []).map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200"
                            >
                              <div className="flex justify-between items-center">
                                {taskEditStates[task._id] ? (
                                  <div className="w-full space-y-2">
                                    <Input
                                      type="text"
                                      value={taskEditStates[task._id]?.title || ""}
                                      onChange={(e) =>
                                        setTaskEditStates((prev) => ({
                                          ...prev,
                                          [task._id]: {
                                            ...prev[task._id],
                                            title: e.target.value,
                                          },
                                        }))
                                      }
                                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <textarea
                                      value={taskEditStates[task._id]?.description || ""}
                                      onChange={(e) =>
                                        setTaskEditStates((prev) => ({
                                          ...prev,
                                          [task._id]: {
                                            ...prev[task._id],
                                            description: e.target.value,
                                          },
                                        }))
                                      }
                                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                      rows="3"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full">
                                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                    <p className="text-gray-600 mt-1">{task.description}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-3 mt-3">
                                {taskEditStates[task._id] ? (
                                  <>
                                    <Button
                                      onClick={() => {
                                        handleEditTask(
                                          board._id,
                                          task._id,
                                          taskEditStates[task._id]?.title || task.title,
                                          taskEditStates[task._id]?.description || task.description
                                        );
                                      }}
                                      className="text-emerald-500 hover:text-emerald-600 transition-colors duration-200 font-medium"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        setTaskEditStates((prev) => {
                                          const newState = { ...prev };
                                          delete newState[task._id];
                                          return newState;
                                        })
                                      }
                                      className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium"
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() =>
                                        setTaskEditStates((prev) => ({
                                          ...prev,
                                          [task._id]: {
                                            title: task.title,
                                            description: task.description,
                                          },
                                        }))
                                      }
                                      className="text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteTask(board._id, task._id)}
                                      className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium"
                                    >
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task Button */}
                <Button
                  onClick={() =>
                    handleAddTask(board._id, "New Task", "Task Description")
                  }
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-emerald-700 transform transition-all duration-200 hover:scale-105 shadow-md"
                >
                  Add Task
                </Button>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );

};

export default TaskBoardApp;
