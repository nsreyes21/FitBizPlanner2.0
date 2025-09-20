import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stepper } from "@/components/ui/stepper"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { generatePlan, savePlan } from "@/lib/planHelpers"

interface BuildPlanWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  businessType: string
  location: string
}

interface AIData {
  title: string
  summary: string
  highlights: string[]
  months: Array<{
    month: number
    title: string
    category: string
    details: string
  }>
}

export function BuildPlanWizard({ open, onOpenChange }: BuildPlanWizardProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({ businessType: "", location: "" })
  const [ai, setAi] = useState<{ loading: boolean; result?: AIData }>({ loading: false })
  const [previewIndex, setPreviewIndex] = useState(0)
  const [email, setEmail] = useState("")
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  // Check if user is signed in
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const businessTypes = [
    "CrossFit",
    "Martial Arts", 
    "Strength & Conditioning",
    "Yoga",
    "Pilates",
    "Dance",
    "Boxing",
    "Personal Training",
    "Group Fitness",
    "Other"
  ]

  const handleGeneratePlan = async () => {
    if (!form.businessType || !form.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in both business type and location.",
        variant: "destructive"
      })
      return
    }

    setAi({ loading: true })
    try {
      const result = await generatePlan(form)
      setAi({ loading: false, result })
      setStep(2)
    } catch (error) {
      setAi({ loading: false })
      toast({
        title: "Generation Failed",
        description: "Failed to generate plan. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEmailSignIn = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    setIsEmailLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      toast({
        title: "Check Your Email",
        description: "We sent you a magic link to sign in."
      })
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleSavePlan = async () => {
    if (!user || !ai.result) return

    try {
      await savePlan(user.id, form, ai.result)
      toast({
        title: "Plan Saved!",
        description: "Your fitness business plan has been saved to your account."
      })
      onOpenChange(false)
      // Reset form
      setStep(1)
      setForm({ businessType: "", location: "" })
      setAi({ loading: false })
      setPreviewIndex(0)
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Select value={form.businessType} onValueChange={(value) => setForm(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your fitness business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={form.location}
            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleGeneratePlan} 
        disabled={ai.loading}
        className="w-full"
      >
        {ai.loading ? "Generating Plan..." : "Generate Plan"}
      </Button>
    </div>
  )

  const renderStep2 = () => {
    if (!ai.result) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{ai.result.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">{ai.result.summary}</p>
            <div className="space-y-2">
              <h4 className="font-medium">Key Highlights:</h4>
              <div className="flex flex-wrap gap-2">
                {ai.result.highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary">{highlight}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button onClick={() => setStep(3)} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => {
    if (!ai.result) return null

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {ai.result.months.map((month, index) => (
            <div key={index} className={index > 0 ? "locked" : ""}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Month {month.month}</CardTitle>
                    <Badge variant="outline">{month.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="font-medium">{month.title}</h4>
                  <p className="text-sm text-muted-foreground">{month.details}</p>
                </CardContent>
              </Card>
              
              {index > 0 && !user && (
                <div className="veil">
                  <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 text-center">
                    <h3 className="font-medium mb-2">Sign in to view full plan</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                      />
                      <Button 
                        onClick={handleEmailSignIn} 
                        disabled={isEmailLoading}
                        size="sm"
                      >
                        {isEmailLoading ? "Sending..." : "Continue"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button onClick={() => setStep(4)} className="flex-1" disabled={!user}>
            Continue
          </Button>
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Save Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Your personalized fitness business plan is ready to be saved to your account.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Business Type:</span>
              <span className="text-sm font-medium">{form.businessType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Location:</span>
              <span className="text-sm font-medium">{form.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan Items:</span>
              <span className="text-sm font-medium">{ai.result?.months.length || 0} months</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleSavePlan} className="flex-1">
          Save to My Account
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build My Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Stepper current={step} steps={["Info", "Summary", "Preview", "Save"]} />
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
