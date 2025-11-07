import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3434/api";

export default function BoardsApp() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");

  const [selectedBoard, setSelectedBoard] = useState(null);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDesc, setTodoDesc] = useState("");
  const [todoPriority, setTodoPriority] = useState("Low");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoAssignedTo, setTodoAssignedTo] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/boards`);
      setBoards(res.data.boards || res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(e) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/boards`, {
        name: newBoardName,
        description: newBoardDesc,
      });
      setNewBoardName("");
      setNewBoardDesc("");
      fetchBoards();
    } catch (err) {
      console.error(err);
      setError("Failed to create board");
    } finally {
      setLoading(false);
    }
  }

  async function openBoard(boardId) {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/boards/${boardId}`);
      setSelectedBoard(res.data.board || res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load board");
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!selectedBoard) return;
    if (!todoTitle.trim()) return;

    try {
      setLoading(true);
      const body = {
        title: todoTitle,
        description: todoDesc,
        priority: todoPriority,
        dueDate: todoDueDate ? new Date(todoDueDate) : undefined,
        assignedTo: todoAssignedTo,
      };
      const res = await axios.post(
        `${API_BASE}/boards/${selectedBoard._id}/todos`,
        body
      );
      // refresh board
      await openBoard(selectedBoard._id);
      setTodoTitle("");
      setTodoDesc("");
      setTodoPriority("Low");
      setTodoDueDate("");
      setTodoAssignedTo("");
    } catch (err) {
      console.error(err);
      setError("Failed to add todo");
    } finally {
      setLoading(false);
    }
  }

  async function updateTodoStatus(todoId, status) {
    try {
      await axios.patch(`${API_BASE}/todos/${todoId}/status`, { status });
      // refresh selected board
      if (selectedBoard) await openBoard(selectedBoard._id);
    } catch (err) {
      console.error(err);
      setError("Failed to update todo status");
    }
  }

  async function deleteTodo(todoId) {
    if (!selectedBoard) return;
    if (!window.confirm("Delete this todo?")) return;
    try {
      await axios.delete(
        `${API_BASE}/boards/${selectedBoard._id}/todos/${todoId}`
      );
      if (selectedBoard) await openBoard(selectedBoard._id);
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo");
    }
  }  



const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Boards & Todos</h1>
          <div>
            <div className="text-sm text-gray-600">Backend: {API_BASE}</div>
            {/* <input
              type="text"
              className="border rounded-lg px-2 py-1 mt-1"
              placeholder="search task........"
            /> */}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Boards list + create */}
          <section className="col-span-1 bg-white rounded-md shadow p-4">
            <h2 className="font-semibold mb-3">Boards</h2>

            <form onSubmit={createBoard} className="space-y-2 mb-4">
              <input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:opacity-90"
                disabled={loading}
              >
                Create Board
              </button>
            </form>

            <div className="space-y-2">
              {loading && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
              {boards.length === 0 && !loading && (
                <div className="text-sm text-gray-500">No boards yet</div>
              )}
              {boards.map((b) => (
                <div
                  key={b._id || b.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-gray-500">{b.description}</div>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBoard(b._id || b.id)}
                      className="text-sm px-2 py-1 border rounded text-blue-600"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Center: Selected Board view */}
          <section className="lg:col-span-2 bg-white rounded-md shadow p-4">
            {!selectedBoard ? (
              <div className="text-gray-600">
                Select a board to view its todos.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedBoard.name}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {selectedBoard.description}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedBoard(null)}
                      className="text-sm px-3 py-1 border rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Add todo */}
                <form
                  onSubmit={addTodo}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4"
                >
                  <input
                    value={todoTitle}
                    onChange={(e) => setTodoTitle(e.target.value)}
                    placeholder="Todo title"
                    className="col-span-1 md:col-span-2 border rounded px-3 py-2"
                  />
                  <select
                    value={todoPriority}
                    onChange={(e) => setTodoPriority(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>

                  <input
                    value={todoDesc}
                    onChange={(e) => setTodoDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="col-span-1 md:col-span-2 border rounded px-3 py-2"
                  />
                  <input
                    value={todoAssignedTo}
                    onChange={(e) => setTodoAssignedTo(e.target.value)}
                    placeholder="Assigned to (name)"
                    className="border rounded px-3 py-2"
                  />

                  <input
                    type="date"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    className="border rounded px-3 py-2"
                  />

                  <div className="md:col-span-3 flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      type="submit"
                    >
                      Add Todo
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 border rounded"
                      onClick={() => {
                        setTodoTitle("");
                        setTodoDesc("");
                        setTodoPriority("Low");
                        setTodoAssignedTo("");
                        setTodoDueDate("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </form>

                {/* Todos grouped by status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "todo", label: "To Do" },
                    { key: "in_progress", label: "In Progress" },
                    { key: "done", label: "Done" },
                  ].map((col) => (
                    <div key={col.key} className="bg-gray-50 p-3 rounded">
                      <h3 className="font-medium mb-2">{col.label}</h3>

                      {(selectedBoard.todos || []).filter(
                        (t) => t.status === col.key
                      ).length === 0 && (
                        <div className="text-sm text-gray-500">No items</div>
                      )}

                      {(selectedBoard.todos || [])
                        .filter((t) => t.status === col.key)
                        .map((todo) => (
                          <div
                            key={todo._id}
                            className="bg-white p-3 rounded mb-2 border flex flex-col gap-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold">
                                  {todo.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {todo.description}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {todo.priority}
                              </div>
                            </div>

                            <div className=" items-center justify-between text-sm text-gray-600">
                              <div>
                                Created:{" "}
                                {new Date(todo.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                Due:{" "}
                                {todo.dueDate
                                  ? new Date(todo.dueDate).toLocaleDateString()
                                  : "—"}
                              </div>
                              <div>Assigned: {todo.assignedTo || "—"}</div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              {col.key !== "todo" && (
                                <button
                                  onClick={() =>
                                    updateTodoStatus(todo._id, "todo")
                                  }
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  To Do
                                </button>
                              )}

                              {col.key !== "in_progress" && (
                                <button
                                  onClick={() =>
                                    updateTodoStatus(todo._id, "in_progress")
                                  }
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  In Progress
                                </button>
                              )}

                              {col.key !== "done" && (
                                <button
                                  onClick={() =>
                                    updateTodoStatus(todo._id, "done")
                                  }
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  Done
                                </button>
                              )}

                              <button
                                onClick={() => deleteTodo(todo._id)}
                                className="ml-auto px-2 py-1 bg-red-500 text-white rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>

        {error && <div className="mt-4 text-red-600">{error}</div>}
         
        <div className="md:text-end text-center  text-gray-600 mt-2 ">
           <button onClick={()=>navigate('/')} className="border px-2 py-1 cursor-pointer">Logout</button>
        </div>

      </div>
    </div>
  );
}
