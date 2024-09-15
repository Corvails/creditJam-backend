  const cards = require("./finalcreditcard.json");


  // Function to filter by credit score
function filterByCreditScore(cards, creditScore) {
  const allowedTiers = {
      "Poor": ["0", "1", "2"], 
      "Fair": ["0", "1", "2"],
      "Good": ["1", "2", "3"],
      "Very Good": ["1", "2", "3"],
      "Excellent": ["1", "2", "3"]
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
      if (preferences.isStudent === "No" && card.Name.toLowerCase().includes("student")) {
          return false;
      }
      if (preferences.isBusinessOwner === "No" && card.Category.toLowerCase().includes("business")){
          return false;
      }
      if (preferences.interestedInHotelCards === "No" && card.Category.toLowerCase().includes("hotel")){
          return false;
      }
      if (preferences.interestedInAirlineCards === "No" && card.Category.toLowerCase().includes("airline")){
          return false;
      }
      if (preferences.currentCards.includes(card.Name)){
          return false;
      }
      return true;
  });
}

// Function to calculate scores
function calculateScores(cards, preferences) {
  return cards.map(card => {
      // Initialize with the existing score or 0 if not present
      let score = +card.Score || 0;

      const cardCategory = card.Category ? card.Category.toLowerCase() : "";
      const cardName = card.Name ? card.Name.toLowerCase() : "";

      // Apply scoring rules
      if (preferences.topCategories && preferences.topCategories.length > 0) {
          if (preferences.topCategories.includes(card.Category)) score += 15;
      }

      if (preferences.isStudent === "Yes" && cardName.includes("student")) score += 15;
      if (preferences.isBusinessOwner === "Yes" && cardCategory.includes("business")) score += 10;
      if (preferences.inCreditCardDebt === "Yes" && cardCategory.includes("balance")) score += 10;
      if (preferences.interestedInHotelCards === "Yes" && cardCategory.includes("hotel")) score += 5;
      if (preferences.interestedInAirlineCards === "Yes" && cardCategory.includes("airline")) score += 5;

      if (preferences.preferredAirlines && preferences.preferredAirlines.length > 0) {
          preferences.preferredAirlines.forEach(airline => {
              if (cardName.includes(airline.toLowerCase())) {
                  score += 10;
              }
          });
      }
      if (preferences.currentBanks && preferences.currentBanks.length > 0) {
          preferences.currentBanks.forEach(bank => {
              if (cardName.includes(bank.toLowerCase())) {
                  score += 10;
              }
          });
      }
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

  // Sort each tier by the updated score
  for (const tier in tiers) {
      tiers[tier].sort((a, b) => b.score - a.score);
  }

  return tiers;
}

// Function to sort by both category and tier
function sortByCategoryAndTier(recommendedCards, category, tier) {
  const cardsInTier = recommendedCards[`tier${tier}`];

  if (!cardsInTier) {
      console.log(`No cards found for tier: ${tier}`);
      return [];
  }

  // Filter and organize cards by category
  const sortedByCategory = {};

  cardsInTier.forEach(card => {
      const cardCategory = card.Category ? card.Category.toLowerCase() : "";

      // Perform partial match for category (case-insensitive)
      if (cardCategory.includes(category.toLowerCase())) {
          if (!sortedByCategory[cardCategory]) {
              sortedByCategory[cardCategory] = [];
          }
          sortedByCategory[cardCategory].push(card);
      }
  });

  if (Object.keys(sortedByCategory).length === 0) {
      console.log(`No cards found for categories containing: ${category}`);
      return [];
  }

  const allSortedCards = [];

  // Collect all matching categories
  for (const matchedCategory in sortedByCategory) {
      const sortedCards = [...sortedByCategory[matchedCategory]].sort((a, b) => b.score - a.score);
      allSortedCards.push(...sortedCards);
  }

  if (allSortedCards.length === 0) {
      console.log(`No cards found for category containing: ${category} and tier: ${tier}`);
      return [];
  }

  return allSortedCards;
}

// Main function to get recommended cards
function getRecommendedCards(userPreferences) {
  let filteredCards = filterByCreditScore(cards, userPreferences.creditScore);
  filteredCards = applyPreferences(filteredCards, userPreferences);
  const scoredCards = calculateScores(filteredCards, userPreferences);
  return sortAndTierCards(scoredCards); // Organize by tier
}

// Call the function with user input
const userInput = {
  age: "20",
  creditScore: "Good: 800-850",
  currentBanks: ["Wells Fargo", "Capital One"],
  currentCards: ["option1"],
  inCreditCardDebt: "No",
  income: "222",
  interestedInAirlineCards: "No",
  interestedInHotelCards: "No",
  isBusinessOwner: "No",
  isStudent: "Yes",
  preferredAirlines: ["Delta", "Air Canada"],
  topCategories: ["Gas, Grocery, Dining"]
};

// Get recommended cards based on user preferences
const recommendedCards = getRecommendedCards(userInput);
console.log(recommendedCards);
// Get sorted card objects for categories that contain "Grocery" in tier 2
const category = "Grocery";
const tier = 2;
const sortedCardsByCategoryAndTier = sortByCategoryAndTier(recommendedCards, category, tier);

//console.log(sortedCardsByCategoryAndTier);
