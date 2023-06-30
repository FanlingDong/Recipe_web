import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Avatar from "@mui/material/Avatar";
import { message, Divider, Tabs, Button } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import Header from "../../Components/Header/Header";
import ShowRecipesList from "../ShowRecipesList/ShowRecipesList";

export default function UserInfo() {
  const [hasDeleteRecipe, setHasDeleteRecipe] = useState(true);
  const changeDeleteRecipe = () => setHasDeleteRecipe(!hasDeleteRecipe);
  // User Profile
  const [userProfile, setUserProfile] = useState(null);
  const getProfile = () => {
    request.get(Api.profile, {}).then((data) => {
      if (data.status === 200) setUserProfile(data);
      else message.error(data.msg);
    });
  };
  const navigate = useNavigate();
  const editProfile = () =>
    navigate("/userInfo/editProfile", { replace: false });
  const createRecipe = () =>
    navigate("/userInfo/createRecipe", { replace: false });
  // My Recipes
  const [myRecipes, setMyRecipes] = useState();
  const getMyRecipes = () => {
    request.get(Api.getMyRecipesList, {}).then((data) => {
      if (data.status === 200) {
        setMyRecipes(data);
      } else message.error(data.msg);
    });
  };
  // My Collections
  const [myCollections, setMyCollections] = useState();
  const getMyCollect = () => {
    request.get(Api.getCollect, {}).then((data) => {
      if (data.status === 200) {
        setMyCollections(data);
      } else message.error(data.msg);
    });
  };
  useEffect(() => {
    getProfile();
    getMyRecipes();
    getMyCollect();
  }, [hasDeleteRecipe]);

  return (
    <div>
      <Header />
      <MainContent>
        {userProfile ? (
          <ProfileCard>
            <div className="user-info-group">
              <Avatar
                alt={userProfile?.username}
                sx={{ width: 150, height: 150 }}
                src={"data:image/jpg;base64," + userProfile?.photo}
              />
              <div className="information">
                <div className="user-name">{userProfile.username}</div>
                <div className="email">{userProfile.email}</div>
                <div>{userProfile.selfDescription}</div>
              </div>
            </div>
            <Button
              size="large"
              shape="round"
              style={{
                backgroundColor: "#FFA64E",
                color: "white",
                fontWeight: "bold",
              }}
              icon={<EditOutlined />}
              onClick={() => editProfile()}
            >
              Edit Profile
            </Button>
          </ProfileCard>
        ) : null}
        <RecipeList sx={{ width: "100%" }}>
          <Button
            size="large"
            shape="round"
            style={{
              backgroundColor: "#FFA64E",
              color: "white",
              fontWeight: "bold",
            }}
            icon={<PlusOutlined />}
            onClick={() => createRecipe()}
          >
            Create Recipe
          </Button>
          <Divider />
          <Tabs
            defaultActiveKey="1"
            size="large"
            items={[
              {
                label: `Published(${myRecipes ? myRecipes.recipes.length : 0})`,
                key: "1",
                children: myRecipes ? (
                  <ShowRecipesList
                    data={myRecipes}
                    type={"my_recipe"}
                    changeDeleteRecipe={changeDeleteRecipe}
                    isCollection={"no"}
                  />
                ) : null,
              },
              {
                label: `Collections(${
                  myCollections ? myCollections.subscribes.length : 0
                })`,
                key: "2",
                children: myCollections ? (
                  <ShowRecipesList
                    data={myCollections}
                    type={"published"}
                    changeDeleteRecipe={changeDeleteRecipe}
                    isCollection={"yes"}
                  />
                ) : null,
              },
            ]}
          />
        </RecipeList>
      </MainContent>
    </div>
  );
}

const MainContent = styled.div`
  padding: 0 50px;
`;
const ProfileCard = styled.div`
  box-sizing: border-box;
  height: 210px;
  background-color: #fbf8f5;
  margin: 56px auto;
  border-radius: 35px;
  display: flex;
  box-shadow: 0 4px 4px rgba(182, 182, 182, 0.5);
  justify-content: space-between;
  align-items: center;
  padding: 0 100px;
  .user-info-group {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .information {
    margin-left: 50px;
  }
  .user-name {
    font-size: 30px;
    font-weight: 600;
  }
  .email {
    font-size: 24px;
  }
`;
const RecipeList = styled.div`
  box-sizing: border-box;
`;
