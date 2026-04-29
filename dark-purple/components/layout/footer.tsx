import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 text-white mt-auto relative">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <h3 className="font-semibold text-white mb-4">My Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account/gift-cards" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/account/registries" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Registries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account/support" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Manage Addresses
                </Link>
              </li>
              <li>
                <Link href="/account/payments" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faith-integrity" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Faith Integrity
                </Link>
              </li>
              <li>
                <Link href="/why-handmade" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Why Handmade
                </Link>
              </li>
              <li>
                <Link href="/why-not-machine-made" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Why Not Machine-Made
                </Link>
              </li>
              <li>
                <Link href="/become-vendor" className="text-rose-gold hover:text-rose-gold/80 transition-colors text-sm font-medium">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Stewardship</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faith-integrity#aligned-institutions" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Aligned Institutions
                </Link>
              </li>
              <li>
                <Link href="/craft-responsibility" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Craft Responsibility
                </Link>
              </li>
              <li>
                <Link href="/ethical-fulfillment" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Ethical Fulfillment
                </Link>
              </li>
              <li>
                <Link href="/sustainability-care" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Sustainability & Care
                </Link>
              </li>
              <li>
                <Link href="/data-privacy" className="text-white/60 hover:text-white/90 transition-colors text-sm">
                  Data & Privacy Integrity
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/90 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/90 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/90 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white/90 transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-white/50 text-sm">
              Join our community for reflection, guidance, and meaningful connection
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center py-12">
          <Link href="/brand-identity" className="block relative w-96 h-48 opacity-90 hover:opacity-100 transition-opacity">
            <Image
              src="/purpule_soul_by_dkc.png"
              alt="Purple Soul by DKC"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        <div className="text-center space-y-3 pt-8 border-t border-white/20">
          <p className="text-white/90 text-sm">
            Prime Logic Solutions, USA serves as the technical steward of this platform.
          </p>
          <p className="text-white/90 text-sm">
            Purple Soul Collective is an initiative of De Koshur Crafts, USA.
          </p>
          <p className="text-white text-sm font-semibold">
            &copy; {new Date().getFullYear()} Purple Soul Collective by De Koshur Crafts, USA.
          </p>
          <p className="text-white/80 text-sm">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
