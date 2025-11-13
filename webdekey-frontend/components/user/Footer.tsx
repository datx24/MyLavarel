// components/Footer.tsx
import { Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-[#202121] text-white py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl md:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              THÔNG TIN DEKEY VIETNAM
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 opacity-70" />
                Giới thiệu công ty
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 opacity-70" />
                Tuyển dụng
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <Phone className="w-4 h-4 opacity-70" />
                Liên hệ - góp ý
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 opacity-70" />
                Bản quyền doanh nghiệp
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl md:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              HỖ TRỢ KHÁCH HÀNG
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 opacity-70" />
                Giao hàng - lắp đặt
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 opacity-70" />
                Bảo hành - đổi trả
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <Phone className="w-4 h-4 opacity-70" />
                Phương thức thanh toán
              </li>
              <li className="flex items-center gap-2 hover:text-orange-400 transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 opacity-70" />
                Hóa đơn điện tử
              </li>
            </ul>
          </div>

          {/* Hotline */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-xl md:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              TỔNG ĐÀI HỖ TRỢ
            </h3>
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl p-4 border border-orange-500/20">
              <p className="text-2xl md:text-3xl font-bold text-orange-400 flex items-center gap-2 mb-1">
                <Phone className="w-6 h-6" />
                0938.282868
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                (07:30 - 17:30)
              </p>
              <p className="text-sm text-gray-300 mt-2 flex items-center gap-1">
                <Mail className="w-4 h-4 opacity-70" />
                info@dekey.com.vn
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-xl md:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              THEO DÕI CHÚNG TÔI
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 opacity-80 group-hover:opacity-100">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 opacity-80 group-hover:opacity-100">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Kết nối với chúng tôi để cập nhật tin tức mới nhất!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-700 text-center text-xs text-gray-400 leading-relaxed">
          <p>
            © 2018-2025 © DEKEY VIETNAM INC OR ITS AFFILIATES. Công ty TNHH DEKEY VIETNAM.
          </p>
          <p className="mt-2">
            Địa chỉ: 123 Nguyễn Văn Linh, Q. Hải Châu, TP. Đà Nẵng.
          </p>
          <p className="mt-2 flex flex-col sm:flex-row justify-center items-center gap-2 text-xs">
            <span>Hotline: 0236.825556</span>
            <span>•</span>
            <span>Email: info@dekey.com.vn</span>
            <span>•</span>
            <span>GPĐKKD: 0402134567 do Sở KH&ĐT TP Đà Nẵng cấp ngày 20/08/2018.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}