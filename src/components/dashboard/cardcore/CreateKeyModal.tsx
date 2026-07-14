"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { KeyService } from '@/lib/services/keyService';
import { HsmService } from '@/lib/services/hsmService';
import { InstitutionService } from '@/lib/services/institutionService';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Input } from '@/components/ui/Input';
import { LoadingContent } from '@/components/ui/LoadingSpinner';

type CreateKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateKeyModal = ({ isOpen, onClose, onSuccess }: CreateKeyModalProps) => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [hsms, setHsms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [selectedHsm, setSelectedHsm] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    hsmCode: '',
    key: '',
    kcv: '',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    hsmCode: '',
    key: '',
    kcv: '',
  });

  const getData = async () => {
    try {
      const [instRes, hsmRes] = await Promise.all([
        InstitutionService.getInstitutions({ limit: 100 }),
        HsmService.getHsms({ limit: 100 }),
      ]);

      if (!instRes.failed && instRes.data) {
        setInstitutions(instRes.data);
      }
      if (!hsmRes.failed && hsmRes.data) {
        setHsms(hsmRes.data.map((h: any) => ({ ...h, name: h.code })));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getData();
      // Reset form
      setForm({ name: '', hsmCode: '', key: '', kcv: '', status: 'active' });
      setFormErrors({ name: '', hsmCode: '', key: '', kcv: '' });
      setSelectedInstitution(null);
      setSelectedHsm(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleChange = (name: 'name' | 'key' | 'kcv', value: string) => {
    const processedValue = name === 'key' || name === 'kcv' ? value.toUpperCase() : value;
    setForm(prev => ({ ...prev, [name]: processedValue }));

    let errors = { ...formErrors };
    if (value === '') {
      errors[name as keyof typeof errors] = 'Required*';
    } else {
      errors[name as keyof typeof errors] = '';
    }
    setFormErrors(errors);
  };

  const handleSelectInstitution = (option: any) => {
    setSelectedInstitution(option);
    // Institution is commented out in validation, but we'll still keep it
  };

  const handleSelectHsm = (option: any) => {
    setSelectedHsm(option);
    if (option) {
      setForm(prev => ({ ...prev, hsmCode: option.code }));
      setFormErrors(prev => ({ ...prev, hsmCode: '' }));
    } else {
      setForm(prev => ({ ...prev, hsmCode: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (form.name === '') errors.name = 'Required*';
    if (form.hsmCode === '') errors.hsmCode = 'Required*';
    if (form.key === '') errors.key = 'Required*';
    if (form.kcv === '') errors.kcv = 'Required*';
    return errors;
  };

  const createKey = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors({ ...formErrors, ...errors });
      return;
    }

    setLoading(true);
    try {
      const res = await KeyService.createKey(form);
      if (!res.failed && (res.statusCode === 200 || res.statusCode === 201)) {
        toast.success('Key created successfully');
        onClose();
        onSuccess?.();
      } else {
        const errorMsg = res.message || 'Failed to create key';
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[520px] bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[#111827]">Add Key</h2>
            <p className="text-[12px] text-gray-400 mt-1">Create a new HSM key entry.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* Key Name */}
          <Input
            label="Key Name"
            placeholder="e.g. mkac"
            value={form.name}
            onChange={(val) => handleChange('name', val)}
            disabled={loading}
            error={formErrors.name}
          />

          {/* Institution - commented out in validation but still showing */}
          <CustomSelect
            label="Institution"
            placeholder="Select Institution"
            options={institutions}
            value={selectedInstitution}
            onSelect={handleSelectInstitution}
            disabled={loading}
            type="outline"
          />

          {/* HSM */}
          <CustomSelect
            label="HSM"
            placeholder="Select HSM"
            options={hsms}
            value={selectedHsm}
            onSelect={handleSelectHsm}
            error={formErrors.hsmCode}
            disabled={loading}
            type="outline"
          />

          {/* Key Value */}
          <Input
            label="Key Value"
            placeholder="Enter key value"
            value={form.key}
            onChange={(val) => handleChange('key', val)}
            disabled={loading}
            error={formErrors.key}
          />

          {/* KCV */}
          <Input
            label="KCV"
            placeholder="Enter KCV"
            value={form.kcv}
            onChange={(val) => handleChange('kcv', val)}
            disabled={loading}
            error={formErrors.kcv}
          />
        </div>

        <button
          type="button"
          onClick={createKey}
          disabled={loading}
          className="mt-6 w-full bg-[#091D4A] text-white py-3 rounded-[8px] text-[14px] font-medium transition-all   disabled:cursor-not-allowed"
        >
          {loading ? <LoadingContent label="" /> : 'Create Key'}
        </button>
      </div>
    </div>
  );
};
