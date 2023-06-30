import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import Homepage from "./Packages/Pages/Homepage/Homepage";
import UserInfo from "./Packages/Pages/UserInfo/UserInfo";
import EditProfile from "./Packages/Pages/UserInfo/EditProfile";
import CreateRecipe from "./Packages/Pages/CreateRecipe/CreateRecipe";
import EditRecipe from "./Packages/Pages/EditRecipe/EditRecipe";
import RecipesDetail from "./Packages/Pages/RecipesDetail/RecipesDetail";
import RankingPage from "./Packages/Pages/RankingPage/RankingPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/userInfo" element={<UserInfo />} />
          <Route path="/userInfo/editProfile" element={<EditProfile />} />
          <Route path="/userInfo/createRecipe" element={<CreateRecipe />} />
          <Route path="/rankingPage" element={<RankingPage />} />
          <Route path="/my_recipes">
            <Route path=":recipe_id" element={<RecipesDetail type="my" />} />
            <Route path=":recipe_id/edit" element={<EditRecipe />} />
          </Route>
          <Route path="/published_recipes">
            <Route
              path=":recipe_id"
              element={<RecipesDetail type="published" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <footer style={{ textAlign: "center" }}>
        Copyright @COMP9900-T16Q-Vite
      </footer>
    </>
  );
}

export default App;
