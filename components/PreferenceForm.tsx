'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPreferences, userPreferencesSchema } from '@/types/preferences';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface PreferenceFormProps {
  initialPreferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  districts: string[];
  religions: string[];
  castes: string[];
  educationLevels: string[];
  userId: number | null;
}

export default function PreferenceForm({
  initialPreferences,
  onPreferencesChange,
  districts,
  religions,
  castes,
  educationLevels,
  userId
}: PreferenceFormProps) {
  const { 
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    control
  } = useForm<UserPreferences>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: initialPreferences,
    mode: 'onChange' // Validate on change
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);


const onSubmit = async (data: UserPreferences) => {
  console.log('Submitting data:', data); // Debug log
  if (!userId) {
    setSaveMessage({ text: 'User ID is required', type: 'error' });
    return;
  }
  
  setIsSaving(true);
  try {
    const response = await fetch(`/api/preferences/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        preferences: {
          ageRange: {
            min: data.ageRange.min,
            max: data.ageRange.max,
            weight: {
              weight: data.ageRange.weight.weight,
              enabled: data.ageRange.weight.enabled
            }
          },
          heightRange: {
            min: data.heightRange.min,
            max: data.heightRange.max,
            weight: {
              weight: data.heightRange.weight.weight,
              enabled: data.heightRange.weight.enabled
            }
          },
          locations: {
            districts: data.locations.districts || [],
            weight: {
              weight: data.locations.weight.weight,
              enabled: data.locations.weight.enabled
            }
          },
          religion: {
            value: data.religion.value,
            weight: {
              weight: data.religion.weight.weight,
              enabled: data.religion.weight.enabled
            }
          },
          caste: {
            value: data.caste.value,
            weight: {
              weight: data.caste.weight.weight,
              enabled: data.caste.weight.enabled
            }
          },
          education: {
            value: data.education.value,
            weight: {
              weight: data.education.weight.weight,
              enabled: data.education.weight.enabled
            }
          }
        }
      }),
    });
    
    const result = await response.json();
    console.log('API response:', result);
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to save preferences');
    }

    setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
    onPreferencesChange(data); // Update parent component if needed
    setTimeout(() => setSaveMessage(null), 3000);
  } catch (error) {
    console.error('Error saving preferences:', error);
    setSaveMessage({ 
      text: error instanceof Error ? error.message : 'Error saving preferences', 
      type: 'error' 
    });
  } finally {
    setIsSaving(false);
  }
};


  // const onSubmit = async (data: UserPreferences) => {
  //   if (!userId) {
  //     setSaveMessage({ text: 'User ID is required', type: 'error' });
  //     return;
  //   }
    
  //   setIsSaving(true);
  //   try {
  //     const response = await fetch(`/api/preferences/${userId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ preferences: data }),
  //     });
      
  //     const result = await response.json();
      
  //     if (!response.ok) {
  //       throw new Error(result.error || 'Failed to save preferences');
  //     }

  //     setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
  //     onPreferencesChange(data);
  //     setTimeout(() => setSaveMessage(null), 3000);
  //   } catch (error) {
  //     console.error('Error saving preferences:', error);
  //     setSaveMessage({ 
  //       text: error instanceof Error ? error.message : 'Error saving preferences', 
  //       type: 'error' 
  //     });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // Handle all range changes (age, height, weights)
  const handleRangeChange = (field: keyof UserPreferences, value: number) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  };

  // Handle district toggling
  const toggleDistrict = (district: string) => {
    const currentDistricts = watch('locations.districts') || [];
    const newDistricts = currentDistricts.includes(district)
      ? currentDistricts.filter(d => d !== district)
      : [...currentDistricts, district];
    setValue('locations.districts', newDistricts, { shouldValidate: true, shouldDirty: true });
  };

  // Handle select changes (religion, caste, education)
  const handleSelectChange = (field: keyof UserPreferences, value: string | null) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  };

  // Watch all values to ensure proper rendering
  const formValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Age Range Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Age Range</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('ageRange.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        {errors.ageRange?.min && (
          <p className="text-red-500 text-sm mb-2">{errors.ageRange.min.message}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium mb-1">Min Age</label>
            <input
              type="number"
              {...register('ageRange.min', { 
                valueAsNumber: true,
                onChange: (e) => handleRangeChange('ageRange.min', Number(e.target.value))
              })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Age</label>
            <input
              type="number"
              {...register('ageRange.max', { 
                valueAsNumber: true,
                onChange: (e) => handleRangeChange('ageRange.max', Number(e.target.value))
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.ageRange?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('ageRange.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('ageRange.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Height Range Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Height Range (cm)</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('heightRange.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium mb-1">Min Height</label>
            <input
              type="number"
              {...register('heightRange.min', { 
                valueAsNumber: true,
                onChange: (e) => handleRangeChange('heightRange.min', Number(e.target.value))
              })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Height</label>
            <input
              type="number"
              {...register('heightRange.max', { 
                valueAsNumber: true,
                onChange: (e) => handleRangeChange('heightRange.max', Number(e.target.value))
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.heightRange?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('heightRange.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('heightRange.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Locations Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Preferred Locations</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('locations.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Districts</label>
          <div className="flex flex-wrap gap-2">
            {districts.map(district => (
              <button
                key={district}
                type="button"
                onClick={() => toggleDistrict(district)}
                className={`px-3 py-1 text-sm rounded-full ${
                  formValues.locations?.districts?.includes(district)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.locations?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('locations.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('locations.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Religion Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Religion</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('religion.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Religion</label>
          <select
            {...register('religion.value', {
              onChange: (e) => handleSelectChange('religion.value', e.target.value || null)
            })}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            {religions.map(religion => (
              <option key={religion} value={religion}>{religion}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.religion?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('religion.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('religion.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Caste Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Caste</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('caste.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Caste</label>
          <select
            {...register('caste.value', {
              onChange: (e) => handleSelectChange('caste.value', e.target.value || null)
            })}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            {castes.map(caste => (
              <option key={caste} value={caste}>{caste}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.caste?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('caste.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('caste.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      {/* Education Section */}
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Education Level</h3>
          <label className="flex items-center space-x-2">
            <span>Enabled</span>
            <input
              type="checkbox"
              {...register('education.weight.enabled')}
              className="h-4 w-4"
            />
          </label>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Education Level</label>
          <select
            {...register('education.value', {
              onChange: (e) => handleSelectChange('education.value', e.target.value || null)
            })}
            className="w-full p-2 border rounded"
          >
            <option value="">Any</option>
            {educationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Importance: {formValues.education?.weight?.weight}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            {...register('education.weight.weight', { 
              valueAsNumber: true,
              onChange: (e) => handleRangeChange('education.weight.weight', Number(e.target.value))
            })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {saveMessage && (
          <div className={`p-2 rounded mr-4 ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        <Button 
          type="submit"
          disabled={isSaving || !isDirty}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
}


// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences, userPreferencesSchema } from '@/types/preferences';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const { 
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//     trigger
//   } = useForm<UserPreferences>({
//     resolver: zodResolver(userPreferencesSchema),
//     defaultValues: initialPreferences
//   });

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const onSubmit = async (data: UserPreferences) => {
//     if (!userId) {
//       setSaveMessage({ text: 'User ID is required', type: 'error' });
//       return;
//     }
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences: data }),
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         let errorMessage = 'Failed to save preferences';
//         if (result.details) {
//           if (typeof result.details === 'string') {
//             errorMessage += `: ${result.details}`;
//           } else if (result.details.fieldErrors) {
//             errorMessage += '\n' + Object.entries(result.details.fieldErrors)
//               .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
//               .join('\n');
//           }
//         }
//         throw new Error(errorMessage);
//       }

//       setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//       onPreferencesChange(data);
//       setTimeout(() => setSaveMessage(null), 3000);
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ 
//         text: error instanceof Error ? error.message : 'Error saving preferences', 
//         type: 'error' 
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleRangeChange = (field: string, value: number) => {
//     const numValue = Number(value);
//     setValue(field as any, numValue, { shouldValidate: true });
//   };

//   const toggleDistrict = (district: string) => {
//     const currentDistricts = watch('locations.districts') || [];
//     const newDistricts = currentDistricts.includes(district)
//       ? currentDistricts.filter(d => d !== district)
//       : [...currentDistricts, district];
//     setValue('locations.districts', newDistricts, { shouldValidate: true });
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       {/* Age Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('ageRange.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         {errors.ageRange?.min && (
//           <p className="text-red-500 text-sm mb-2">{errors.ageRange.min.message}</p>
//         )}
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Age</label>
//             <input
//               type="number"
//               {...register('ageRange.min', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('ageRange.min', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Age</label>
//             <input
//               type="number"
//               {...register('ageRange.max', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('ageRange.max', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('ageRange.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('ageRange.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Height Range Section */}

// <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">HEIGHT Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('heightRange.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         {errors.heightRange?.min && (
//           <p className="text-red-500 text-sm mb-2">{errors.heightRange.min.message}</p>
//         )}
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min height</label>
//             <input
//               type="number"
//               {...register('heightRange.min', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('heightRange.min', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max height</label>
//             <input
//               type="number"
//               {...register('heightRange.max', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('heightRange.max', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('ageRange.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('ageRange.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>



//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Height Range (cm)</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('heightRange.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         {errors.heightRange?.min && (
//           <p className="text-red-500 text-sm mb-2">{errors.heightRange.min.message}</p>
//         )}
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Height</label>
//             <input
//               type="number"
//               {...register('heightRange.min', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('heightRange.min', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Height</label>
//             <input
//               type="number"
//               {...register('heightRange.max', { valueAsNumber: true })}
//               onChange={(e) => handleRangeChange('heightRange.max', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('heightRange.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('heightRange.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Locations Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Preferred Locations</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('locations.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Districts</label>
//           <div className="flex flex-wrap gap-2">
//             {districts.map(district => (
//               <button
//                 key={district}
//                 type="button"
//                 onClick={() => toggleDistrict(district)}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   watch('locations.districts')?.includes(district)
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-800'
//                 }`}
//               >
//                 {district}
//               </button>
//             ))}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('locations.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('locations.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Religion Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Religion</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('religion.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Religion</label>
//           <select
//             {...register('religion.value')}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {religions.map(religion => (
//               <option key={religion} value={religion}>{religion}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('religion.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('religion.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Caste Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Caste</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('caste.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Caste</label>
//           <select
//             {...register('caste.value')}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {castes.map(caste => (
//               <option key={caste} value={caste}>{caste}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('caste.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('caste.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Education Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Education Level</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('education.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Education Level</label>
//           <select
//             {...register('education.value')}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {educationLevels.map(level => (
//               <option key={level} value={level}>{level}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('education.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('education.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       <div className="flex justify-end">
//         {saveMessage && (
//           <div className={`p-2 rounded mr-4 ${
//             saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {saveMessage.text.split('\n').map((line, i) => (
//               <p key={i}>{line}</p>
//             ))}
//           </div>
//         )}
//         <Button 
//           type="submit"
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isSaving ? (
//             <span className="flex items-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Saving...
//             </span>
//           ) : 'Save Preferences'}
//         </Button>
//       </div>
//     </form>
//   );
// }


// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences, userPreferencesSchema } from '@/types/preferences';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const { 
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//     trigger
//   } = useForm<UserPreferences>({
//     resolver: zodResolver(userPreferencesSchema),
//     defaultValues: initialPreferences
//   });

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const onSubmit = async (data: UserPreferences) => {
//     if (!userId) {
//       setSaveMessage({ text: 'User ID is required', type: 'error' });
//       return;
//     }
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences: data }),
//       });
      
//       const result = await response.json();
      
//       if (!response.ok) {
//         let errorMessage = 'Failed to save preferences';
//         if (result.details) {
//           if (typeof result.details === 'string') {
//             errorMessage += `: ${result.details}`;
//           } else if (result.details.fieldErrors) {
//             errorMessage += '\n' + Object.entries(result.details.fieldErrors)
//               .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
//               .join('\n');
//           }
//         }
//         throw new Error(errorMessage);
//       }

//       setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//       onPreferencesChange(data);
//       setTimeout(() => setSaveMessage(null), 3000);
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ 
//         text: error instanceof Error ? error.message : 'Error saving preferences', 
//         type: 'error' 
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Example field implementation (repeat for other fields)
//   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
//     const numValue = Number(value);
//     setValue(`ageRange.${field}`, numValue, { shouldValidate: true });
//   };

// // components/PreferenceForm.tsx
// const savePreferences = async () => {
//   if (!userId) {
//     setSaveMessage({ text: 'User ID is required', type: 'error' })
//     return
//   }

//   setIsSaving(true)
//   try {
//     const response = await fetch(`/api/preferences/${userId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ preferences }),
//     })

//     const result = await response.json()

//     if (!response.ok) {
//       throw new Error(result.error || 'Failed to save preferences')
//     }

//     setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' })
//     onPreferencesChange(preferences)
//   } catch (error) {
//     setSaveMessage({
//       text: error instanceof Error ? error.message : 'Error saving preferences',
//       type: 'error'
//     })
//   } finally {
//     setIsSaving(false)
//   }
// }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       {/* Age Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               {...register('ageRange.weight.enabled')}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         {errors.ageRange?.min && (
//           <p className="text-red-500 text-sm mb-2">{errors.ageRange.min.message}</p>
//         )}
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Age</label>
//             <input
//               type="number"
//               {...register('ageRange.min', { valueAsNumber: true })}
//               onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Age</label>
//             <input
//               type="number"
//               {...register('ageRange.max', { valueAsNumber: true })}
//               onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {watch('ageRange.weight.weight')}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             {...register('ageRange.weight.weight', { valueAsNumber: true })}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Other sections (Height, Locations, etc.) follow similar pattern */}

// {/* Height Range Section */}
// //       <div className="p-4 border rounded-lg">
// //         <div className="flex justify-between items-center mb-2">
// //           <h3 className="font-medium">Height Range (cm)</h3>
// //           <label className="flex items-center space-x-2">
// //             <span>Enabled</span>
// //             <input
//               type="checkbox"
//               checked={preferences.heightRange.weight.enabled}
//               onChange={(e) => handleWeightChange('heightRange', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.min}
//               min={140}
//               max={preferences.heightRange.max - 1}
//               onChange={(e) => handleHeightRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.max}
//               min={preferences.heightRange.min + 1}
//               max={220}
//               onChange={(e) => handleHeightRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.heightRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.heightRange.weight.weight}
//             onChange={(e) => handleWeightChange('heightRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.heightRange.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Locations Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Preferred Locations</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.locations.weight.enabled}
//               onChange={(e) => handleWeightChange('locations', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Districts</label>
//           <div className="flex flex-wrap gap-2">
//             {districts.map(district => (
//               <button
//                 key={district}
//                 type="button"
//                 onClick={() => toggleDistrict(district)}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   preferences.locations.districts.includes(district)
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-800'
//                 }`}
//                 disabled={!preferences.locations.weight.enabled}
//               >
//                 {district}
//               </button>
//             ))}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.locations.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.locations.weight.weight}
//             onChange={(e) => handleWeightChange('locations', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.locations.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Religion Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Religion</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.religion.weight.enabled}
//               onChange={(e) => handleWeightChange('religion', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Religion</label>
//           <select
//             value={preferences.religion.value || ''}
//             onChange={(e) => handleFieldChange('religion', e.target.value || null)}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {religions.map(religion => (
//               <option key={religion} value={religion}>{religion}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.religion.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.religion.weight.weight}
//             onChange={(e) => handleWeightChange('religion', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Caste Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Caste</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.caste.weight.enabled}
//               onChange={(e) => handleWeightChange('caste', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Caste</label>
//           <select
//             value={preferences.caste.value || ''}
//             onChange={(e) => handleFieldChange('caste', e.target.value || null)}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {castes.map(caste => (
//               <option key={caste} value={caste}>{caste}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.caste.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.caste.weight.weight}
//             onChange={(e) => handleWeightChange('caste', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Education Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Education Level</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.education.weight.enabled}
//               onChange={(e) => handleWeightChange('education', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Education Level</label>
//           <select
//             value={preferences.education.value || ''}
//             onChange={(e) => handleFieldChange('education', e.target.value || null)}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {educationLevels.map(level => (
//               <option key={level} value={level}>{level}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.education.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.education.weight.weight}
//             onChange={(e) => handleWeightChange('education', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       <div className="flex justify-end">
//         {saveMessage && (
//           <div className={`p-2 rounded mr-4 ${
//             saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {saveMessage.text.split('\n').map((line, i) => (
//               <p key={i}>{line}</p>
//             ))}
//           </div>
//         )}
//         <Button 
//           type="submit"
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isSaving ? (
//             <span className="flex items-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Saving...
//             </span>
//           ) : 'Save Preferences'}
//         </Button>
//       </div>
//     </form>
//   );
// }


// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences } from '@/types/preferences';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
//     const numValue = Number(value);
//     setPreferences(prev => ({
//       ...prev,
//       ageRange: {
//         ...prev.ageRange,
//         [field]: numValue
//       }
//     }));
//   };

//   const handleHeightRangeChange = (field: 'min' | 'max', value: number) => {
//     const numValue = Number(value);
//     setPreferences(prev => ({
//       ...prev,
//       heightRange: {
//         ...prev.heightRange,
//         [field]: numValue
//       }
//     }));
//   };

//   const handleWeightChange = (
//     section: keyof UserPreferences, 
//     field: 'weight' | 'enabled', 
//     value: number | boolean
//   ) => {
//     let processedValue = value;
//     if (field === 'weight' && typeof value === 'number') {
//       processedValue = Math.max(0, Math.min(100, Number(value)));
//     }
    
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         weight: {
//           ...prev[section].weight,
//           [field]: processedValue
//         }
//       }
//     }));
//   };

//   const handleFieldChange = (
//     section: 'religion' | 'caste' | 'education',
//     value: string | null
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         value: value
//       }
//     }));
//   };

//   const toggleDistrict = (district: string) => {
//     const currentDistricts = [...preferences.locations.districts];
//     const districtIndex = currentDistricts.indexOf(district);
    
//     if (districtIndex >= 0) {
//       currentDistricts.splice(districtIndex, 1);
//     } else {
//       currentDistricts.push(district);
//     }
    
//     setPreferences(prev => ({
//       ...prev,
//       locations: {
//         ...prev.locations,
//         districts: currentDistricts
//       }
//     }));
//   };

//   const savePreferences = async () => {
//     if (!userId) {
//       setSaveMessage({ text: 'User ID is required', type: 'error' });
//       return;
//     }
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences }),
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to save preferences');
//       }

//       setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//       onPreferencesChange(preferences);
//       setTimeout(() => setSaveMessage(null), 3000);
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ 
//         text: error instanceof Error ? error.message : 'Error saving preferences', 
//         type: 'error' 
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Age Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.ageRange.weight.enabled}
//               onChange={(e) => handleWeightChange('ageRange', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.min}
//               min={18}
//               max={preferences.ageRange.max - 1}
//               onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.max}
//               min={preferences.ageRange.min + 1}
//               max={100}
//               onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.ageRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.ageRange.weight.weight}
//             onChange={(e) => handleWeightChange('ageRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.ageRange.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Height Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Height Range (cm)</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.heightRange.weight.enabled}
//               onChange={(e) => handleWeightChange('heightRange', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.min}
//               min={140}
//               max={preferences.heightRange.max - 1}
//               onChange={(e) => handleHeightRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.max}
//               min={preferences.heightRange.min + 1}
//               max={220}
//               onChange={(e) => handleHeightRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.heightRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.heightRange.weight.weight}
//             onChange={(e) => handleWeightChange('heightRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.heightRange.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Locations Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Preferred Locations</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.locations.weight.enabled}
//               onChange={(e) => handleWeightChange('locations', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Districts</label>
//           <div className="flex flex-wrap gap-2">
//             {districts.map(district => (
//               <button
//                 key={district}
//                 type="button"
//                 onClick={() => toggleDistrict(district)}
//                 className={`px-3 py-1 text-sm rounded-full ${
//                   preferences.locations.districts.includes(district)
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-800'
//                 }`}
//                 disabled={!preferences.locations.weight.enabled}
//               >
//                 {district}
//               </button>
//             ))}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.locations.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.locations.weight.weight}
//             onChange={(e) => handleWeightChange('locations', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.locations.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Religion Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Religion</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.religion.weight.enabled}
//               onChange={(e) => handleWeightChange('religion', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Religion</label>
//           <select
//             value={preferences.religion.value || ''}
//             onChange={(e) => handleFieldChange('religion', e.target.value || null)}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {religions.map(religion => (
//               <option key={religion} value={religion}>{religion}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.religion.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.religion.weight.weight}
//             onChange={(e) => handleWeightChange('religion', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Caste Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Caste</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.caste.weight.enabled}
//               onChange={(e) => handleWeightChange('caste', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Caste</label>
//           <select
//             value={preferences.caste.value || ''}
//             onChange={(e) => handleFieldChange('caste', e.target.value || null)}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {castes.map(caste => (
//               <option key={caste} value={caste}>{caste}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.caste.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.caste.weight.weight}
//             onChange={(e) => handleWeightChange('caste', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Education Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Education Level</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.education.weight.enabled}
//               onChange={(e) => handleWeightChange('education', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="mb-2">
//           <label className="block text-sm font-medium mb-1">Select Education Level</label>
//           <select
//             value={preferences.education.value || ''}
//             onChange={(e) => handleFieldChange('education', e.target.value || null)}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">Any</option>
//             {educationLevels.map(level => (
//               <option key={level} value={level}>{level}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.education.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.education.weight.weight}
//             onChange={(e) => handleWeightChange('education', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       <div className="flex justify-end">
//         {saveMessage && (
//           <div className={`p-2 rounded mr-4 ${
//             saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {saveMessage.text}
//           </div>
//         )}
//         <Button 
//           onClick={savePreferences}
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isSaving ? (
//             <span className="flex items-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Saving...
//             </span>
//           ) : 'Save Preferences'}
//         </Button>
//       </div>
//     </div>
//   );
// }



// // components/PreferenceForm.tsx
// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences } from '@/types/preferences';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       ageRange: {
//         ...prev.ageRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleHeightRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       heightRange: {
//         ...prev.heightRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleWeightChange = (
//     section: keyof UserPreferences, 
//     field: 'weight' | 'enabled', 
//     value: number | boolean
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         weight: {
//           ...prev[section].weight,
//           [field]: value
//         }
//       }
//     }));
//   };

//   const handleFieldChange = (
//     section: 'religion' | 'caste' | 'education',
//     value: string | null
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         value: value
//       }
//     }));
//   };

//   const toggleDistrict = (district: string) => {
//     const currentDistricts = [...preferences.locations.districts];
//     const districtIndex = currentDistricts.indexOf(district);
    
//     if (districtIndex >= 0) {
//       currentDistricts.splice(districtIndex, 1);
//     } else {
//       currentDistricts.push(district);
//     }
    
//     setPreferences(prev => ({
//       ...prev,
//       locations: {
//         ...prev.locations,
//         districts: currentDistricts
//       }
//     }));
//   };

//   const savePreferences = async () => {
//     if (!userId) return;
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences }),
//       });
      
//       if (response.ok) {
//         setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//         onPreferencesChange(preferences);
//         setTimeout(() => setSaveMessage(null), 3000);
//       } else {
//         setSaveMessage({ text: 'Failed to save preferences', type: 'error' });
//       }
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ text: 'Error saving preferences', type: 'error' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Age Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.ageRange.weight.enabled}
//               onChange={(e) => handleWeightChange('ageRange', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.min}
//               min={18}
//               max={preferences.ageRange.max - 1}
//               onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.max}
//               min={preferences.ageRange.min + 1}
//               max={100}
//               onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.ageRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.ageRange.weight.weight}
//             onChange={(e) => handleWeightChange('ageRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.ageRange.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Other sections (Height, Locations, Religion, Caste, Education) follow same pattern */}

//       <div className="flex justify-end">
//         {saveMessage && (
//           <div className={`p-2 rounded mr-4 ${
//             saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {saveMessage.text}
//           </div>
//         )}
//         <Button 
//           onClick={savePreferences}
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isSaving ? 'Saving...' : 'Save Preferences'}
//         </Button>
//       </div>
//     </div>
//   );
// }


// // components/PreferenceForm.tsx
// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences } from '@/types/preferences';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       ageRange: {
//         ...prev.ageRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleHeightRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       heightRange: {
//         ...prev.heightRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleWeightChange = (
//     section: keyof UserPreferences, 
//     field: 'weight' | 'enabled', 
//     value: number | boolean
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         weight: {
//           ...prev[section].weight,
//           [field]: value
//         }
//       }
//     }));
//   };

//   const handleFieldChange = (
//     section: 'religion' | 'caste' | 'education',
//     value: string | null
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         value: value
//       }
//     }));
//   };

//   const toggleDistrict = (district: string) => {
//     const currentDistricts = [...preferences.locations.districts];
//     const districtIndex = currentDistricts.indexOf(district);
    
//     if (districtIndex >= 0) {
//       currentDistricts.splice(districtIndex, 1);
//     } else {
//       currentDistricts.push(district);
//     }
    
//     setPreferences(prev => ({
//       ...prev,
//       locations: {
//         ...prev.locations,
//         districts: currentDistricts
//       }
//     }));
//   };

//   const savePreferences = async () => {
//     if (!userId) return;
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences }),
//       });
      
//       if (response.ok) {
//         setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//         onPreferencesChange(preferences);
//         setTimeout(() => setSaveMessage(null), 3000);
//       } else {
//         setSaveMessage({ text: 'Failed to save preferences', type: 'error' });
//       }
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ text: 'Error saving preferences', type: 'error' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Age Range Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.ageRange.weight.enabled}
//               onChange={(e) => handleWeightChange('ageRange', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.min}
//               min={18}
//               max={preferences.ageRange.max - 1}
//               onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.max}
//               min={preferences.ageRange.min + 1}
//               max={100}
//               onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.ageRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.ageRange.weight.weight}
//             onChange={(e) => handleWeightChange('ageRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.ageRange.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Height Range Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Height Range (cm)</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.heightRange.weight.enabled}
//               onChange={(e) => handleWeightChange('heightRange', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.min}
//               min={120}
//               max={preferences.heightRange.max - 1}
//               onChange={(e) => handleHeightRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Height</label>
//             <input
//               type="number"
//               value={preferences.heightRange.max}
//               min={preferences.heightRange.min + 1}
//               max={220}
//               onChange={(e) => handleHeightRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.heightRange.weight.enabled}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.heightRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.heightRange.weight.weight}
//             onChange={(e) => handleWeightChange('heightRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.heightRange.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Locations Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Preferred Locations</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.locations.weight.enabled}
//               onChange={(e) => handleWeightChange('locations', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-3">Select Districts</label>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
//             {districts.map((district) => (
//               <label key={district} className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={preferences.locations.districts.includes(district)}
//                   onChange={() => toggleDistrict(district)}
//                   disabled={!preferences.locations.weight.enabled}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
//                 />
//                 <span className="text-sm text-gray-700">{district}</span>
//               </label>
//             ))}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.locations.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.locations.weight.weight}
//             onChange={(e) => handleWeightChange('locations', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.locations.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Religion Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Religion</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.religion.weight.enabled}
//               onChange={(e) => handleWeightChange('religion', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="mb-4">
//           <select
//             value={preferences.religion.value || ''}
//             onChange={(e) => handleFieldChange('religion', e.target.value || null)}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//           >
//             <option value="">Any Religion</option>
//             {religions.map((religion) => (
//               <option key={religion} value={religion}>
//                 {religion}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.religion.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.religion.weight.weight}
//             onChange={(e) => handleWeightChange('religion', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.religion.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Caste Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Caste</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.caste.weight.enabled}
//               onChange={(e) => handleWeightChange('caste', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="mb-4">
//           <select
//             value={preferences.caste.value || ''}
//             onChange={(e) => handleFieldChange('caste', e.target.value || null)}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//           >
//             <option value="">Any Caste</option>
//             {castes.map((caste) => (
//               <option key={caste} value={caste}>
//                 {caste}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.caste.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.caste.weight.weight}
//             onChange={(e) => handleWeightChange('caste', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.caste.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Education Section */}
//       <div className="p-6 border rounded-lg bg-white shadow-sm">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">Education</h3>
//           <label className="flex items-center space-x-2">
//             <span className="text-sm font-medium text-gray-600">Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.education.weight.enabled}
//               onChange={(e) => handleWeightChange('education', 'enabled', e.target.checked)}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//           </label>
//         </div>
        
//         <div className="mb-4">
//           <select
//             value={preferences.education.value || ''}
//             onChange={(e) => handleFieldChange('education', e.target.value || null)}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//           >
//             <option value="">Any Education Level</option>
//             {educationLevels.map((level) => (
//               <option key={level} value={level}>
//                 {level}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Importance: {preferences.education.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.education.weight.weight}
//             onChange={(e) => handleWeightChange('education', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.education.weight.enabled}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
//           />
//         </div>
//       </div>

//       {/* Save Button */}
//       <div className="flex justify-end items-center space-x-4">
//         {saveMessage && (
//           <div className={`px-4 py-2 rounded-md ${
//             saveMessage.type === 'success' 
//               ? 'bg-green-100 text-green-800 border border-green-200' 
//               : 'bg-red-100 text-red-800 border border-red-200'
//           }`}>
//             {saveMessage.text}
//           </div>
//         )}
//         <Button 
//           onClick={savePreferences}
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isSaving ? 'Saving...' : 'Save Preferences'}
//         </Button>
//       </div>
//     </div>
//   );
// }


// // components/PreferenceForm.tsx
// 'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { UserPreferences } from '@/types/preferences';

// interface PreferenceFormProps {
//   initialPreferences: UserPreferences;
//   onPreferencesChange: (preferences: UserPreferences) => void;
//   districts: string[];
//   religions: string[];
//   castes: string[];
//   educationLevels: string[];
//   userId: number | null;
// }

// export default function PreferenceForm({
//   initialPreferences,
//   onPreferencesChange,
//   districts,
//   religions,
//   castes,
//   educationLevels,
//   userId
// }: PreferenceFormProps) {
//   const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

//   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       ageRange: {
//         ...prev.ageRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleHeightRangeChange = (field: 'min' | 'max', value: number) => {
//     setPreferences(prev => ({
//       ...prev,
//       heightRange: {
//         ...prev.heightRange,
//         [field]: value
//       }
//     }));
//   };

//   const handleWeightChange = (
//     section: keyof UserPreferences, 
//     field: 'weight' | 'enabled', 
//     value: number | boolean
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         weight: {
//           ...prev[section].weight,
//           [field]: value
//         }
//       }
//     }));
//   };

//   const handleFieldChange = (
//     section: 'religion' | 'caste' | 'education',
//     value: string | null
//   ) => {
//     setPreferences(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         value: value
//       }
//     }));
//   };

//   const toggleDistrict = (district: string) => {
//     const currentDistricts = [...preferences.locations.districts];
//     const districtIndex = currentDistricts.indexOf(district);
    
//     if (districtIndex >= 0) {
//       currentDistricts.splice(districtIndex, 1);
//     } else {
//       currentDistricts.push(district);
//     }
    
//     setPreferences(prev => ({
//       ...prev,
//       locations: {
//         ...prev.locations,
//         districts: currentDistricts
//       }
//     }));
//   };

//   const savePreferences = async () => {
//     if (!userId) return;
    
//     setIsSaving(true);
//     try {
//       const response = await fetch(`/api/preferences/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ preferences }),
//       });
      
//       if (response.ok) {
//         setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
//         onPreferencesChange(preferences);
//         setTimeout(() => setSaveMessage(null), 3000);
//       } else {
//         setSaveMessage({ text: 'Failed to save preferences', type: 'error' });
//       }
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setSaveMessage({ text: 'Error saving preferences', type: 'error' });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Age Range Section */}
//       <div className="p-4 border rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-medium">Age Range</h3>
//           <label className="flex items-center space-x-2">
//             <span>Enabled</span>
//             <input
//               type="checkbox"
//               checked={preferences.ageRange.weight.enabled}
//               onChange={(e) => handleWeightChange('ageRange', 'enabled', e.target.checked)}
//               className="h-4 w-4"
//             />
//           </label>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-2">
//           <div>
//             <label className="block text-sm font-medium mb-1">Min Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.min}
//               min={18}
//               max={preferences.ageRange.max - 1}
//               onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Max Age</label>
//             <input
//               type="number"
//               value={preferences.ageRange.max}
//               min={preferences.ageRange.min + 1}
//               max={100}
//               onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
//               disabled={!preferences.ageRange.weight.enabled}
//               className="w-full p-2 border rounded"
//             />
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Importance: {preferences.ageRange.weight.weight}%
//           </label>
//           <input
//             type="range"
//             min={0}
//             max={100}
//             value={preferences.ageRange.weight.weight}
//             onChange={(e) => handleWeightChange('ageRange', 'weight', parseInt(e.target.value))}
//             disabled={!preferences.ageRange.weight.enabled}
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Other sections (Height, Locations, Religion, Caste, Education) follow same pattern */}

//       <div className="flex justify-end">
//         {saveMessage && (
//           <div className={`p-2 rounded mr-4 ${
//             saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//           }`}>
//             {saveMessage.text}
//           </div>
//         )}
//         <Button 
//           onClick={savePreferences}
//           disabled={isSaving}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isSaving ? 'Saving...' : 'Save Preferences'}
//         </Button>
//       </div>
//     </div>
//   );
// }






// // // components/PreferenceForm.tsx
// // 'use client';

// // import { useState } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { UserPreferences } from '@/types/preferences';
// // import 'bootstrap/dist/css/bootstrap.min.css';

// // interface PreferenceFormProps {
// //   initialPreferences: UserPreferences;
// //   onPreferencesChange: (preferences: UserPreferences) => void;
// //   districts: string[];
// //   religions: string[];
// //   castes: string[];
// //   educationLevels: string[];
// //   userId: number | null;
// // }

// // export default function PreferenceForm({
// //   initialPreferences,
// //   onPreferencesChange,
// //   districts,
// //   religions,
// //   castes,
// //   educationLevels,
// //   userId
// // }: PreferenceFormProps) {
// //   const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

// //   // Handle changes to age range
// //   const handleAgeRangeChange = (field: 'min' | 'max', value: number) => {
// //     setPreferences(prev => ({
// //       ...prev,
// //       ageRange: {
// //         ...prev.ageRange,
// //         [field]: value
// //       }
// //     }));
// //   };

// //   // Handle changes to height range
// //   const handleHeightRangeChange = (field: 'min' | 'max', value: number) => {
// //     setPreferences(prev => ({
// //       ...prev,
// //       heightRange: {
// //         ...prev.heightRange,
// //         [field]: value
// //       }
// //     }));
// //   };

// //   // Handle changes to weight settings
// //   const handleWeightChange = (
// //     section: keyof UserPreferences, 
// //     field: 'weight' | 'enabled', 
// //     value: number | boolean
// //   ) => {
// //     setPreferences(prev => ({
// //       ...prev,
// //       [section]: {
// //         ...prev[section],
// //         weight: {
// //           ...prev[section].weight,
// //           [field]: value
// //         }
// //       }
// //     }));
// //   };

// //   // Handle changes to simple fields (religion, caste, education)
// //   const handleFieldChange = (
// //     section: 'religion' | 'caste' | 'education',
// //     value: string | null
// //   ) => {
// //     setPreferences(prev => ({
// //       ...prev,
// //       [section]: {
// //         ...prev[section],
// //         value: value
// //       }
// //     }));
// //   };

// //   // Handle changes to districts (multi-select)
// //   const handleDistrictsChange = (selectedDistricts: string[]) => {
// //     setPreferences(prev => ({
// //       ...prev,
// //       locations: {
// //         ...prev.locations,
// //         districts: selectedDistricts
// //       }
// //     }));
// //   };

// //   // Toggle district selection
// //   const toggleDistrict = (district: string) => {
// //     const currentDistricts = [...preferences.locations.districts];
// //     const districtIndex = currentDistricts.indexOf(district);
    
// //     if (districtIndex >= 0) {
// //       currentDistricts.splice(districtIndex, 1);
// //     } else {
// //       currentDistricts.push(district);
// //     }
    
// //     handleDistrictsChange(currentDistricts);
// //   };

// //   // Save preferences to API
// //   const savePreferences = async () => {
// //     if (!userId) return;
    
// //     setIsSaving(true);
// //     try {
// //       const response = await fetch(`/api/preferences/${userId}`, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ preferences }),
// //       });
      
// //       if (response.ok) {
// //         setSaveMessage({ text: 'Preferences saved successfully!', type: 'success' });
// //         // Notify parent component
// //         onPreferencesChange(preferences);
        
// //         // Clear message after 3 seconds
// //         setTimeout(() => {
// //           setSaveMessage(null);
// //         }, 3000);
// //       } else {
// //         setSaveMessage({ text: 'Failed to save preferences', type: 'error' });
// //       }
// //     } catch (error) {
// //       console.error('Error saving preferences:', error);
// //       setSaveMessage({ text: 'Error saving preferences', type: 'error' });
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   return (
// //     <div className="preference-form">
// //       {/* Age Range Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Age Range</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="age-enabled"
// //                 checked={preferences.ageRange.weight.enabled}
// //                 onChange={(e) => handleWeightChange('ageRange', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="age-enabled">
// //                 {preferences.ageRange.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <div className="row">
// //               <div className="col-md-6">
// //                 <label htmlFor="min-age" className="form-label">Minimum Age</label>
// //                 <input
// //                   type="number"
// //                   className="form-control"
// //                   id="min-age"
// //                   value={preferences.ageRange.min}
// //                   min={18}
// //                   max={preferences.ageRange.max - 1}
// //                   onChange={(e) => handleAgeRangeChange('min', parseInt(e.target.value))}
// //                   disabled={!preferences.ageRange.weight.enabled}
// //                 />
// //               </div>
// //               <div className="col-md-6">
// //                 <label htmlFor="max-age" className="form-label">Maximum Age</label>
// //                 <input
// //                   type="number"
// //                   className="form-control"
// //                   id="max-age"
// //                   value={preferences.ageRange.max}
// //                   min={preferences.ageRange.min + 1}
// //                   max={100}
// //                   onChange={(e) => handleAgeRangeChange('max', parseInt(e.target.value))}
// //                   disabled={!preferences.ageRange.weight.enabled}
// //                 />
// //               </div>
// //             </div>
            
// //             <div className="mt-3">
// //               <label htmlFor="age-importance" className="form-label">
// //                 Importance: {preferences.ageRange.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="age-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.ageRange.weight.weight}
// //                 onChange={(e) => handleWeightChange('ageRange', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.ageRange.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Height Range Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Height Range (cm)</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="height-enabled"
// //                 checked={preferences.heightRange.weight.enabled}
// //                 onChange={(e) => handleWeightChange('heightRange', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="height-enabled">
// //                 {preferences.heightRange.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <div className="row">
// //               <div className="col-md-6">
// //                 <label htmlFor="min-height" className="form-label">Minimum Height</label>
// //                 <input
// //                   type="number"
// //                   className="form-control"
// //                   id="min-height"
// //                   value={preferences.heightRange.min}
// //                   min={120}
// //                   max={preferences.heightRange.max - 1}
// //                   onChange={(e) => handleHeightRangeChange('min', parseInt(e.target.value))}
// //                   disabled={!preferences.heightRange.weight.enabled}
// //                 />
// //               </div>
// //               <div className="col-md-6">
// //                 <label htmlFor="max-height" className="form-label">Maximum Height</label>
// //                 <input
// //                   type="number"
// //                   className="form-control"
// //                   id="max-height"
// //                   value={preferences.heightRange.max}
// //                   min={preferences.heightRange.min + 1}
// //                   max={220}
// //                   onChange={(e) => handleHeightRangeChange('max', parseInt(e.target.value))}
// //                   disabled={!preferences.heightRange.weight.enabled}
// //                 />
// //               </div>
// //             </div>
            
// //             <div className="mt-3">
// //               <label htmlFor="height-importance" className="form-label">
// //                 Importance: {preferences.heightRange.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="height-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.heightRange.weight.weight}
// //                 onChange={(e) => handleWeightChange('heightRange', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.heightRange.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Locations Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Preferred Locations</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="location-enabled"
// //                 checked={preferences.locations.weight.enabled}
// //                 onChange={(e) => handleWeightChange('locations', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="location-enabled">
// //                 {preferences.locations.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <label className="form-label">Select Districts</label>
// //             <div className="row g-2">
// //               {districts.map((district) => (
// //                 <div className="col-md-4" key={district}>
// //                   <div className="form-check">
// //                     <input
// //                       className="form-check-input"
// //                       type="checkbox"
// //                       id={`district-${district}`}
// //                       checked={preferences.locations.districts.includes(district)}
// //                       onChange={() => toggleDistrict(district)}
// //                       disabled={!preferences.locations.weight.enabled}
// //                     />
// //                     <label className="form-check-label" htmlFor={`district-${district}`}>
// //                       {district}
// //                     </label>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
            
// //             <div className="mt-3">
// //               <label htmlFor="location-importance" className="form-label">
// //                 Importance: {preferences.locations.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="location-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.locations.weight.weight}
// //                 onChange={(e) => handleWeightChange('locations', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.locations.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Religion Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Religion</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="religion-enabled"
// //                 checked={preferences.religion.weight.enabled}
// //                 onChange={(e) => handleWeightChange('religion', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="religion-enabled">
// //                 {preferences.religion.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <select
// //               className="form-select"
// //               value={preferences.religion.value || ''}
// //               onChange={(e) => handleFieldChange('religion', e.target.value || null)}
// //               disabled={!preferences.religion.weight.enabled}
// //             >
// //               <option value="">Any Religion</option>
// //               {religions.map((religion) => (
// //                 <option key={religion} value={religion}>
// //                   {religion}
// //                 </option>
// //               ))}
// //             </select>
            
// //             <div className="mt-3">
// //               <label htmlFor="religion-importance" className="form-label">
// //                 Importance: {preferences.religion.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="religion-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.religion.weight.weight}
// //                 onChange={(e) => handleWeightChange('religion', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.religion.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Caste Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Caste</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="caste-enabled"
// //                 checked={preferences.caste.weight.enabled}
// //                 onChange={(e) => handleWeightChange('caste', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="caste-enabled">
// //                 {preferences.caste.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <select
// //               className="form-select"
// //               value={preferences.caste.value || ''}
// //               onChange={(e) => handleFieldChange('caste', e.target.value || null)}
// //               disabled={!preferences.caste.weight.enabled}
// //             >
// //               <option value="">Any Caste</option>
// //               {castes.map((caste) => (
// //                 <option key={caste} value={caste}>
// //                   {caste}
// //                 </option>
// //               ))}
// //             </select>
            
// //             <div className="mt-3">
// //               <label htmlFor="caste-importance" className="form-label">
// //                 Importance: {preferences.caste.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="caste-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.caste.weight.weight}
// //                 onChange={(e) => handleWeightChange('caste', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.caste.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Education Section */}
// //       <div className="card mb-4">
// //         <div className="card-body">
// //           <div className="d-flex justify-content-between align-items-center">
// //             <h3 className="h5 mb-0">Education</h3>
// //             <div className="form-check form-switch">
// //               <input
// //                 className="form-check-input"
// //                 type="checkbox"
// //                 id="education-enabled"
// //                 checked={preferences.education.weight.enabled}
// //                 onChange={(e) => handleWeightChange('education', 'enabled', e.target.checked)}
// //               />
// //               <label className="form-check-label" htmlFor="education-enabled">
// //                 {preferences.education.weight.enabled ? 'Enabled' : 'Disabled'}
// //               </label>
// //             </div>
// //           </div>
          
// //           <div className="mt-3">
// //             <select
// //               className="form-select"
// //               value={preferences.education.value || ''}
// //               onChange={(e) => handleFieldChange('education', e.target.value || null)}
// //               disabled={!preferences.education.weight.enabled}
// //             >
// //               <option value="">Any Education Level</option>
// //               {educationLevels.map((level) => (
// //                 <option key={level} value={level}>
// //                   {level}
// //                 </option>
// //               ))}
// //             </select>
            
// //             <div className="mt-3">
// //               <label htmlFor="education-importance" className="form-label">
// //                 Importance: {preferences.education.weight.weight}%
// //               </label>
// //               <input
// //                 type="range"
// //                 className="form-range"
// //                 id="education-importance"
// //                 min={0}
// //                 max={100}
// //                 value={preferences.education.weight.weight}
// //                 onChange={(e) => handleWeightChange('education', 'weight', parseInt(e.target.value))}
// //                 disabled={!preferences.education.weight.enabled}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Save Button */}
// //       <div className="d-flex justify-content-end mb-3">
// //         {saveMessage && (
// //           <div className={`alert alert-${saveMessage.type} me-3 mb-0`} role="alert">
// //             {saveMessage.text}
// //           </div>
// //         )}
// //         <Button 
// //           onClick={savePreferences}
// //           disabled={isSaving}
// //         >
// //           {isSaving ? 'Saving...' : 'Save Preferences'}
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // }