"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit3, Save, X, Plus } from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore"

interface Todo {
  id: string
  text: string
  completed: boolean
  isEditing?: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editText, setEditText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, "todos"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTodos(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Todo[]
        )
        setLoading(false)
      },
      (err) => {
        setError("Failed to load todos.")
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const addTodo = async () => {
    if (newTodo.trim() !== "") {
      try {
        await addDoc(collection(db, "todos"), {
          text: newTodo.trim(),
          completed: false,
          createdAt: Date.now(),
        })
        setNewTodo("")
      } catch (err) {
        setError("Failed to add todo.")
      }
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id))
    } catch (err) {
      setError("Failed to delete todo.")
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, "todos", id), { completed: !completed })
    } catch (err) {
      setError("Failed to update todo.")
    }
  }

  const startEdit = (id: string, currentText: string) => {
    setEditText(currentText)
    setEditingId(id)
  }

  const saveEdit = async (id: string) => {
    if (editText.trim() !== "") {
      try {
        await updateDoc(doc(db, "todos", id), { text: editText.trim() })
        setEditText("")
        setEditingId(null)
      } catch (err) {
        setError("Failed to update todo.")
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : todos.length === 0 ? (
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
                      onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                    />

                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEdit(todo.id)
                              } else if (e.key === "Escape") {
                                cancelEdit()
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveEdit(todo.id)} disabled={!editText.trim()}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
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

                    {editingId !== todo.id && (
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
