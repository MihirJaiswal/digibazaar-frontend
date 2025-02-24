export default function Footer() {
    return (
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-4 md:mb-0">
              <h3 className="text-lg font-bold mb-2">FiverrClone</h3>
              <p className="text-sm text-gray-600">
                A modern freelancing platform for professionals worldwide.
              </p>
            </div>
            <div className="w-full md:w-1/4 mb-4 md:mb-0">
              <h4 className="text-md font-bold mb-2">Categories</h4>
              <ul className="text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Graphics & Design</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Digital Marketing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Writing & Translation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Video & Animation</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-4 md:mb-0">
              <h4 className="text-md font-bold mb-2">About</h4>
              <ul className="text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Press & News</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Partnerships</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="w-full md:w-1/4">
              <h4 className="text-md font-bold mb-2">Support</h4>
              <ul className="text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Help & Support</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Trust & Safety</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Selling on FiverrClone</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Buying on FiverrClone</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} FiverrClone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }