import React from 'react'

export default function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <header className="relative flex items-center justify-center h-[70vh] bg-gradient-to-br from-green-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            SponsorBridge
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connecting generous sponsors with children in need across Rwanda
          </p>
          <p className="text-lg mb-8 text-green-100">
            Empowering education, building futures, one child at a time
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-green-600">150+</div>
            <div className="text-gray-600 font-medium">Sponsors</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">300+</div>
            <div className="text-gray-600 font-medium">Children Helped</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-yellow-600">25M+</div>
            <div className="text-gray-600 font-medium">RWF Raised</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">5</div>
            <div className="text-gray-600 font-medium">Provinces</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Simple steps to connect sponsors with children in need
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">👤</div>
            <h3 className="font-bold text-xl mb-4">Create Profile</h3>
            <p className="text-gray-600">
              Sign up as a sponsor or sponsee. Complete your profile with basic information.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-blue-600 text-5xl mb-4">🤝</div>
            <h3 className="font-bold text-xl mb-4">Connect</h3>
            <p className="text-gray-600">
              Sponsors browse children's profiles. Sponsees share their needs and goals.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">📚</div>
            <h3 className="font-bold text-xl mb-4">Support</h3>
            <p className="text-gray-600">
              Establish sponsorship and track progress. Help children achieve their dreams.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose SponsorBridge?</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-green-100 text-green-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Education Focus</h3>
                <p className="text-gray-600">
                  Supporting children's education through school fees, books, and supplies.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Local Impact</h3>
                <p className="text-gray-600">
                  Focused on helping children across Rwanda's five provinces.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Safe & Secure</h3>
                <p className="text-gray-600">
                  Verified profiles and secure transactions for peace of mind.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8">
              <div className="text-6xl mb-4">🇷🇼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Made for Rwanda</h3>
              <p className="text-gray-600">
                Designed specifically for the Rwandan context and education system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg md:text-xl mb-8 text-green-100">
            Join our community and help children in Rwanda achieve their dreams.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-gray-400">
            © 2024 SponsorBridge - Academic Project for Rwanda
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Connecting sponsors with children in need across Rwanda
          </p>
        </div>
      </footer>
    </div>
  )
}