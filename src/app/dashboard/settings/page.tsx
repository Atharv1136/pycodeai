"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Code, 
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  
  // Mock user data
  const [userSettings, setUserSettings] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '••••••••',
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      codeExecution: true,
      aiSuggestions: true
    },
    privacy: {
      publicProjects: false,
      analytics: true,
      dataSharing: false
    },
    editor: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
      autoSave: true
    }
  })

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleExport = () => {
    toast({
      title: "Data Exported",
      description: "Your settings and projects have been exported successfully.",
    })
  }

  const handleImport = () => {
    toast({
      title: "Data Imported",
      description: "Your settings and projects have been imported successfully.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Account deletion request has been submitted. You will receive an email confirmation.",
      variant: "destructive"
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Pro Plan
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userSettings.password}
                  onChange={(e) => setUserSettings({...userSettings, password: e.target.value})}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your editor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={userSettings.theme} onValueChange={(value) => setUserSettings({...userSettings, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={userSettings.language} onValueChange={(value) => setUserSettings({...userSettings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Editor Preferences
            </CardTitle>
            <CardDescription>
              Configure your coding environment preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="10"
                  max="24"
                  value={userSettings.editor.fontSize}
                  onChange={(e) => setUserSettings({
                    ...userSettings, 
                    editor: {...userSettings.editor, fontSize: parseInt(e.target.value)}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tabSize">Tab Size</Label>
                <Input
                  id="tabSize"
                  type="number"
                  min="2"
                  max="8"
                  value={userSettings.editor.tabSize}
                  onChange={(e) => setUserSettings({
                    ...userSettings, 
                    editor: {...userSettings.editor, tabSize: parseInt(e.target.value)}
                  })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Word Wrap</Label>
                  <p className="text-sm text-muted-foreground">
                    Wrap long lines in the editor
                  </p>
                </div>
                <Switch
                  checked={userSettings.editor.wordWrap}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    editor: {...userSettings.editor, wordWrap: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Minimap</Label>
                  <p className="text-sm text-muted-foreground">
                    Show code overview on the right side
                  </p>
                </div>
                <Switch
                  checked={userSettings.editor.minimap}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    editor: {...userSettings.editor, minimap: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work
                  </p>
                </div>
                <Switch
                  checked={userSettings.editor.autoSave}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    editor: {...userSettings.editor, autoSave: checked}
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    notifications: {...userSettings.notifications, email: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.push}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    notifications: {...userSettings.notifications, push: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Code Execution Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when code execution completes
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.codeExecution}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    notifications: {...userSettings.notifications, codeExecution: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive AI-powered code suggestions
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.aiSuggestions}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    notifications: {...userSettings.notifications, aiSuggestions: checked}
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Projects</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to view your public projects
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.publicProjects}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    privacy: {...userSettings.privacy, publicProjects: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the platform with usage analytics
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.analytics}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    privacy: {...userSettings.privacy, analytics: checked}
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized data for research purposes
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.dataSharing}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings, 
                    privacy: {...userSettings.privacy, dataSharing: checked}
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export, import, or manage your account data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
