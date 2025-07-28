"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit3, Save, X, Plus } from "lucide-react"

interface Todo {
  id: number
  text: string
  completed: boolean
  isEditing: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Learn React", completed: false, isEditing: false },
    { id: 2, text: "Build a todo app", completed: true, isEditing: false },
    { id: 3, text: "Deploy to production", completed: false, isEditing: false },
  ])
  const [newTodo, setNewTodo] = useState("")
  const [editText, setEditText] = useState("")

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      const newTask: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        isEditing: false,
      }
      setTodos([...todos, newTask])
      setNewTodo("")
    }
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const startEdit = (id: number, currentText: string) => {
    setEditText(currentText)
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, isEditing: true } : { ...todo, isEditing: false })))
  }

  const saveEdit = (id: number) => {
    if (editText.trim() !== "") {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text: editText.trim(), isEditing: false } : todo)))
      setEditText("")
    }
  }

  const cancelEdit = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, isEditing: false } : todo)))
    setEditText("")
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo Master</h1>
            <p className="text-gray-600">Stay organized and get things done</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTodo()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addTodo} disabled={!newTodo.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Tasks</span>
              <span className="text-sm font-normal text-muted-foreground">
                {completedCount} of {totalCount} completed
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg mb-2">No tasks yet!</p>
                <p>Add your first task above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      todo.completed ? "bg-muted/50 border-muted" : "bg-background border-border hover:shadow-sm"
                    }`}
                  >
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => toggleComplete(todo.id)}
                    />

                    <div className="flex-1">
                      {todo.isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEdit(todo.id)
                              } else if (e.key === "Escape") {
                                cancelEdit(todo.id)
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveEdit(todo.id)} disabled={!editText.trim()}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => cancelEdit(todo.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`cursor-pointer ${
                            todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {todo.text}
                        </label>
                      )}
                    </div>

                    {!todo.isEditing && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(todo.id, todo.text)}
                          disabled={todo.completed}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Built with React and shadcn/ui • Stay productive and organized</p>
            <p>Tips: Press Enter to quickly add tasks, click the checkbox to mark complete</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
