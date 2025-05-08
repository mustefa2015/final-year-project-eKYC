import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import zxcvbn from 'zxcvbn';
import { throttle } from 'lodash';
import { Eye, EyeOff } from 'lucide-react'; 
import HashLoader from "react-spinners/HashLoader";
//import signupVideo from "../assets/imgVid/signup2.mp4";
 
 

const Signup = () => {

    // Video Backgrounds
    const signupVideo = "https://res.cloudinary.com/dnsnj1z1g/video/upload/v1746504907/signup2_ozqny6.mp4";

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const apiKey = params.get("apiKey") || "";
    const loginUrl = params.get("login_url") || "";

    console.log("Extracted API Key:", apiKey);
    console.log("Extracted loginUrl:", loginUrl);

    
    const handleVideoLoad = () => {
        setLoading(false);
    };

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fan: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: ""
    });
    const [sessionId, setSessionId] = useState(null); // Added for Fayda verification
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [otpCountdown, setOtpCountdown] = useState(0); 
    const navigate = useNavigate();
    const otpInputRef = useRef(null);
    const videoRef = useRef(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleVideoError = () => {
        setVideoError(true);
        setLoading(false);
    };
 

    // Fallback timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!videoLoaded && !videoError) {
                setShowFallback(true);
            }
        }, 3000); // Show fallback after 3 seconds

        return () => clearTimeout(timer);
    }, [videoLoaded, videoError]);

    // Video component with optimizations
    const renderVideoSection = () => (
        <div className="lg:bg-primaryColor order-2 lg:order-1 relative">
            {(!videoLoaded || videoError || showFallback) && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                        <div className="w-16 h-16 mx-auto mb-2 border-4 border-primaryColor border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600">Loading signup experience...</p>
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                className={`w-full h-full max-h-[400px] lg:max-h-none object-cover ${
                    (!videoLoaded || videoError) ? 'opacity-0' : 'opacity-100'
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlayThrough={handleVideoLoad}
                onError={handleVideoError}
                onWaiting={() => setLoading(true)}
            >
                <source src={signupVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );

    useEffect(() => {
        if (step === 2 && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    useEffect(() => {
        let timer;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        } else if (otpCountdown === 0 && step === 2) {
            toast.error("OTP has expired. Please try again.");
            setStep(1); // Return user to FAN form after expiry
        }
        return () => clearTimeout(timer);
    }, [otpCountdown, step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleOtpChange = (e) => {
        const { value } = e.target;
        if (/^\d{0,6}$/.test(value)) {
            setFormData(prev => ({ ...prev, otp: value }));
            if (value.length === 6) {
                handleOtpSubmit(e);
            }
        }
    };

    const handlePasswordChange = throttle((e) => {
        const val = e.target.value;
        setPassword(val);
        setFormData(prev => ({ ...prev, password: val }));
        const result = zxcvbn(val);
        setStrength(result.score);
    }, 200);
     

    const validateStepOne = () => {
        const errs = {};
        if (!/^\d{16}$/.test(formData.fan)) {
            errs.fan = "FAN must be a 16-digit number";
        }
        if (!formData.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errs.email = 'Please enter a valid email';
        }
        if (!formData.password || formData.password.length < 8) {
            errs.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(formData.password)) {
            errs.password = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(formData.password)) {
            errs.password = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
            errs.password = "Password must contain at least one special character";
        }
        if (formData.password !== formData.confirmPassword) {
            errs.confirmPassword = "Passwords do not match";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleStepOneSubmit = async (e) => {
        e.preventDefault();
        if (!validateStepOne()) return;

        setLoading(true);
        try {
             
            const res = await fetch(`${BASE_URL}/fayda/sendOtp`, {
              method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": apiKey            // the developer’s key
                },
                body: JSON.stringify({
                    fan: formData.fan,
                    email: formData.email,
                    password: formData.password
                })
            });
        
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP");

            toast.success("OTP sent to your registered mobile number!");
            setSessionId(data.sessionId); // Store sessionId for verify step
            setOtpCountdown(180);
            setStep(2);
        } catch (err) {
            toast.error(err.message || "An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
    
        if (!/^\d{6}$/.test(formData.otp)) {
            setErrors({ otp: "OTP must be a 6-digit code" });
            return;
        }
    
        setLoading(true);
    
        try {
            const res = await fetch(`${BASE_URL}/fayda/verifyOtp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                },
                body: JSON.stringify({
                    sessionId,
                    otp: formData.otp,
                }),
            });
    
            const response = await res.json();
            if (!res.ok) throw new Error(response.message || "OTP verification failed");
    
            // Extract data from the nested response structure
            const userData = response.responseData?.data || {};
            const { userId, FAN, name } = userData;
    
            if (!userId || !FAN || !name) {
                throw new Error("User data missing in response");
            }
    
            toast.success(
                <div>
                    <p className="font-semibold">Registration Successful!</p>
                    <p className="text-sm">You'll be redirected shortly</p>
                </div>,
                { autoClose: 2000 }
            );
    
            setTimeout(() => {
                if (loginUrl) {
                    const callbackUrl = new URL(loginUrl);
                    callbackUrl.searchParams.set("userId", userId);
                    callbackUrl.searchParams.set("fan", FAN);
                    callbackUrl.searchParams.set("name", name);
                    console.log("Redirecting to:", callbackUrl.toString());
                    window.location.href = callbackUrl.toString();
                } else {
                    console.error("Missing redirect URL");
                    // Fallback redirect or error handling
                    navigate('/'); // Redirect to home or appropriate page
                }
            }, 2000);
    
        } catch (err) {
            toast.error(err.message || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };
    
    

    /*
    // 🔒 Resend disabled as per instruction — for future use
    const handleResendOtp = async () => {
        if (otpCountdown > 0) return;

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/fayda/sendOtp`, {
                method: "POST",
                headers: {
                    fan: formData.fan,
                    email: formData.email,
                    password: formData.password
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

            toast.success("New OTP sent successfully!");
            setOtpCountdown(180);
        } catch (err) {
            toast.error(err.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };
    */

    return (
        <div className="max-w-[1170px] mx-auto">
            {/* Changed grid layout for mobile */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="lg:bg-primaryColor order-2 lg:order-1">
                    <video
                        ref={videoRef} // Using proper ref
                        className="w-full h-full max-h-[400px] lg:max-h-none object-cover"
                        autoPlay  
                        muted
                        playsInline
                        onLoadedData={handleVideoLoad}
                    >
                        <source src={signupVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Form Section - comes first on mobile */}
                <div className="p-8 order-1 lg:order-2">
                    <h2 className="text-2xl font-bold mb-6 text-center text-headingColor">
                        {step === 1 ? "Create Your Account" : "Verify Your Identity"}
                    </h2>
                    
                    {/* Progress Indicator */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                step === 1 ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                1
                            </div>
                            <div className="w-16 h-1 bg-gray-200 mx-2"></div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                step === 2 ? 'bg-primaryColor text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                2
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Step {step} of 2
                        </p>
                    </div>
                    
                    {step === 1 ? (
                        <form onSubmit={handleStepOneSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="fan" className="block text-sm font-medium text-gray-700 mb-1">
                                    FAN (Fayda Alias Number)
                                </label>
                                <input
                                    type="text"
                                    id="fan"
                                    name="fan"
                                    placeholder="16-digit FAN"
                                    value={formData.fan}
                                    onChange={handleChange}
                                    maxLength={16}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent ${
                                        errors.fan ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.fan && <p className="mt-1 text-sm text-red-600">{errors.fan}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent ${
                                        errors.email ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                    />
                                    <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                    </button>
                                </div>
                                
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                                
                                {/* Password strength meter */}
                                {password && (
                                    <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                            strength === 0 ? 'bg-red-500 w-1/4' :
                                            strength === 1 ? 'bg-orange-500 w-1/2' :
                                            strength === 2 ? 'bg-yellow-500 w-3/4' :
                                            'bg-green-500 w-full'
                                            }`}
                                        />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                        strength === 0 ? 'text-red-600' :
                                        strength === 1 ? 'text-orange-600' :
                                        strength === 2 ? 'text-yellow-600' :
                                        'text-green-600'
                                        }`}>
                                        {['Too weak', 'Weak', 'Good', 'Strong'][strength] || ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Must be at least 8 characters with uppercase, number, and special character
                                    </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-transparent ${
                                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 rounded-lg transition ${
                                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primaryColor hover:bg-primaryColorDark text-white'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <HashLoader size={20} color="#fff" className="mr-2" />
                                        Processing...
                                    </span>
                                ) : (
                                    "Send OTP"
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Code
                                </label>
                                <input
                                    ref={otpInputRef}
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    placeholder="6-digit OTP"
                                    value={formData.otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                    className={`w-full px-4 py-2 border rounded-lg text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        errors.otp ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
                                <div className="mt-2 text-sm text-gray-600">
                                    {otpCountdown > 0 ? (
                                        `OTP expires in ${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, '0')}`
                                    ) : (
                                        <button
                                            type="button" 
                                            disabled={loading || otpCountdown > 0}
                                            className="text-primaryColor hover:text-primaryColorDark font-medium"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 rounded-lg transition ${
                                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <HashLoader size={20} color="#fff" className="mr-2" />
                                        Verifying...
                                    </span>
                                ) : (
                                    "Verify & Continue"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center text-sm text-gray-600">
                        {step === 1 ? (
                            <p>
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-primaryColor hover:text-primaryColorDark font-medium"
                                >
                                    Sign in
                                </button>
                            </p>
                        ) : (
                            <button
                                onClick={() => setStep(1)}
                                className="text-primaryColor hover:text-primaryColorDark font-medium"
                            >
                                Back to previous step
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
