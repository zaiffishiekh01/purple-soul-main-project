import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function OrderNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-10 h-10 text-white/70" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Order Not Found
            </h1>

            <p className="text-lg text-purple-200/80 mb-8">
              We couldn't find an order with this number. Please check your order confirmation email or contact support for assistance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8">
                  Return to Home
                </Button>
              </Link>

              <Link href="/support">
                <Button
                  variant="outline"
                  className="border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40 px-8"
                >
                  Contact Support
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-purple-200/70 text-sm">
                Need help?{' '}
                <Link href="/support" className="text-purple-300 hover:text-white underline">
                  Get in touch with our support team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
