import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import HashLoader from "react-spinners/HashLoader";

const CallResult = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    
    // Extract URL parameters
    const userId = params.get("userId");
    const fan = params.get("fan");
    const name = params.get("name");
    
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId || !fan || !name) {
            setError("Missing required user parameters");
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/callresult`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId, fan, name })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch user data");
                }

                setUserData(data.responseData?.user || data.user);
            } catch (err) {
                setError(err.message);
                toast.error("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, fan, name]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <HashLoader color="#3b82f6" size={80} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error: </strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        <span className="text-indigo-600">MyFayda</span> Electronic Know Your Customer service
                    </h1>
                    <p className="text-xl text-gray-600">
                        Complete user data retrieved from our secure API
                    </p>
                </div>

                {/* User Profile Card */}
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Photo on Top */}
                    <div className="flex justify-center py-8 bg-indigo-50">
                        {userData?.photo ? (
                            <img 
                                src={userData.photo} 
                                alt={`${name}'s profile`}
                                className="rounded-full h-48 w-48 object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="rounded-full h-48 w-48 bg-indigo-100 flex items-center justify-center text-indigo-500 text-5xl font-bold">
                                {name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User Details */}
                    <div className="p-8">
                        {/* Name and FAN */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                {userData?.firstName || ''} 
                                {userData?.middleName ? ` ${userData.middleName}` : ''} 
                                {userData?.lastName ? ` ${userData.lastName}` : ''}
                            </h2>
                            <p className="text-indigo-600 text-lg mt-2">
                                FAN: {fan}
                            </p>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info Column */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                    Personal Information
                                </h3>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Full Name:</span>
                                        <span className="font-medium">{name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">First Name:</span>
                                        <span className="font-medium">{userData?.firstName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Middle Name:</span>
                                        <span className="font-medium">{userData?.middleName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Name:</span>
                                        <span className="font-medium">{userData?.lastName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{userData?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone Number:</span>
                                        <span className="font-medium">{userData?.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium">{userData?.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date of Birth:</span>
                                        <span className="font-medium">{userData?.dateOfBirth || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nationality:</span>
                                        <span className="font-medium">{userData?.nationality || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address Info Column */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                    Address Information
                                </h3>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Region:</span>
                                        <span className="font-medium">{userData?.region || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Zone:</span>
                                        <span className="font-medium">{userData?.zone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Woreda:</span>
                                        <span className="font-medium">{userData?.woreda || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-6">
                                    Security Information
                                </h3>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Password:</span>
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {userData?.password ? '•••••••• (hashed)' : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">
                                        <p>The password is securely hashed using bcrypt</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Developer Note */}
                        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Developer Note:</h4>
                            <p className="text-sm text-blue-700">
                                This is a demonstration of the complete user data you can access through our API. 
                                All sensitive information like passwords are securely hashed before storage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallResult;