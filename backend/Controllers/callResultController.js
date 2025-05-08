import { getModels } from '../models/index.js';

export const getUserData = async (req, res) => {
    const { FaydaUserData } = getModels();
    try {
        const { userId, fan, name } = req.body;

        if (!userId || !fan || !name) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters",
                code: "MISSING_PARAMETERS"
            });
        }

        // Find user in database with only the required fields
        const user = await FaydaUserData.findOne(
            { 
                _id: userId
            },
            {
                photo: 1,
                name: 1,
                fan: 1,
                email: 1,
                firstName: 1,
                middleName: 1,
                lastName: 1,
                region: 1,
                dateOfBirth: 1,
                zone: 1,
                gender: 1,
                woreda: 1,
                nationality: 1,
                phoneNumber: 1,
                password: 1, // Still including to show it's hashed
                _id: 0 // Exclude MongoDB _id field
            }
        ).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Structure the response with only necessary data
        const responseData = {
            photo: user.photo || null,
            name: user.name,
            fan: user.fan,
            email: user.email || null,
            firstName: user.firstName || null,
            middleName: user.middleName || null,
            lastName: user.lastName || null,
            region: user.region || null,
            dateOfBirth: user.dateOfBirth || null,
            zone: user.zone || null,
            gender: user.gender || null,
            woreda: user.woreda || null,
            nationality: user.nationality || null,
            phoneNumber: user.phoneNumber || null,
            password: user.password ? '•••••••• (hashed)' : null
        };

        res.status(200).json({
            success: true,
            message: "User data retrieved successfully",
            code: "USER_DATA_RETRIEVED",
            responseData: {
                user: responseData
            }
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "SERVER_ERROR",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
