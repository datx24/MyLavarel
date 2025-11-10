"use client";
import { useEffect, useState } from "react";

interface Product { id: number; name: string; price: number; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);

  const fetchProducts = () => {
    fetch("http://127.0.0.1:8000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = () => {
    fetch("http://127.0.0.1:8000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    }).then(() => fetchProducts());
  };

  const handleDelete = (id: number) => {
    fetch(`http://127.0.0.1:8000/api/products/${id}`, { method: "DELETE" })
      .then(() => fetchProducts());
  };

  return (
    <div>
      <h1>Products CRUD</h1>

      <div>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
        <button onClick={handleAdd}>Add Product</button>
      </div>

      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} - {p.price} VND
            <button onClick={() => handleDelete(p.id)} style={{marginLeft:10}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
