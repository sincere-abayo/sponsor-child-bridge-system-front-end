import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Landing() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div>
      {/* Hero Section */}
      <header className="relative flex items-center justify-center h-[70vh] bg-gradient-to-br from-green-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex space-x-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === 'en' 
                  ? 'bg-white text-green-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('rw')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                i18n.language === 'rw' 
                  ? 'bg-white text-green-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              RW
            </button>
          </div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <p className="text-lg mb-8 text-green-100">
            {t('heroDescription')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              {t('getStarted')}
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              {t('signIn')}
            </a>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-green-600">150+</div>
            <div className="text-gray-600 font-medium">{t('sponsors')}</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">300+</div>
            <div className="text-gray-600 font-medium">{t('childrenHelped')}</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-yellow-600">25M+</div>
            <div className="text-gray-600 font-medium">{t('rwfRaised')}</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-purple-600">5</div>
            <div className="text-gray-600 font-medium">{t('provinces')}</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{t('howItWorks')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t('howItWorksDescription')}
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">👤</div>
            <h3 className="font-bold text-xl mb-4">{t('createProfile')}</h3>
            <p className="text-gray-600">
              {t('createProfileDescription')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-blue-600 text-5xl mb-4">🤝</div>
            <h3 className="font-bold text-xl mb-4">{t('connect')}</h3>
            <p className="text-gray-600">
              {t('connectDescription')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">📚</div>
            <h3 className="font-bold text-xl mb-4">{t('support')}</h3>
            <p className="text-gray-600">
              {t('supportDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{t('whyChoose')}</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-green-100 text-green-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('educationFocus')}</h3>
                <p className="text-gray-600">
                  {t('educationFocusDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('localImpact')}</h3>
                <p className="text-gray-600">
                  {t('localImpactDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3 mr-4">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('safeSecure')}</h3>
                <p className="text-gray-600">
                  {t('safeSecureDescription')}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8">
              <div className="text-6xl mb-4">🇷🇼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('madeForRwanda')}</h3>
              <p className="text-gray-600">
                {t('madeForRwandaDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('readyToMakeDifference')}</h2>
          <p className="text-lg md:text-xl mb-8 text-green-100">
            {t('joinCommunity')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              {t('getStartedToday')}
            </a>
            <a
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              {t('signIn')}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-gray-400">
            {t('footerCopyright')}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t('footerDescription')}
          </p>
        </div>
      </footer>
    </div>
  )
}