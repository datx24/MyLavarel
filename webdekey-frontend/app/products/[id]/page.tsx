"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Product { id: number; name: string; price: number; }

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  const handleUpdate = () => {
    if (!product) return;
    fetch(`http://127.0.0.1:8000/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: product.name, price: product.price }),
    });
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Product</h1>
      <input value={product.name} onChange={e => setProduct({...product, name: e.target.value})} />
      <input type="number" value={product.price} onChange={e => setProduct({...product, price: Number(e.target.value)})} />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
