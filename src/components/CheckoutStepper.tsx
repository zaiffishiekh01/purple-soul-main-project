import { useNavigate, useLocation } from 'react-router-dom';
import { Check, User, MapPin, Truck, CreditCard, FileText } from 'lucide-react';

const steps = [
  { id: 'customer', label: 'Customer', icon: User },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileText },
];

const stepOrder = steps.map((s) => s.id);

export default function CheckoutStepper({ currentStep }: { currentStep: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = stepOrder.indexOf(currentStep);

  const handleStepClick = (stepId: string) => {
    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex <= currentIndex) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('step', stepId);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  return (
    <nav className="w-full bg-surface border-default rounded-xl shadow-theme-sm p-4 md:p-6">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;
          const isClickable = index <= currentIndex;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  group flex items-center gap-2 md:gap-3 focus:outline-none
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                <div className="relative flex items-center justify-center">
                  {/* Circle */}
                  <div
                    className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full
                      transition-all duration-300
                      ${isCurrent
                        ? 'bg-surface border-2 border-purple-600 shadow-theme-sm'
                        : isCompleted
                          ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-transparent'
                          : 'bg-surface-deep border border-default'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-text-inverse" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${
                          isCurrent
                            ? 'text-purple-600'
                            : isUpcoming
                              ? 'text-muted'
                              : 'text-icon-default'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step number badge for upcoming */}
                  {isUpcoming && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface-deep border border-default flex items-center justify-center">
                      <span className="text-xs text-muted">{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    hidden md:block text-sm font-medium whitespace-nowrap
                    ${isCurrent
                      ? 'text-purple-600'
                      : isCompleted
                        ? 'text-secondary'
                        : 'text-muted'
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Progress line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 md:mx-4 h-0.5 bg-surface-deep rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-500 ease-out
                      ${isCompleted
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 w-full'
                        : 'bg-default w-0'
                      }
                    `}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
