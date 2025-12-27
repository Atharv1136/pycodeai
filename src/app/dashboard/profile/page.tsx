"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useEditorStore } from '@/lib/store'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Edit,
  Camera,
  Award,
  Code,
  Clock,
  Star,
  AlertCircle,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  name: string
  username: string
  bio: string
  location: string
  website: string
  github: string
  twitter: string
  linkedin: string
  avatarUrl: string
  profileComplete: boolean
  subscription: string
  credits: number
  creditLimit: number
  codeRuns: number
  aiQueries: number
  createdAt: string
  lastActive: string
  openaiApiKey?: string
  geminiApiKey?: string
  hasOpenAiKey: boolean
  hasGeminiKey: boolean
}

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser, projects, getUserStats, dailyCodeRuns, dailyAiQueries } = useEditorStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: ''
  })
  const [stats, setStats] = useState({
    projects: 0,
    codeRuns: 0,
    aiInteractions: 0,
    streak: 0
  })

  // Load profile data from database
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser || !currentUser.id) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/profile')

        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile(data.profile)

            // Load stats
            await getUserStats()
            setStats({
              projects: projects.length,
              codeRuns: dailyCodeRuns || 0,
              aiInteractions: dailyAiQueries || 0,
              streak: 0 // TODO: Calculate from daily stats
            })
          }
        } else if (response.status === 401) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [currentUser, router, getUserStats, projects.length, dailyCodeRuns, dailyAiQueries])

  const handleSave = async () => {
    if (!profile || !currentUser) return

    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          github: profile.github,
          twitter: profile.twitter,
          linkedin: profile.linkedin,
          avatarUrl: profile.avatarUrl,
          openaiApiKey: apiKeys.openai || undefined,
          geminiApiKey: apiKeys.gemini || undefined
        })
      })

      console.log('[Profile] Saving with API keys:', {
        hasOpenAI: !!apiKeys.openai,
        hasGemini: !!apiKeys.gemini,
        openaiLength: apiKeys.openai?.length,
        geminiLength: apiKeys.gemini?.length
      });

      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)

          // Update global store
          const { updateCurrentUser } = useEditorStore.getState();
          updateCurrentUser({
            name: data.profile.name,
            username: data.profile.username,
            bio: data.profile.bio,
            location: data.profile.location,
            website: data.profile.website,
            github: data.profile.github,
            twitter: data.profile.twitter,
            linkedin: data.profile.linkedin,
            avatarUrl: data.profile.avatarUrl,
            profileComplete: data.profile.profileComplete
          });

          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
          })
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update profile.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = () => {
    toast({
      title: "Coming Soon",
      description: "Avatar upload feature will be available soon.",
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load profile.</p>
        </div>
      </div>
    )
  }

  const isProfileIncomplete = !profile.profileComplete
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your public profile and showcase your coding journey
          </p>
        </div>
        <Badge variant={profile.subscription === 'pro' || profile.subscription === 'team' ? "default" : "secondary"} className="text-sm">
          {profile.subscription === 'team' ? 'Team' : profile.subscription === 'pro' ? 'Pro' : 'Free'} Member
        </Badge>
      </div>

      {isProfileIncomplete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Complete your profile!</strong> Please fill in your name, username, and bio to complete your profile setup.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8"
                    onClick={handleAvatarUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile.name || 'No name'}</h2>
                  <p className="text-muted-foreground">@{profile.username || 'no-username'}</p>
                  <p className="text-sm text-muted-foreground mt-2">{profile.bio || 'No bio yet'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Social Links</h4>
                <div className="flex gap-2">
                  {profile.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {profile.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.projects}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.codeRuns}</div>
                  <div className="text-sm text-muted-foreground">Code Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.aiInteractions}</div>
                  <div className="text-sm text-muted-foreground">AI Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.streak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update your personal information and bio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={profile.username || ''}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="Choose a username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      github.com/
                    </span>
                    <Input
                      id="github"
                      className="rounded-l-none"
                      value={profile.github || ''}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="twitter"
                      className="rounded-l-none"
                      value={profile.twitter || ''}
                      onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      linkedin.com/in/
                    </span>
                    <Input
                      id="linkedin"
                      className="rounded-l-none"
                      value={profile.linkedin || ''}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your AI service API keys for OpenAI and Gemini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your API keys are encrypted and stored securely. They are never shared or exposed.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type={showApiKeys ? "text" : "password"}
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      placeholder={profile?.hasOpenAiKey ? profile.openaiApiKey || "sk-...****" : "sk-..."}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                    >
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Gemini API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gemini-key"
                      type={showApiKeys ? "text" : "password"}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                      placeholder={profile?.hasGeminiKey ? profile.geminiApiKey || "AIza...****" : "AIza..."}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" disabled={saving}>
              <Edit className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
