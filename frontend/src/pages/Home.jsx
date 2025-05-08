import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import Loader from "../components/Loader/Loading";
import Error from "../components/Error/Error";
//import hero_bkg from "../assets/imgVid/hero_bkg.mp4";
//import hero_bkg_mob from "../assets/imgVid/hero_bkg_mob.mp4";
import { motion } from "framer-motion";



const Home = () => {

  // Video Backgrounds
  const hero_bkg = "https://res.cloudinary.com/dnsnj1z1g/video/upload/v1746505036/hero_bkg_big_w2fmya.mp4"; 
  const hero_bkg_mob = "https://res.cloudinary.com/dnsnj1z1g/video/upload/v1746504886/hero_bkg_mob_ub12vk.mp4";
  
  //const signupUrl = `/register?apiKey=${process.env.REACT_APP_DEFAULT_API_KEY}&redirect_uri=${encodeURIComponent(process.env.REACT_APP_REDIRECT_URI )}`;
  //const signupUrl = `/register?apiKey=${import.meta.env.VITE_APP_DEFAULT_API_KEY}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_APP_REDIRECT_URI)}`;

  /*console.log('Navigating with:', {
    apiKey: import.meta.env.VITE_APP_DEFAULT_API_KEY,
    uri: import.meta.env.VITE_APP_REDIRECT_URI
  });
  console.log('All ENV Vars:', import.meta.env);
  */
 


  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState([
    { value: 0, target: 20, label: "Clients" },
    { value: 0, target: 700, label: "Users" },
    { value: 0, target: 900, label: "Verifications" }
  ]);

  // Animation function
  const animateCounters = () => {
    setCounters(prevCounters => 
      prevCounters.map(counter => ({
        ...counter,
        value: 0 // Reset to 0 before animating
      }))
    );

    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounters(prevCounters => 
        prevCounters.map(counter => ({
          ...counter,
          value: Math.floor(progress * counter.target)
        }))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Set up interval for auto-animation
  useEffect(() => {
    animateCounters(); // Initial animation
    const interval = setInterval(animateCounters, 5000); // Repeat every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const handleVideoLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = isMobile ? hero_bkg_mob : hero_bkg;
      videoRef.current.load();
    }
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-black">
        {loading && <Loader />}

        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay 
          loop
          playsInline
          onLoadedData={handleVideoLoad}
        />

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex items-center">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-[100px] items-center justify-between">
              {/* Hero Text */}
              <div className="text-white max-w-3xl">
                <h1 className="text-[36px] leading-[46px] font-extrabold md:text-[60px] md:leading-[70px] text-headingColor drop-shadow-lg">
                  Empowering Digital Ethiopia 2025  with Trusted Digital Identity
                </h1>
                <p className="text_para text-justify mt-4">
                  Verify identities securely with our national eKYC platform, enabling trusted digital services and growth. 
                  Our platform ensures safe interactions, fostering a secure and accessible digital ecosystem. 
                  Using advanced technology, we aim to bridge innovation and inclusivity, driving Ethiopia toward a future 
                  where digital identity supports real progress.
                </p>

                <div className="mt-6">
                  <Link
                    to={`http://localhost:5173/developerportal?apiKey=${import.meta.env.VITE_APP_DEFAULT_API_KEY}&login_url=${encodeURIComponent(import.meta.env.VITE_APP_LOGIN_URL)}`}
                    className="inline-flex items-center gap-4 bg-primaryColor text-white py-3 px-6 rounded-full font-semibold shadow-md hover:bg-opacity-90 transition"
                  >
                    Get Started
                    <BsArrowRight />
                  </Link>

                </div>

                {/* Counter Stats */}
                <div className="mt-5"> 
                  <motion.div 
                    className="flex  items-start gap-8 md:gap-12 lg:gap-16 flex-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {counters.map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex flex-col items-center min-w-[100px]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <h2 className="text-[36px] lg:text-[44px] leading-[56px] font-bold text-headingColor">
                          {item.value}+
                        </h2>
                        <motion.span
                          className="w-[80px] h-2 rounded-full block mt-[-14px]"
                          style={{ backgroundColor: "#fde68a" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                        />
                        <motion.p 
                          className="text_para mt-2 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                        >
                          {item.label}
                        </motion.p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
                </div>
              </div>
              
            </div>
            
          </div> 
          
      </section>
    </>
  );
};

export default Home;
