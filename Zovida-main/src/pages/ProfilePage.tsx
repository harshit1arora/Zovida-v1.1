import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Dna, 
  Weight, 
  Ruler, 
  AlertCircle, 
  Activity, 
  Contact, 
  Save, 
  ArrowLeft,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { endpoints } from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  weight?: number;
  height?: number;
  allergies?: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      if (!userId) {
        navigate('/auth');
        return;
      }

      try {
        const response = await fetch(endpoints.users.profile(userId));
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch profile data.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    const userId = localStorage.getItem('zovida_user_id');

    try {
      const response = await fetch(endpoints.users.profile(userId!), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast({
          title: "Profile Updated",
          description: "Your information has been saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Header showBack title="My Profile" />

      <main className="container max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar/Quick Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={48} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{profile?.name || 'User Name'}</h2>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Free Tier
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                      <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <Heart size={12} fill="currentColor" /> {profile?.blood_group || 'N/A'}
                      </div>
                      <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold flex items-center gap-1">
                        <Activity size={12} /> {profile?.age || '?'} yrs
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold">Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-muted-foreground" />
                      <span>{profile?.phone || 'No phone added'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Profile Form */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Basic information for your medical profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={profile?.name || ''} 
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                          id="age" 
                          type="number"
                          value={profile?.age || ''} 
                          onChange={(e) => handleChange('age', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profile?.gender} onValueChange={(v) => handleChange('gender', v)}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood_group">Blood Group</Label>
                        <Select value={profile?.blood_group} onValueChange={(v) => handleChange('blood_group', v)}>
                          <SelectTrigger id="blood_group">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input 
                          id="weight" 
                          type="number"
                          step="0.1"
                          value={profile?.weight || ''} 
                          onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input 
                          id="height" 
                          type="number"
                          value={profile?.height || ''} 
                          onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                    <CardDescription>Important data for healthcare providers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea 
                        id="allergies" 
                        placeholder="List any drug or food allergies"
                        value={profile?.allergies || ''} 
                        onChange={(e) => handleChange('allergies', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conditions">Medical Conditions</Label>
                      <Textarea 
                        id="conditions" 
                        placeholder="e.g. Diabetes, Hypertension, Asthma"
                        value={profile?.medical_conditions || ''} 
                        onChange={(e) => handleChange('medical_conditions', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Who to contact in case of an emergency</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_name">Contact Name</Label>
                        <Input 
                          id="emergency_name" 
                          value={profile?.emergency_contact_name || ''} 
                          onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_phone">Contact Phone</Label>
                        <Input 
                          id="emergency_phone" 
                          value={profile?.emergency_contact_phone || ''} 
                          onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-6">
                    <Button type="submit" className="gap-2" disabled={saving}>
                      <Save size={18} />
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
