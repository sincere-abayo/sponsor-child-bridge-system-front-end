import React from 'react'
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <header
        className="relative flex items-center justify-center h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: 'url("https://media.sciencephoto.com/image/p9100076/800wm")' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Connecting Sponsors with Those in Need
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            SponsorBridge helps connect generous sponsors with individuals in need of support for education, healthcare, and more.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="bg-white text-blue-700 px-6 py-2 rounded font-semibold hover:bg-gray-100"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border border-white text-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-blue-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-700">5,000+</div>
            <div className="text-gray-600">Sponsors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-700">12,000+</div>
            <div className="text-gray-600">Recipients</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-700">$2.5M+</div>
            <div className="text-gray-600">Funds Raised</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-700">30+</div>
            <div className="text-gray-600">Countries</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="text-blue-700 font-semibold uppercase mb-2">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A better way to give and receive support</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to connect sponsors with those who need support through a simple, transparent process.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded shadow p-6">
            <div className="text-blue-700 text-4xl mb-4">👤</div>
            <h3 className="font-bold text-xl mb-2">Create an Account</h3>
            <p className="text-gray-600">
              Sign up as a sponsor or as someone seeking support. Complete your profile with relevant information to get started.
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-blue-700 text-4xl mb-4">🤝</div>
            <h3 className="font-bold text-xl mb-2">Connect</h3>
            <p className="text-gray-600">
              Sponsors can browse through profiles of individuals seeking support. Recipients can showcase their needs and goals.
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <div className="text-blue-700 text-4xl mb-4">📈</div>
            <h3 className="font-bold text-xl mb-2">Support &amp; Track</h3>
            <p className="text-gray-600">
              Establish sponsorships, track progress, and communicate directly through our secure platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <div className="text-blue-700 font-semibold uppercase mb-2">Features</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to make a difference</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-2">
                <span className="bg-blue-700 text-white rounded p-2 mr-3">🎓</span>
                <span className="font-semibold text-lg">Educational Support</span>
              </div>
              <div className="ml-10 text-gray-600">
                Support students with tuition, books, supplies, and mentorship to help them achieve their educational goals.
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="bg-blue-700 text-white rounded p-2 mr-3">💬</span>
                <span className="font-semibold text-lg">Direct Communication</span>
              </div>
              <div className="ml-10 text-gray-600">
                Our platform enables secure, direct communication between sponsors and recipients to build meaningful relationships.
              </div>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <span className="bg-blue-700 text-white rounded p-2 mr-3">🔒</span>
                <span className="font-semibold text-lg">Secure &amp; Transparent</span>
              </div>
              <div className="ml-10 text-gray-600">
                All transactions and communications are secure, with full transparency on how funds are being used.
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://globaladvocacyafrica.org/wp-content/uploads/2018/12/AFRICAN-CHILD-2.jpg"
              alt="Students studying"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative text-white py-16"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-blue-900 opacity-80"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-lg md:text-xl mb-6">
            Join our community today and start making a positive impact in someone's life.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="bg-white text-blue-700 px-6 py-2 rounded font-semibold hover:bg-gray-100"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border border-white text-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-blue-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}