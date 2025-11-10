"use client";
import { useEffect, useState } from "react";

interface Category { id: number; name: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const fetchCategories = () => {
    fetch("http://127.0.0.1:8000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = () => {
    fetch("http://127.0.0.1:8000/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(() => { setName(""); fetchCategories(); });
  };

  const handleDelete = (id: number) => {
    fetch(`http://127.0.0.1:8000/api/categories/${id}`, { method: "DELETE" })
      .then(() => fetchCategories());
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Category List</h1>

      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" />
        <button onClick={handleAdd}>Add</button>
      </div>

      <ul>
        {categories.map(c => (
          <li key={c.id}>
            {c.name}
            <button onClick={() => handleDelete(c.id)} style={{ marginLeft: 10 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
