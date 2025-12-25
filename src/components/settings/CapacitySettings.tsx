import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCapacitySettings } from '@/hooks/useCapacitySettings';
import { Loader2, Save } from 'lucide-react';

export function CapacitySettings() {
  const { settings, isLoading, updateSettings } = useCapacitySettings();
  const [formData, setFormData] = useState<{
    weekly_capacity_hours: number;
    role_multiplier_lead: number;
    role_multiplier_contributor: number;
    complexity_low: number;
    complexity_medium: number;
    complexity_high: number;
  } | null>(null);

  // Initialize form data when settings load
  if (settings && !formData) {
    setFormData({
      weekly_capacity_hours: settings.weekly_capacity_hours,
      role_multiplier_lead: settings.role_multiplier_lead,
      role_multiplier_contributor: settings.role_multiplier_contributor,
      complexity_low: settings.complexity_low,
      complexity_medium: settings.complexity_medium,
      complexity_high: settings.complexity_high,
    });
  }

  const handleSave = () => {
    if (!formData) return;
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacity Configuration</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!formData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacity Configuration</CardTitle>
        <CardDescription>
          Configure workload calculation parameters. Changes apply globally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Capacity */}
        <div className="space-y-2">
          <Label htmlFor="weekly_capacity">Weekly Working Hours</Label>
          <Input
            id="weekly_capacity"
            type="number"
            min={1}
            max={168}
            value={formData.weekly_capacity_hours}
            onChange={(e) => setFormData({ ...formData, weekly_capacity_hours: parseInt(e.target.value) || 40 })}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            Standard weekly capacity per person (default: 40 hours)
          </p>
        </div>

        {/* Role Multipliers */}
        <div className="space-y-3">
          <h4 className="font-medium">Role Multipliers</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Multipliers applied to allocated hours based on role responsibility level.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mult_lead">Lead</Label>
              <Input
                id="mult_lead"
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={formData.role_multiplier_lead}
                onChange={(e) => setFormData({ ...formData, role_multiplier_lead: parseFloat(e.target.value) || 1.2 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mult_contributor">Contributor</Label>
              <Input
                id="mult_contributor"
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={formData.role_multiplier_contributor}
                onChange={(e) => setFormData({ ...formData, role_multiplier_contributor: parseFloat(e.target.value) || 1.0 })}
              />
            </div>
          </div>
        </div>

        {/* Complexity Multipliers */}
        <div className="space-y-3">
          <h4 className="font-medium">Complexity Multipliers</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Multipliers applied based on initiative complexity level.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="comp_low">Low</Label>
              <Input
                id="comp_low"
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={formData.complexity_low}
                onChange={(e) => setFormData({ ...formData, complexity_low: parseFloat(e.target.value) || 0.8 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="comp_medium">Medium</Label>
              <Input
                id="comp_medium"
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={formData.complexity_medium}
                onChange={(e) => setFormData({ ...formData, complexity_medium: parseFloat(e.target.value) || 1.0 })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="comp_high">High</Label>
              <Input
                id="comp_high"
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={formData.complexity_high}
                onChange={(e) => setFormData({ ...formData, complexity_high: parseFloat(e.target.value) || 1.3 })}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
