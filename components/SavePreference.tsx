// components/PreferenceForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { UserPreferences } from '@/types/preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { saveUserPreferences } from '@/utils/preferenceHelper';

export default function PreferenceForm({
  initialPreferences,
  onPreferencesChange,
  districts,
  religions,
  castes,
  educationLevels,
  userId
}: PreferenceFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<UserPreferences>({
    defaultValues: initialPreferences
  });

  const onSubmit = async (data: UserPreferences) => {
    try {
      await saveUserPreferences(userId, data);
      onPreferencesChange(data);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Age Range Section */}
      <div className="space-y-2">
        <Label>Age Range</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            {...register('ageRange.min', { valueAsNumber: true, min: 18, max: 100 })}
          />
          <span>to</span>
          <Input
            type="number"
            {...register('ageRange.max', { valueAsNumber: true, min: 18, max: 100 })}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Switch
            checked={watch('ageRange.weight.enabled')}
            onCheckedChange={(checked) => setValue('ageRange.weight.enabled', checked)}
          />
          <Label>Enable Age Matching</Label>
          <Input
            type="number"
            {...register('ageRange.weight.weight', { valueAsNumber: true, min: 0, max: 100 })}
            className="w-20 ml-4"
          />
          <Label>Weight</Label>
        </div>
      </div>

      {/* Height Range Section */}
      <div className="space-y-2">
        <Label>Height Range (cm)</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            {...register('heightRange.min', { valueAsNumber: true, min: 100, max: 250 })}
          />
          <span>to</span>
          <Input
            type="number"
            {...register('heightRange.max', { valueAsNumber: true, min: 100, max: 250 })}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Switch
            checked={watch('heightRange.weight.enabled')}
            onCheckedChange={(checked) => setValue('heightRange.weight.enabled', checked)}
          />
          <Label>Enable Height Matching</Label>
          <Input
            type="number"
            {...register('heightRange.weight.weight', { valueAsNumber: true, min: 0, max: 100 })}
            className="w-20 ml-4"
          />
          <Label>Weight</Label>
        </div>
      </div>

      {/* Add similar sections for other preferences */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Preferencessss'}
      </Button>
    </form>
  );
}

