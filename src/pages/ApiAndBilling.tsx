import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CreditCard,
  Key,
  Copy,
  Eye,
  EyeOff,
  Check,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";

const ApiAndBilling = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock data
  const currentPlan = "Starter (PAYG)";
  const usageThisMonth = 47;
  const usageLimit = 100;
  const costThisMonth = 14100; // in rupees
  const apiKey = "educhain_live_sk_a1b2c3d4e5f6g7h8i9j0";

  const pricingPlans = [
    {
      name: "Starter (PAYG)",
      target: "SMEs",
      price: "₹300",
      usdPrice: "$3.75",
      perUnit: "per verification",
      features: [
        "Pay as you go",
        "No monthly commitment",
        "Rate limited to 100/month",
        "Email support",
        "Basic analytics"
      ],
      current: true
    },
    {
      name: "Pro",
      target: "Growth HR Teams",
      price: "₹240",
      usdPrice: "$3.00",
      perUnit: "per verification",
      features: [
        "Min 200 verifications/month",
        "Priority support",
        "Advanced analytics",
        "Webhook notifications",
        "Custom branding"
      ],
      current: false
    },
    {
      name: "Enterprise",
      target: "Large Organizations & ATS",
      price: "Custom",
      usdPrice: "Custom",
      perUnit: "pricing",
      features: [
        "Volume discounts",
        "SLA guarantees",
        "SSO integration",
        "Audit exports",
        "Dedicated support",
        "Custom integrations"
      ],
      current: false
    }
  ];

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({
      title: "API Key Copied",
      description: "Your API key has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Method Added",
      description: "Your payment method has been successfully added.",
    });
  };

  const handleUpgradePlan = (planName: string) => {
    toast({
      title: "Plan Upgrade Request",
      description: `Request to upgrade to ${planName} has been submitted. Our team will contact you shortly.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Page Header Area */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  API & Billing
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  Manage your API keys, usage, and billing information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Current Plan</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{currentPlan}</div>
                <p className="text-xs text-slate-500 mt-1">
                  ₹300 per verification
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Usage This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{usageThisMonth} / {usageLimit}</div>
                <Progress value={(usageThisMonth / usageLimit) * 100} className="mt-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                <p className="text-xs text-slate-500 mt-1">
                  {usageLimit - usageThisMonth} verifications remaining
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Cost This Month</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">₹{costThisMonth.toLocaleString('en-IN')}</div>
                <p className="text-xs text-slate-500 mt-1">
                  ~${(costThisMonth / 80).toFixed(2)} USD
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
              <TabsTrigger value="payment">Payment Method</TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Key className="h-5 w-5 text-blue-600" />
                    Your API Key
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-slate-700">Live API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          readOnly
                          className="font-mono text-sm pr-10 bg-slate-50 border-slate-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={handleCopyApiKey}
                        variant="outline"
                        className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-slate-900">API Endpoints</h4>
                    <div className="space-y-1 text-sm text-slate-500 font-mono">
                      <div><span className="text-green-600">POST</span> /api/v1/request</div>
                      <div><span className="text-green-600">POST</span> /api/v1/request/:id/approve</div>
                      <div><span className="text-blue-600">GET</span> /api/v1/verify</div>
                      <div><span className="text-green-600">POST</span> /api/v1/grant/:id/revoke</div>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-xs text-blue-600">
                      View API Documentation →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Usage Headers</CardTitle>
                  <CardDescription className="text-slate-500">
                    These headers are included in API responses for transparency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm space-y-1">
                    <div className="text-slate-500">x-usage-this-month: <span className="text-slate-900">{usageThisMonth}</span></div>
                    <div className="text-slate-500">x-plan: <span className="text-slate-900">{currentPlan}</span></div>
                    <div className="text-slate-500">x-rate-remaining: <span className="text-slate-900">{usageLimit - usageThisMonth}</span></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Plans Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <Card key={plan.name} className={plan.current ? "border-primary shadow-glow" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <CardDescription className="mt-1">{plan.target}</CardDescription>
                        </div>
                        {plan.current && (
                          <Badge variant="default">Current Plan</Badge>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.price !== "Custom" && (
                            <span className="text-sm text-muted-foreground">/ {plan.usdPrice}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{plan.perUnit}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.current ? "outline" : "default"}
                        onClick={() => !plan.current && handleUpgradePlan(plan.name)}
                        disabled={plan.current}
                      >
                        {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Understanding your charges
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Verifications This Month</span>
                      <span className="font-medium">{usageThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Rate per Verification</span>
                      <span className="font-medium">₹300 / $3.75</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold">Total This Month</span>
                      <span className="text-xl font-bold">₹{costThisMonth.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Download Invoice (CSV)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Method Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Add or update your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardholder">Cardholder Name</Label>
                      <Input
                        id="cardholder"
                        placeholder="Mohit Sharma"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billing-email">Billing Email</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        placeholder="billing@company.com"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Add Payment Method
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-primary to-primary/60 rounded flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge variant="default">Default</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiAndBilling;