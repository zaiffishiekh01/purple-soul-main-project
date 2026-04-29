'use client';

import { Check } from 'lucide-react';
import { usePathname } from 'next/navigation';

const steps = [
  { id: 1, name: 'Customer', path: '/checkout/customer' },
  { id: 2, name: 'Address', path: '/checkout/address' },
  { id: 3, name: 'Delivery', path: '/checkout/delivery' },
  { id: 4, name: 'Payment', path: '/checkout/payment' },
  { id: 5, name: 'Review', path: '/checkout/review' }
];

export function CheckoutStepper() {
  const pathname = usePathname();

  const currentStepIndex = steps.findIndex(step => pathname === step.path);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;

  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
                      ${isCurrent ? 'bg-white text-purple-600 ring-4 ring-purple-500/30' : ''}
                      ${isUpcoming ? 'bg-white/10 text-white/50 border-2 border-white/20' : ''}
                    `}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span
                    className={`
                      mt-2 text-sm font-medium hidden sm:block
                      ${isCompleted || isCurrent ? 'text-white' : 'text-white/40'}
                    `}
                  >
                    {step.name}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 relative">
                    <div className="absolute inset-0 bg-white/10" />
                    <div
                      className={`
                        absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500
                        transition-all duration-500
                        ${isCompleted ? 'w-full' : 'w-0'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
