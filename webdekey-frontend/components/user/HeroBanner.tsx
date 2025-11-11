// components/HeroBanner.tsx
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative bg-black text-white pt-16"> {/* Thêm pt-16 */}
      <Image
        src="/banner/banner.jpg"
        alt="DEKEY Power Pioneer"
        fill
        className="object-cover brightness-50"
        priority
      />
      <div className="relative max-w-screen-2xl mx-auto px-4 py-48 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider">
          DEKEY | POWER PIONEER
        </h1>
        <p className="text-2xl md:text-4xl mb-4">急速充電という、新常識</p>
        <p className="text-lg md:text-2xl opacity-90">スマホ、PC、タブレットまで</p>
      </div>
    </section>
  );
}