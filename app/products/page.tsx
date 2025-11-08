"use client"; // cần nếu dùng useState/useEffect

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - {p.price.toLocaleString()} VND
          </li>
        ))}
      </ul>
    </div>
  );
}
