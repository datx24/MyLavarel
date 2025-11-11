// components/Sidebar.tsx
const categories = [
  { name: "MIẾNG DÁN", count: 36 },
  { name: "PHỤ KIỆN", count: 85 },
  { name: "ÂM THANH", count: 36 },
  { name: "VĂN PHÒNG", count: 28 },
  { name: "GIA DỤNG", count: 31 },
  { name: "KHUYẾN MÃI", count: 188 },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <h2 className="text-xl font-bold mb-6 text-gray-800">SẢN PHẨM NỔI BẬT</h2>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg:bg-white bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-2">Xem {cat.count} Sản Phẩm</p>
          </div>
        ))}
      </div>
    </aside>
  );
}