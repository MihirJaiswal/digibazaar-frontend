"use client";

import Image from "next/image";

interface FooterProps {
  storeLogo: string;
  storeName: string;
  footerText?: string;
  footerBarColor: string;
  borderColor: string;
}

const FooterSection: React.FC<FooterProps> = ({ 
  storeLogo, 
  storeName, 
  footerText,
  footerBarColor,
  borderColor

}) => {
  return (
    <footer className="py-8 border-t"style={{
      backgroundColor: footerBarColor,
      borderColor: borderColor,
    }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
          {/* Brand Section */}
          <div className="flex items-center space-x-3">
            {storeLogo ? (
              <Image
                src={storeLogo}
                alt={storeName}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="h-9 w-9 flex items-center justify-center rounded-full">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-center">{storeName}</span>
          </div>

          {/* Footer Text (Optional) */}
          {footerText && (
            <div className="text-sm flex items-center justify-center md:justify-start">
              {footerText}
            </div>
          )}

          {/* Right Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between  space-y-4 md:space-y-0">
            {/* Social Icons */}
            <div className="flex space-x-5 md:order-2">
              <a href="#" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.28 4.28 0 001.88-2.37 8.61 8.61 0 01-2.73 1.05 4.26 4.26 0 00-7.26 3.88 12.08 12.08 0 01-8.77-4.44 4.26 4.26 0 001.32 5.68 4.23 4.23 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.17 4.27 4.27 0 01-1.92.07 4.26 4.26 0 003.98 2.96A8.55 8.55 0 012 19.54a12.06 12.06 0 006.52 1.91c7.83 0 12.12-6.49 12.12-12.12 0-.18-.01-.35-.02-.53A8.68 8.68 0 0024 5.55a8.44 8.44 0 01-2.54.7z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34V22C18.34 21.13 22 16.99 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6.01 4.85.07 1.17.05 1.97.24 2.42.41a4.8 4.8 0 011.76 1.16 4.8 4.8 0 011.16 1.76c.17.45.36 1.25.41 2.42.06 1.25.07 1.65.07 4.85s-.01 3.6-.07 4.85c-.05 1.17-.24 1.97-.41 2.42a4.8 4.8 0 01-1.16 1.76 4.8 4.8 0 01-1.76 1.16c-.45.17-1.25.36-2.42.41-1.25.06-1.65.07-4.85.07s-3.6-.01-4.85-.07c-1.17-.05-1.97-.24-2.42-.41a4.8 4.8 0 01-1.76-1.16 4.8 4.8 0 01-1.16-1.76c-.17-.45-.36-1.25-.41-2.42C2.21 15.6 2.2 15.2 2.2 12s.01-3.6.07-4.85c.05-1.17.24-1.97.41-2.42A4.8 4.8 0 013.94 3.97a4.8 4.8 0 011.76-1.16c.45-.17 1.25-.36 2.42-.41C8.4 2.21 8.8 2.2 12 2.2m0-2.2C8.74 0 8.33.01 7.05.07 5.78.12 4.8.33 4 .65a6.53 6.53 0 00-2.36 1.54A6.53 6.53 0 00.65 4c-.32.8-.53 1.78-.58 3.05C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.05 1.27.26 2.25.58 3.05.32.8.76 1.5 1.54 2.36.86.78 1.56 1.22 2.36 1.54.8.32 1.78.53 3.05.58 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.05 2.25-.26 3.05-.58.8-.32 1.5-.76 2.36-1.54.78-.86 1.22-1.56 1.54-2.36.32-.8.53-1.78.58-3.05.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.05-1.27-.26-2.25-.58-3.05-.32-.8-.76-1.5-1.54-2.36A6.53 6.53 0 0019.95.65c-.8-.32-1.78-.53-3.05-.58C15.67.01 15.26 0 12 0z" />
                  <path d="M12 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8z" />
                  <circle cx="18.4" cy="5.6" r="1.4" />
                </svg>
              </a>
            </div>
            
            {/* Copyright */}
            <p className="text-sm md:order-1">
              © {new Date().getFullYear()} {storeName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;