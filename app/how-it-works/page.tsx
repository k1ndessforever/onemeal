'use client';

import Link from 'next/link';
import { MapPin, Shield, Heart, TrendingUp, Database, Lock, Globe, ArrowLeft, CheckCircle } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
            How OneMeal Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, privacy-first platform that turns your compassion into measurable global impact
          </p>
        </div>

        {/* Step-by-Step Process */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Three Simple Steps to Make a Difference
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Feed a Stray</h3>
                <p className="text-gray-600 text-center">
                  Give food to a stray dog, cat, or any animal in need. Every meal matters, no matter how small.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Tap One Button</h3>
                <p className="text-gray-600 text-center">
                  Open OneMeal and click "I Fed a Stray Today". We'll capture your approximate location (rounded for privacy).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">See Global Impact</h3>
                <p className="text-gray-600 text-center">
                  Watch your contribution appear on the global map and inspire others. Track your personal streak!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="mb-20 bg-white rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Privacy by Design</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy is not negotiable. We've built OneMeal from the ground up with privacy as the foundation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Account Required</h3>
                <p className="text-gray-600 text-sm">
                  No email, no password, no username. Just open the app and start making a difference. Zero friction.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location Rounding</h3>
                <p className="text-gray-600 text-sm">
                  Your GPS coordinates are rounded to ~111 meters (3 decimal places). We never know your exact location.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Local Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Your personal stats live only in your browser. We never see them. Export or delete anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto Data Deletion</h3>
                <p className="text-gray-600 text-sm">
                  Raw feed data is automatically deleted after 90 days. Only aggregated stats remain (no personal data).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Rate Limiting</h3>
                <p className="text-gray-600 text-sm">
                  Maximum 10 submissions per day to prevent spam and abuse. Protects both users and animals.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Tracking Scripts</h3>
                <p className="text-gray-600 text-sm">
                  No Google Analytics, no Facebook Pixel, no advertising trackers. Just clean, ethical code.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Built on Modern, Secure Technology
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <Database className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Serverless Database</h3>
              <p className="text-sm text-gray-600">
                Neon Postgres with automatic scaling. Your data is encrypted at rest and in transit.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <Lock className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">HTTPS Only</h3>
              <p className="text-sm text-gray-600">
                All communication is encrypted with TLS. No plain HTTP, no exceptions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <Shield className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Security Headers</h3>
              <p className="text-sm text-gray-600">
                Content Security Policy, XSS protection, and strict referrer policies protect you.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Why do you need my location?</h3>
              <p className="text-gray-600 text-sm">
                We need approximate location to create the global impact map. Your coordinates are rounded to ~111m and we never store your exact location.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Can I use this without location access?</h3>
              <p className="text-gray-600 text-sm">
                Unfortunately, no. Location is essential to create the global heatmap. But you can still view the map and see others' contributions!
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Is this app free?</h3>
              <p className="text-gray-600 text-sm">
                Yes! OneMeal is completely free and will always be free. No ads, no premium tiers, no hidden costs. Just compassion.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Can someone find me through this app?</h3>
              <p className="text-gray-600 text-sm">
                No. Your location is rounded to a ~111m radius (about a city block). We don't store any identifiable information. You're completely anonymous.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">What happens to my data?</h3>
              <p className="text-gray-600 text-sm">
                Raw feed records are automatically deleted after 90 days. Only aggregated, anonymized statistics remain for the map.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-12 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of compassionate people feeding strays worldwide
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Start Feeding 🐾
            </Link>
            <Link
              href="/map"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition-all"
            >
              View Global Map 🗺️
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}