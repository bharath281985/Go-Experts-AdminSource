import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface ResetPasswordProps {
    token: string;
    onResetSuccess: () => void;
}

export function ResetPassword({ token, onResetSuccess }: ResetPasswordProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.put(`/auth/reset-password/${token}`, { password });
            if (response.data.success) {
                setIsSuccess(true);
                toast.success('Admin password updated successfully!');
                setTimeout(() => {
                    onResetSuccess();
                }, 3000);
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
             {/* Background Decor */}
             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F24C20]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#044071]/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#1a1a1a] border border-[#262626] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-16 h-16 bg-gradient-to-br from-[#044071] to-[#033056] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#044071]/20"
                        >
                            <ShieldAlert className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2 underline decoration-[#F24C20]">Secure Reset</h1>
                        <p className="text-gray-400 text-sm">Create a strong new password for your admin account</p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        required
                                        className="w-full bg-[#262626] border border-[#333333] focus:border-[#F24C20] text-white rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-1 focus:ring-[#F24C20]/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        className="w-full bg-[#262626] border border-[#333333] focus:border-[#F24C20] text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#F24C20]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#F24C20] hover:bg-[#d43a12] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F24C20]/10 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Admin Password'
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Your security credentials have been refreshed. You will be redirected to login shortly.
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <button 
                        onClick={() => onResetSuccess()}
                        className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
