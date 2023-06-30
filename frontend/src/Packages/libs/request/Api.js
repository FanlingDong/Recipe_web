export const Api = {
  // ============ User ============ //
  register: "/user/register",
  login: "/user/login",
  profile: "/user/profile",
  changePassword: "/user/changePass",

  // ============ Recipe ============ //
  createRecipe: "/recipes/create",
  deleteRecipe: "/recipes/myrecipes/:recipeId",
  editRecipe: "/recipes/myrecipes/:recipeId",
  getMyRecipesList: "/recipes/myrecipes",
  getMyRecipeDetail: "/recipes/myrecipes/:recipe_id",
  getPublishedRecipesList: "/recipes/published_recipes",
  getPublishedRecipeDetail: "/recipes/published_recipes/:recipe_id",
  getSearchedRecipesList: "/recipes/search",
  getComment: "/comment/:recipeId",
  postComment: "/comment/:recipeId",
  postLike: "/like/:recipe_id",
  postCollect: "/subscribe/recipe",
  getCollect: "/subscribe/recipe",
  deleteCollect: "/subscribe/recipe",
  getRecommendRecipes: "/recipes/published_recipes/:recipe_id/recommendation",

  //============ Subscribe ============ //
  postSubscriber: "/subscribe/contributor",
  getSubscriber: "/subscribe/contributor",
  deleteSubscriber: "/subscribe/contributor",

  // ============ Ranking ============ //
  getRankingData: "/ranking/top",

  //============ Feed ============ //
  getFeedNews: "/user/dynamic",
  getIsFeedNews: "/user/isdynamic",
};
