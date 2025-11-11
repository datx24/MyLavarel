// components/Footer.tsx
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#202121] text-white py-16">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-bold text-lg mb-4">THÔNG TIN DEKEY VIETNAM</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Giới thiệu công ty</li>
              <li>Tuyển dụng</li>
              <li>Liên hệ - góp ý</li>
              <li>Bản quyền doanh nghiệp</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Giao hàng - lắp đặt</li>
              <li>Bảo hành - đổi trả</li>
              <li>Phương thức thanh toán</li>
              <li>Hóa đơn điện tử</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">TỔNG ĐÀI HỖ TRỢ</h3>
            <p className="text-3xl font-bold text-orange-500">0938.282868</p>
            <p className="text-sm text-gray-400">(07:30 - 17:30)</p>
            <p className="text-sm text-gray-400 mt-2">Email: info@dekey.com.vn</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">THEO DÕI CHÚNG TÔI</h3>
            <div className="flex gap-4">
              <Image src="/logo/facebook.png" alt="FB" width={40} height={40} />
              <Image src="/logo/youtube.png" alt="YT" width={40} height={40} />
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-xs text-gray-500">
          © 2018-2025 © DEKEY VIETNAM INC OR ITS AFFILIATES. Công ty TNHH DEKEY VIETNAM. Địa chỉ: 123 Nguyễn Văn Linh, Q. Hải Châu, TP. Đà Nẵng.
          <br />
          Hotline: 0236.825556. Email: info@dekey.com.vn. GPĐKKD: 0402134567 do Sở KH&ĐT TP Đà Nẵng cấp ngày 20/08/2018.
        </div>
      </div>
    </footer>
  );
}