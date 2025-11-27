import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, Linkedin, Facebook, Youtube, Instagram, Twitter, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Left Column - Brand & Newsletter */}
          <div className="lg:col-span-1 space-y-6">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Factory className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold">
                AIMS
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-base">
              Industrial Asset Management - <span className="text-[#1e3a5f]">Transform your P&ID workflows</span>
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Get the latest updates on industrial automation and asset management delivered to your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00897B]"
                />
                <button className="w-full px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-lg text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>

            {/* Get Started CTA */}
            <div className="p-4 bg-[#1e3a5f]/20 rounded-lg border border-[#1e3a5f]/30">
              <p className="text-sm font-medium mb-1">Ready to start?</p>
              <a
                href="/#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.location.href = '/#pricing';
                  }
                }}
                className="text-sm text-[#1e3a5f] hover:underline cursor-pointer"
              >
                View pricing plans →
              </a>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">AIMS Inc.</p>
                <p>175 Varick Street</p>
                <p>New York, NY 10014, US</p>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Solutions</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">P&ID Processing</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Tag Extraction</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Tag Sheet Generation</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Project Management →</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/#how-it-works" className="text-base hover:text-[#1e3a5f] transition-colors">How It Works</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Industry Standards</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Case Studies</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Blog</a></li>
              <li><Link to="/faq" className="text-base hover:text-[#1e3a5f] transition-colors">FAQs</Link></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Industries Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Industries</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Oil & Gas</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Chemical Processing</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Power Generation</a></li>
              <li><a href="#" className="text-base hover:text-[#1e3a5f] transition-colors">Manufacturing</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about-us" className="text-base hover:text-[#00897B] transition-colors">About Us</Link></li>
              <li><a href="#" className="text-base hover:text-[#00897B] transition-colors">Careers →</a></li>
              <li><Link to="/privacy-policy" className="text-base hover:text-[#00897B] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-base hover:text-[#00897B] transition-colors">Terms & Conditions</Link></li>
              <li><a href="tel:+18553217800" className="text-base hover:text-[#00897B] transition-colors">+1 (855) 321-7800</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-400">&copy; 2024 AIMS Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
