import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiNike, SiAdidas, SiPuma, SiZara } from "react-icons/si";
import { GiSleevelessTop } from "react-icons/gi";
import { PiPantsFill } from "react-icons/pi";
import { Link } from "react-router-dom";

const categoriesWithIcon = [
  { id: "men", label: "Men"},
  { id: "women", label: "Women"},
  { id: "unisex", label: "Unisex"},
  { id: "accessories", label: "Accessories"},
  { id: "footwear", label: "Footwear"},
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: SiNike },
  { id: "adidas", label: "Adidas", icon: SiAdidas },
  { id: "puma", label: "Puma", icon: SiPuma },
  { id: "levi", label: "Levi's", icon: PiPantsFill },
  { id: "zara", label: "Zara", icon: SiZara },
  { id: "h&m", label: "H&M", icon: GiSleevelessTop },
];

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-300">
              We're your premier destination for fashion and lifestyle, offering the best in clothing,
              accessories, and footwear for men, women, and kids.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {categoriesWithIcon.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/shop/listing?category=${category.id}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Brands */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Brands</h3>
            <ul className="space-y-2">
              {brandsWithIcon.map((brand) => (
                <li key={brand.id}>
                  <Link 
                    to={`/shop/listing?brand=${brand.id}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {brand.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="mb-4">
              <p className="text-gray-300">Email: info@FineClothing.com</p>
              <p className="text-gray-300">Phone: (123) 456-7890</p>
            </div>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FineClothing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;