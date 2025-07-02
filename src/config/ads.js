// Ad Configuration for Todo App
// This file manages different ad networks and placements

export const AD_CONFIG = {
  // Google AdSense Configuration
  adsense: {
    enabled: false, // Set to true when approved
    client: 'ca-pub-XXXXXXXXXXXXXXXX', // Your AdSense publisher ID
    adSlots: {
      banner: '1234567890',
      sidebar: '0987654321'
    }
  },

  // AdMob Configuration (for mobile apps)
  admob: {
    enabled: false,
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~1234567890',
    bannerAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/1234567890',
    interstitialAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/0987654321'
  },

  // Direct Ad Sales Configuration
  directAds: {
    enabled: true,
    ads: [
      {
        id: 'premium-features',
        type: 'banner',
        title: 'Boost Your Productivity',
        description: 'Try our premium features today',
        cta: 'Learn More',
        link: '/premium',
        image: null, // URL to ad image
        active: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        impressions: 0,
        clicks: 0
      }
    ]
  },

  // Ad Display Settings
  display: {
    showAds: true,
    adFrequency: 1, // Show ad every X page loads
    maxAdsPerSession: 3,
    userConsent: false // GDPR compliance
  }
}

// Ad tracking functions
export const trackAdImpression = (adId) => {
  const ad = AD_CONFIG.directAds.ads.find(a => a.id === adId)
  if (ad) {
    ad.impressions++
    console.log(`Ad impression: ${adId}`)
  }
}

export const trackAdClick = (adId) => {
  const ad = AD_CONFIG.directAds.ads.find(a => a.id === adId)
  if (ad) {
    ad.clicks++
    console.log(`Ad click: ${adId}`)
  }
}

// Get active ads
export const getActiveAds = () => {
  return AD_CONFIG.directAds.ads.filter(ad => 
    ad.active && 
    new Date() >= new Date(ad.startDate) && 
    new Date() <= new Date(ad.endDate)
  )
}

// Ad revenue calculator
export const calculateRevenue = () => {
  const ads = AD_CONFIG.directAds.ads
  let totalRevenue = 0
  
  ads.forEach(ad => {
    // Example pricing: $2 per 1000 impressions + $0.50 per click
    const impressionRevenue = (ad.impressions / 1000) * 2
    const clickRevenue = ad.clicks * 0.50
    totalRevenue += impressionRevenue + clickRevenue
  })
  
  return totalRevenue
} 