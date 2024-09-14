// Sample JSON data
const jsonData  = [
  {
    "Issuer": "AMEX",
    "Name": "American Express Platinum Card",
    "Category": "Travel",
    "CreditLevel": "Very Good-Excellent",
    "APR": "21.24%-29.24%",
    "AnnualFee": "$695",
    "Rewards": [
      "5x on flights booked with American Express or directly with airlines",
      "5x on hotels booked with American Express",
      "1x on other purchases"
    ],
    "Credits": [
      "$200 airline fee credit",
      "$200 Uber Cash credit",
      "$200 hotel credit for bookings through Amex Fine Hotels & Resorts or the Hotel Collection",
      "$189 CLEAR® credit",
      "$100 Saks Fifth Avenue credit"
    ],
    "CashbackPoints": "AMEX Points",
    "SignupBonus": "50,000 points after spending $2000 in the first 6 months",
    "Tier": "3"
  },
  {
    "Issuer": "Chase",
    "Name": "Chase Freedom Unlimited",
    "Category": "Cashback",
    "CreditLevel": "Good",
    "APR": "16.99%-25.24%",
    "AnnualFee": "$0",
    "Rewards": [
      "5% on travel through Chase Ultimate Rewards",
      "3% on dining",
      "1.5% on all other purchases"
    ],
    "CashbackPoints": "Cashback",
    "SignupBonus": "200$ after spending $500 in the first 3 months",
    "Tier": "2"
  }
];
  
  // Parse JSON data
  //const cards = JSON.parse(jsonData);
  const cards = jsonData;
  
  // Indexing for efficient lookups
  const indexByCategory = {};
  const indexByIssuer = {};
  const indexByCreditLevel = {};
  
  cards.forEach(card => {
    if (!indexByCategory[card.Category]) indexByCategory[card.Category] = [];
    indexByCategory[card.Category].push(card);
  
    if (!indexByIssuer[card.Issuer]) indexByIssuer[card.Issuer] = [];
    indexByIssuer[card.Issuer].push(card);
  
    if (!indexByCreditLevel[card.CreditLevel]) indexByCreditLevel[card.CreditLevel] = [];
    indexByCreditLevel[card.CreditLevel].push(card);
  });

  
  function filterByCreditScore(cards, creditScore) {
    // Define the allowed tier ranges based on the user's credit score
    const allowedTiers = {
        "Poor": ["0", "1", "2"], // Can see up to Tier 2
        "Fair": ["0", "1", "2"], // Can see up to Tier 2
        "Good": ["1", "2", "3"], // Can see Tier 1 and above
        "Very Good": ["1", "2", "3"], // Can see Tier 1 and above
        "Excellent": ["1", "2", "3"] // Can see Tier 1 and above
    };

    let matchedCreditLevel = null;
    if (creditScore.includes("Poor")) {
        matchedCreditLevel = "Poor";
    } else if (creditScore.includes("Fair")) {
        matchedCreditLevel = "Fair";
    } else if (creditScore.includes("Good")) {
        matchedCreditLevel = "Good";
    } else if (creditScore.includes("Very Good")) {
        matchedCreditLevel = "Very Good";
    } else if (creditScore.includes("Excellent")) {
        matchedCreditLevel = "Excellent";
    }

    // Filter cards by checking if the card's tier is allowed for the user's credit score
    return cards.filter(card => allowedTiers[matchedCreditLevel].includes(card.Tier));
  }
  

  // Function to apply user preferences (nuking)
  function applyPreferences(cards, preferences) {
    return cards.filter(card => {
      if (preferences.student === "No" && card.Rewards.some(reward => reward.includes("Student"))) return false;
      if (preferences.businessCard === "No" && card.Category.includes("Business")) return false;
      if (preferences.hotel === "No" && card.Category === "Hotel") return false;
      if (preferences.airline === "No" && card.Category === "Airline") return false;
      if (preferences.currentCards.includes(card.Name)) return false;
      return true;
    });
  }

  // Function to calculate compatibility scores
function calculateScores(cards, preferences) {
    return cards.map(card => {
      let score = 0;
      if (preferences.spendingCategory.includes(card.Category)) score += 5;
      //fix balance transfer
      if (preferences.balance === "Yes") score += 10;
      return { ...card, score };
    });
  }
  
// Function to sort and tier cards
function sortAndTierCards(cards) {
    const tiers = { tier0: [], tier1: [], tier2: [], tier3: [] };

    cards.forEach(card => {
        if (card.Tier === "0") tiers.tier0.push(card);
        else if (card.Tier === "1") tiers.tier1.push(card);
        else if (card.Tier === "2") tiers.tier2.push(card);
        else if (card.Tier === "3") tiers.tier3.push(card);
    });

    // Sort each tier by score
    for (const tier in tiers) {
        tiers[tier].sort((a, b) => b.score - a.score);
    }

    return tiers;
}
  
  // Main function to get recommended cards
  function getRecommendedCards(userPreferences) {
    let filteredCards = filterByCreditScore(cards, userPreferences.creditScore);
    filteredCards = applyPreferences(filteredCards, userPreferences);
    const scoredCards = calculateScores(filteredCards, userPreferences);
    return sortAndTierCards(scoredCards);
  }
  
  const userInput = {
    age: "23",
    creditScore: "Excellent: 800-850",
    currentBanks: ["American Express", "Capital One"],
    currentCards: "option1",
    inCreditCardDebt: "yes",
    income: "222",
    interestedInAirlineCards: "yes",
    interestedInHotelCards: "no",
    isBusinessOwner: "no",
    isStudent: "yes",
    preferredAirlines: ["Southwest", "Air Canada"],
    topCategories: ["Travel"]
};

// Get recommended cards based on the user input
const recommendedCards = getRecommendedCards(userInput);
console.log(recommendedCards);