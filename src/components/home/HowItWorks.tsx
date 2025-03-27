export default function HowItWorks() {
    const steps = [
      {
        number: 1,
        title: "Create Your Agent",
        description: "Click the \"Create Agent\" button to start building your personalized AI assistant."
      },
      {
        number: 2,
        title: "Select Software",
        description: "Choose which applications your AI agent should have access to."
      },
      {
        number: 3,
        title: "Start Chatting",
        description: "Begin interacting with your new AI agent through our intuitive chat interface."
      }
    ];
  
    return (
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center mb-8 md:mb-0 md:mx-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }