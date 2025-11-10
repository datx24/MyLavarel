"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Category { id: number; name: string; }

export default function EditCategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/categories/${id}`)
      .then(res => res.json())
      .then(data => setCategory(data));
  }, [id]);

  const handleUpdate = () => {
    if (!category) return;
    fetch(`http://127.0.0.1:8000/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: category.name }),
    });
  };

  if (!category) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Category</h1>
      <input value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
