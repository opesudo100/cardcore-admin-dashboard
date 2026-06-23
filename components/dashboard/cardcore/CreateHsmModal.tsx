"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HsmService } from '@/lib/services/hsmService';
import { GeneralService } from '@/lib/services/generalService';
import { Input } from '@/components/ui/Input';
import { LoadingContent } from '@/components/ui/LoadingSpinner';
import Toggler from '@/components/ui/Toggler';
import type { CreateHsmDto } from '@/types/api';

interface CreateHsmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateHsmModal = ({ isOpen, onClose, onSuccess }: CreateHsmModalProps) => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [form, setForm] = useState<{
        code: string;
        ip: string;
        port: string;
        isPrimary: boolean;
        status: 'active' | 'inactive' | 'maintenance' | 'error';
    }>({
        code: '',
        ip: '',
        port: '',
        isPrimary: false,
        status: 'active',
    });
    const [formErrors, setFormErrors] = useState({
        code: '',
        ip: '',
        port: '',
    });

    const handleChange = (name: 'code' | 'ip' | 'port', value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrorMessage('');

        let errors = { ...formErrors };
        if (value === '') {
            errors[name as keyof typeof errors] = 'Required*';
        } else if (name === 'ip' && !GeneralService.validateIpAddress(value)) {
            errors.ip = 'Invalid IP address*';
        } else {
            errors[name as keyof typeof errors] = '';
        }
        setFormErrors(errors);
    };

    const handleIsPrimaryChange = (checked: boolean) => {
        setForm(prev => ({ ...prev, isPrimary: checked }));
    };

    const validateForm = () => {
        const errors: any = {};
        if (form.code === '') errors.code = 'Required*';
        if (form.ip === '') {
            errors.ip = 'Required*';
        } else if (!GeneralService.validateIpAddress(form.ip)) {
            errors.ip = 'Invalid IP address*';
        }
        if (form.port === '') errors.port = 'Required*';
        return errors;
    };

    const createHSM = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors({ ...formErrors, ...errors });
            return;
        }

        setLoading(true);
        try {
            const payload: CreateHsmDto = {
                code: form.code,
                ip: form.ip,
                port: Number(form.port),
                isPrimary: form.isPrimary,
                status: form.status,
            };
            const res = await HsmService.createHsm(payload);
            if (!res.failed) {
                toast.success('HSM created successfully');
                onClose();
                onSuccess?.();
            } else {
                const errorMsg = res.message || 'Failed to create HSM';
                setErrorMessage(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'Something went wrong, please try again.';
            toast.error(errorMsg);
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 sm:items-center">
            <div onClick={(e) => e.stopPropagation()} className="my-4 w-full max-w-[400px] bg-white p-5 shadow-2xl sm:p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1 mb-6">
                        <h2 className="text-[22px] sm:text-[25px] font-bold">Create HSM</h2>
                        <p className="text-[12px] font-medium text-gray-400">Create a new HSM by filling out the form</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 text-gray-500 hover:text-black transition-colors">✕</button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="HSM Code"
                        placeholder="e.g HSM-ABC123"
                        value={form.code}
                        onChange={(val) => handleChange('code', val)}
                        disabled={loading}
                        error={formErrors.code}
                    />
                    <Input
                        label="IP Address"
                        placeholder="e.g 192.168.0.1"
                        value={form.ip}
                        onChange={(val) => handleChange('ip', val)}
                        disabled={loading}
                        error={formErrors.ip}
                    />
                    <Input
                        label="Port Number"
                        placeholder="e.g 1234"
                        value={form.port}
                        onChange={(val) => handleChange('port', val)}
                        disabled={loading}
                        error={formErrors.port}
                    />
                    <Toggler
                        label="Primary HSM"
                        desc="Mark this HSM as the primary"
                        checked={form.isPrimary}
                        onCheck={handleIsPrimaryChange}
                    />
                </div>

                <button
                    onClick={createHSM}
                    disabled={loading}
                    className="w-full mt-6 bg-[#091D4A] text-white py-3 rounded-[8px] font-medium cursor-pointer text-[14px] transition-all   disabled:cursor-not-allowed"
                >
                    {loading ? <LoadingContent label="" /> : 'Create HSM'}
                </button>
            </div>
        </div>
    );
};
