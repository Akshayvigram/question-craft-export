import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Vinathaal Icon */}
                <div
                  className="rounded-lg flex items-center justify-center overflow-hidden w-16 h-16 sm:w-20 sm:h-20"
                >
                  <img
                    src="/vinathaal_icon.png"
                    alt="Vinathaal Logo"
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* Vinathaal Heading Logo */}
                <div className="flex items-center h-12 sm:h-16">
                  <img
                    src="vinathaal-heading-white.png"
                    alt="Vinathaal Heading"
                    className="object-contain h-full"
                  />
                </div>
              </div>
            </div>

            <p className="text-blue-200 leading-relaxed max-w-md text-sm sm:text-base">
              Elevating minds, shaping futures through excellence in education and transformative learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-8 md:mt-0">
            <h4 className="text-accent font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-blue-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/generator" className="text-blue-200 hover:text-white transition-colors">
                  Generator
                </Link>
              </li>
              <li>
                <Link to="/mcq" className="text-blue-200 hover:text-white transition-colors">
                  MCQ Generator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-blue-200 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="mt-8 md:mt-0">
            <h4 className="text-accent font-semibold mb-4 text-lg">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-blue-200">azhizensolutions@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-accent mt-1" />
                <span className="text-blue-200 text-xs sm:text-sm">
                  R-NO:309, Mercury Block<br />
                  KSRCE, Tiruchengode, Namakkal, Tamil Nadu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-800 mt-8 sm:mt-12 pt-6 text-center">
          <p className="text-blue-200 text-xs sm:text-sm">
            © 2025 Vinathaal Question Paper Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;