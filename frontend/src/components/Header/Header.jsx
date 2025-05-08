import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { BiMenu } from "react-icons/bi";
import logo from "../../assets/imgVid/MyFayda.png"; 
//import header_bkg from "../../assets/imgVid/header_bkg.mp4";
//import header_bkg_mob from "../../assets/imgVid/header_bkg.mp4";
import { NavLink, Link } from 'react-router-dom'; 

const navLinks = [
  
  { path: '/', display: '' },
  { path: '/home', display: 'Home' },
  { path: '/demo', display: 'Documentation' }, 
];

const Header = () => {

  const header_bkg = "https://res.cloudinary.com/dnsnj1z1g/video/upload/v1746504883/header_bkg_fntkk3.mp4";
  const header_bkg_mob = "https://res.cloudinary.com/dnsnj1z1g/video/upload/v1746504883/header_bkg_fntkk3.mp4";

  const headerRef = useRef(null);
  const videoRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.classList.toggle('show_menu');
    }
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = isMobile ? header_bkg_mob : header_bkg;
      videoRef.current.load();
    }
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const handleScroll = () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add('sticky_header');
      } else {
        headerRef.current.classList.remove('sticky_header');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header flex items-center" ref={headerRef}>
      /* Background Video */
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="container relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div>
          <img
            src={logo}
            alt="Logo"
            loading="lazy"
            className="w-auto h-auto" // Increased size
          />
            </div>

            {/* Menu */}
          <div className="navigation" ref={menuRef}>
            <ul className="menu flex items-center gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? "text-primaryColor text-[16px] leading-7 font-[600]"
                        : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                    }
                    onClick={() => isMobile && toggleMenu()}
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - CTA and Menu Icon */}
          <div className="flex items-center gap-4">
            <Link to="/demo">
              <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]">
                Demo
              </button>
            </Link>

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
