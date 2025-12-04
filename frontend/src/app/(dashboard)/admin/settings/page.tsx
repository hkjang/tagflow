'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface SettingsForm {
    tag_throttle_time: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsForm>();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:3001/settings');
            const settings = response.data;
            if (settings.tag_throttle_time) {
                setValue('tag_throttle_time', settings.tag_throttle_time);
            } else {
                setValue('tag_throttle_time', '0');
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: SettingsForm) => {
        setSaving(true);
        setMessage(null);
        try {
            await axios.post('http://localhost:3001/settings', {
                tag_throttle_time: data.tag_throttle_time,
            });
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            {message && (
                <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tag Throttle Time (minutes)
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                            If a tag is scanned multiple times within this window, subsequent scans will be ignored. Set to 0 to disable.
                        </p>
                        <input
                            type="number"
                            min="0"
                            {...register('tag_throttle_time', { required: true, min: 0 })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                        {errors.tag_throttle_time && <span className="text-red-500 text-sm">This field is required</span>}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
