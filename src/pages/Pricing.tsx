import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for trying out our platform",
      features: [
        "Generate up to 5 question papers per month",
        "Basic question templates",
        "PDF export",
        "Standard support",
      ],
      buttonText: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹299",
      period: "per month",
      description: "Ideal for teachers and small institutions",
      features: [
        "Generate unlimited question papers",
        "Custom header upload",
        "PDF & Word export",
        "Advanced question templates",
        "Syllabus AI analysis",
        "Priority support",
        "Question bank access",
      ],
      buttonText: "Upgrade To Pro",
      popular: true,
    },
    {
      name: "Institution",
      price: "₹999",
      period: "per month",
      description: "Best for schools and colleges",
      features: [
        "Everything in Pro",
        "Multiple user accounts (up to 50)",
        "Institution branding",
        "Advanced analytics",
        "Bulk question generation",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  /**
   * Handles button clicks: navigates to checkout for Pro, contact form for Institution, 
   * and signup for Free.
   * @param planName The name of the plan clicked.
   * @param price The full price string (e.g., "₹299").
   */
const handleButtonClick = (planName: string, price: string) => {
  if (planName === "Institution") {
    navigate("/support#form");
  } else if (planName === "Pro") {
    const rawPrice = price.replace('₹', '');
    navigate(`/checkout/${planName.toLowerCase()}`, { 
      state: { 
        price: rawPrice, 
        period: 'month' 
      } 
    });
  } else if (planName === "Free") {
    navigate("/login");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation - Enhanced responsiveness */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                // Adjusted logo size for better mobile/desktop balance
                className="h-12 sm:h-14 w-auto object-contain" 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Header - Enhanced responsiveness */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Choose the perfect plan for your question paper generation needs. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards Grid - Responsive gap and focus */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`
                relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl transition-all duration-300 h-full
                ${plan.popular 
                  ? 'border-4 border-indigo-500 shadow-2xl scale-[1.02] bg-white dark:bg-slate-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:shadow-lg dark:bg-slate-800/50'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex-grow">
                {/* Card Header */}
                <CardHeader className="text-center p-0 pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-600 dark:text-slate-400 text-lg ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{plan.description}</p>
                </CardHeader>
                
                {/* Card Content - Features List */}
                <CardContent className="p-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              {/* Card Footer - Button */}
              <div className="mt-6">
                <Button
                  className={`w-full text-base font-semibold py-6 transition duration-150
                    ${plan.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }
                  `}
                  size="lg"
                  // *** UPDATED BUTTON HANDLER ***
                  onClick={() => handleButtonClick(plan.name, plan.price)} 
                >
                  {plan.buttonText}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Institution-Specific Highlight Section - Adjusted for better responsiveness */}
        <div className="text-center py-8 sm:py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Looking for a Custom Solution?
            </h2>
            <Card className="w-full max-w-lg mx-auto border-indigo-500 shadow-xl dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-indigo-500">Institution & Enterprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Perfect for large colleges, school chains, or coaching centers requiring custom features and integrations.
                </p>
                <ul className="list-disc list-inside text-left mx-auto max-w-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <li><Check className="inline-block w-4 h-4 mr-1 text-green-500" /> Dedicated Account Manager</li>
                  <li><Check className="inline-block w-4 h-4 mr-1 text-green-500" /> Custom API Rate Limits</li>
                  <li><Check className="inline-block w-4 h-4 mr-1 text-green-500" /> On-premise setup option</li>
                </ul>
                <Button 
                    onClick={() => handleButtonClick("Institution", "0")} // Price is ignored for Institution
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                >
                    Request a Consultation
                </Button>
              </CardContent>
            </Card>
        </div>


        {/* FAQ - Refined typography and spacing */}
        <div className="text-center mt-12 sm:mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, upgrades and downgrades can be done immediately from your dashboard. We'll prorate the charge/refund.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Is there a free trial for Pro plans?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, all our paid plans come with a 14-day risk-free trial. No credit card is required to start the trial.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-600 dark:text-slate-400">We accept all major credit/debit cards, Net Banking, and UPI payments through a secure payment gateway.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Do you offer educational discounts?</h3>
              <p className="text-slate-600 dark:text-slate-400">Yes, contact our sales team for special bulk and annual educational discounts for institutions.</p>
            </div>
          </div>
        </div>

        {/* CTA - Bold, contrasting background */}
        <div className="text-center mt-16 bg-slate-900 dark:bg-indigo-800 rounded-3xl p-10 sm:p-16 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Revolutionize Paper Generation?</h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
            Join thousands of educators using our AI-powered question generator today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100 dark:hover:text-slate-900 font-semibold py-3 sm:py-6 px-8 text-base shadow-lg"
              onClick={() => handleButtonClick("Free", "0")} // Call handleButtonClick for the Free plan
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-slate-900 border-white hover:bg-white hover:text-slate-900 dark:hover:text-slate-900 font-semibold py-3 sm:py-6 px-8 text-base transition duration-150"
              onClick={() => navigate("/support")} // Example: Navigate to the full support/demo page
            >
              Upgrade To Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;