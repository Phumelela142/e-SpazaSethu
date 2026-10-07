import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const SHOP_NAME_KEY = "shopName";

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();

    // Shop settings
    const [shopName, setShopName] = useState("");

    // Password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password feedback
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Load shop name from localStorage
    useEffect(() => {
        const savedShopName = localStorage.getItem(SHOP_NAME_KEY);

        if (savedShopName) {
            setShopName(savedShopName);
        }
    }, []);

    // Save shop name to localStorage
    const handleShopNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        setShopName(value);
        localStorage.setItem(SHOP_NAME_KEY, value);
    };

    // Open password modal
    const openPasswordModal = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setPasswordSuccess("");
        setShowPasswordModal(true);
    };

    // Close password modal
    const closePasswordModal = () => {
        if (!isChangingPassword) {
            setShowPasswordModal(false);
        }
    };

    // Change password
    const handleChangePassword = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from your current password."
            );
            return;
        }

        if (!user?.id) {
            setPasswordError("Unable to identify the current user.");
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch(
                `/api/v1/users/${user.id}/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to change password."
                );
            }

            setPasswordSuccess("Password changed successfully.");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            if (error instanceof Error) {
                setPasswordError(error.message);
            } else {
                setPasswordError("An unexpected error occurred.");
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Logout
    const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (confirmed) {
            logout();
        }
    };

    // Determine whether the user is an administrator
    const isAdmin =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "administrator";


};

export default SettingsPage;