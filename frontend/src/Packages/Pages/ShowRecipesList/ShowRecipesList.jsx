import * as React from "react";
import styled from "styled-components";
import RecipesThumbnailCard from "../../Components/RecipesThumbnailCard/RecipesThumbnailCard";

const ShowRecipesList = ({ data, type, changeDeleteRecipe, isCollection }) => {
  const renderList = isCollection === "yes" ? data?.subscribes : data?.recipes;
  return (
    <Container>
      {renderList &&
        renderList.map((arr) => (
          <RecipesContainer key={arr.recipe_id}>
            <RecipesThumbnailCard
              data={arr}
              type={type}
              changeDeleteRecipe={changeDeleteRecipe}
            />
          </RecipesContainer>
        ))}
    </Container>
  );
};

export default ShowRecipesList;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;
const RecipesContainer = styled.div`
  display: inline-block;
  margin: 0 10px 30px 10px;
  min-width: 345px;
`;
