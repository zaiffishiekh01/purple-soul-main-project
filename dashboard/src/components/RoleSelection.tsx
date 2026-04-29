import { useNavigate } from 'react-router-dom';
import { Building2, Store } from 'lucide-react';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Welcome to Purple Soul Collective by DKC
          </h1>
          <p className="text-lg text-slate-600 mb-2">
            Faith Based Big Ecommerce
          </p>
          <p className="text-slate-500">
            Choose your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => navigate('/login/vendor')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Store className="w-12 h-12 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Vendor Portal
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Manage your products, orders, inventory, and grow your business with our comprehensive vendor tools
                </p>
              </div>

              <div className="pt-4 w-full">
                <div className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  Sign in as Vendor
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/login/admin')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-emerald-500"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-12 h-12 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Admin Portal
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Oversee the entire marketplace, manage vendors, monitor performance, and control platform operations
                </p>
              </div>

              <div className="pt-4 w-full">
                <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                  Sign in as Admin
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8 text-sm text-slate-500">
          Not sure which portal you need? Contact support for assistance
        </div>
      </div>
    </div>
  );
}
