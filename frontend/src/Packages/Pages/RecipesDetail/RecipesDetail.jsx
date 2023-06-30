import React, { useEffect, useState } from "react";
import Header from "../../Components/Header/Header";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import { message, Table, Button, Image } from "antd";
import { Comment, Form, Input, List } from "antd";
import { Breadcrumbs, Link } from "@material-ui/core";
import Typography from "@mui/material/Typography";
import RecipeStep from "./component/RecipeStep/RecipeStep";
import Avatar from "@mui/material/Avatar";
import ShowRecipesList from "../ShowRecipesList/ShowRecipesList";
const { TextArea } = Input;

const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        style={{ background: "#FFA64E", color: "white" }}
      >
        Add Comment
      </Button>
    </Form.Item>
  </>
);
const RecipesDetail = ({ type }) => {
  const params = useParams();
  const [recipeData, setRecipesData] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [step, setStep] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [recommendRecipes, setRecommendRecipes] = useState("");

  const subscribePeople = (e) => {
    if (isLogged) {
      if (recipeData.subscribedMan === false) {
        setRecipesData({ ...recipeData, subscribedMan: true });
        request
          .post(Api.postSubscriber, {
            data: {
              id: recipeData.contributorId,
            },
          })
          .then((data) => {
            if (data.status === 200) {
              message.success("Subscribed Successfully");
            } else {
              if (data.msg === "You have subscribed!") {
                message.warning("You have followed this subscriber");
              } else {
                message.fail(data.msg);
              }
            }
          });
      } else {
        setRecipesData({ ...recipeData, subscribedMan: false });
        // delete subscribe
        request
          .delete(Api.deleteSubscriber, {
            data: { id: recipeData.contributorId },
          })
          .then((data) => {
            if (data.status === 200) {
              message.success("Unsubscribed Successfully");
            } else {
              message.fail(data.msg);
            }
          });
      }
    } else {
      message.warning("Please sign in first~");
    }
  };
  const addToCollect = (e) => {
    // change the collect state
    if (isLogged) {
      if (recipeData.subscribed === false) {
        e.target.src = require("../../libs/assets/yellowCollect.png");
        setRecipesData({ ...recipeData, subscribed: true });
        // post collect
        request
          .post(Api.postCollect, {
            data: {
              id: recipeData.id,
            },
          })
          .then((data) => {
            if (data.status === 200) {
              message.success("Added successfully to collections");
            } else {
              if (data.msg === "You have subscribed!") {
                message.warning("This delicacy is already in your favourites~");
              } else {
                message.fail(data.msg);
              }
            }
          });
      } else {
        e.target.src = require("../../libs/assets/grayCollect.png");
        setRecipesData({ ...recipeData, subscribed: false });
        // delete collect
        request
          .delete(Api.deleteCollect, {
            data: { id: recipeData.id },
          })
          .then((data) => {
            if (data.status === 200) {
              message.success("Successfully removed");
            } else {
              message.fail(data.msg);
            }
          });
      }
    } else {
      message.warning("Please sign in first~");
    }
  };
  // change the like state
  const changeLikeState = (e) => {
    if (isLogged) {
      if (recipeData.like === false) {
        e.target.src = require("../../libs/assets/redLike.png");
        setRecipesData({
          ...recipeData,
          likes: recipeData.likes + 1,
          like: true,
        });
      } else {
        e.target.src = require("../../libs/assets/grayLike.png");
        setRecipesData({
          ...recipeData,
          likes: recipeData.likes - 1,
          like: false,
        });
      }
      // post like state
      request
        .post(Api.postLike, {
          params: {
            recipe_id: recipeData.id,
          },
        })
        .then((data) => {
          if (data.status === 200) {
          } else message.error(data.msg);
        });
    } else {
      message.warning("Please sign in first~");
    }
  };
  const detailApi =
    type === "published" ? Api.getPublishedRecipeDetail : Api.getMyRecipeDetail;
  const handleChangeComment = (e) => {
    setValue(e.target.value);
  };
  const handleSubmitComment = () => {
    if (isLogged) {
      if (!value) return;
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setValue("");
        setComments([
          ...comments,
          {
            commentUser: "You",
            content: <p>{value}</p>,
          },
        ]);
        // post Comment
        const body = {
          content: value,
        };
        request
          .post(Api.postComment, {
            data: body,
            params: {
              recipeId: recipeData.id,
            },
          })
          .then((data) => {
            if (data.status === 200) {
            } else message.error(data.msg);
          });
      }, 1000);
    } else {
      message.warning("Please sign in first~");
    }
  };

  // current recipe detail
  useEffect(() => {
    const getCurrentRecipeDetail = () => {
      request
        .get(detailApi, {
          params: {
            recipe_id: params.recipe_id,
          },
        })
        .then((data) => {
          if (data.status === 200) {
            // determine if it's "my" recipe
            const viteName = localStorage.getItem("viteName");
            if (data.recipe.contributorName === viteName) {
              setIsMe(true);
            } else {
              setIsMe(false);
            }
            setRecipesData(data.recipe);
            // get the comments
            const getCurrentComment = () => {
              request
                .get(Api.getComment, {
                  params: {
                    recipeId: params.recipe_id,
                  },
                  query: {
                    page: 1,
                    size: 10,
                  },
                })
                .then((data) => {
                  if (data.status === 200) {
                    setComments(data.PageComment);
                  } else message.error(data.msg);
                });
            };
            getCurrentComment();
          } else message.error(data.msg);
        });
    };
    getCurrentRecipeDetail();
  }, [params.recipe_id]);
  // ingredients
  useEffect(() => {
    const getRightFormatIngredients = () => {
      let ingredientsData = recipeData
        ? JSON.parse(recipeData?.ingredients).map((item, index) => {
            item.key = index;
            return item;
          })
        : [];
      setIngredients(ingredientsData);
      return ingredientsData;
    };
    getRightFormatIngredients();
  }, [recipeData]);

  const ingredientsColumns = [
    {
      title: "Ingredients",
      dataIndex: "ingredient",
      key: "Ingredient",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "Amount",
    },
  ];

  // steps
  useEffect(() => {
    const getStep = () => {
      if (recipeData) {
        const stepJson = JSON.parse(recipeData?.steps);
        setStep(stepJson);
      }
    };
    getStep();
  }, [recipeData]);

  // recommend recipes
  useEffect(() => {
    const getRecommendRecipes = () => {
      request
        .get(Api.getRecommendRecipes, {
          params: {
            recipe_id: `${params.recipe_id}`,
          },
        })
        .then((data) => {
          if (data.status === 200) {
            setRecommendRecipes(data);
          } else message.error(data.msg);
        });
    };
    getRecommendRecipes();
  }, []);
  useEffect(() => {
    const viteToken = localStorage.getItem("viteToken");
    if (viteToken) {
      setIsLogged(true);
    }
  }, [isLogged]);

  return (
    <div>
      <Header />
      <MainContent>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          {type === "my" && (
            <Link underline="hover" color="inherit" href="/userInfo">
              User Info
            </Link>
          )}
          <Typography color="#FFA64E">Recipe Detail</Typography>
        </Breadcrumbs>
        <Content>
          <CoverImgContainer>
            <img
              src={"data:image/jpg;base64," + recipeData?.photoPath}
              alt="title"
              style={{ borderRadius: 20, height: 500 }}
            />
          </CoverImgContainer>
          <Title>
            <RecipeName>{recipeData?.name}</RecipeName>
            <TitleRight>
              <img
                onClick={(e) => {
                  changeLikeState(e);
                }}
                src={
                  recipeData.like
                    ? require("../../libs/assets/redLike.png")
                    : require("../../libs/assets/grayLike.png")
                }
                alt="title"
                style={{
                  borderRadius: 20,
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                }}
              />
              <div>{recipeData.likes}</div>
            </TitleRight>
          </Title>
          <CreatorGroup>
            <CreatorInfo>
              <Avatar
                alt={recipeData?.contributorName}
                sx={{ width: 50, height: 50 }}
                src={"data:image/jpg;base64," + recipeData?.avatar}
              />
              <CreatorName>{recipeData?.contributorName}</CreatorName>
            </CreatorInfo>
            {/* subscribe button */}
            {!isMe && (
              <Button
                htmlType="submit"
                style={{
                  background: `${
                    recipeData.subscribedMan ? "#cdcdcd" : "#FFA64E"
                  }`,
                  color: "white",
                }}
                onClick={(e) => {
                  subscribePeople(e);
                }}
              >
                {recipeData.subscribedMan ? "Subscribed" : "Subscribe"}
              </Button>
            )}
          </CreatorGroup>
          <p style={{ border: "1px dashed #000000", marginTop: 50 }} />
          <MiddleContent>
            <SubTitle>Ingredients</SubTitle>
            <Table
              columns={ingredientsColumns}
              dataSource={ingredients}
              pagination={false}
            />
          </MiddleContent>
          <p style={{ border: "1px dashed #000000", margin: "50px 0" }} />
          <StepContainer>
            <SubTitle>Steps</SubTitle>
            {step?.map((item, index) => (
              <RecipeStep data={item} index={index} key={index} />
            ))}
            <StepFinal>Finally, enjoy your meal!</StepFinal>
            <Image
              width={350}
              style={{ minWidth: 350, maxWidth: 350 }}
              src={"data:image/jpg;base64," + recipeData?.photoPath}
            />
          </StepContainer>
          <p style={{ border: "1px dashed #000000", margin: "50px 0" }} />
          <TagsContainer>
            <SubTitle>Tags</SubTitle>
            <TagsContent>Meal Method: {recipeData?.method}</TagsContent>
            <TagsContent>Meal Type: {recipeData?.mealType}</TagsContent>
            <TagsContent>Create Time: {recipeData?.createTime}</TagsContent>
          </TagsContainer>
          <p style={{ border: "1px dashed #000000", margin: "50px 0" }} />
          <LikeContainer>
            <div>Like it? Add it to your Collections!</div>
            <img
              src={
                recipeData.subscribed
                  ? require("../../libs/assets/yellowCollect.png")
                  : require("../../libs/assets/grayCollect.png")
              }
              style={{
                width: 60,
                height: 60,
                marginTop: 10,
                marginBottom: 10,
                cursor: "pointer",
              }}
              onClick={(e) => {
                addToCollect(e);
              }}
            />
            <img
              src={require("../../libs/assets/logo1.png")}
              style={{
                position: "absolute",
                left: 0,
                bottom: -10,
                width: 100,
                height: 100,
              }}
            />
          </LikeContainer>
          <p style={{ border: "1px dashed #000000", margin: "0 0 50px 0" }} />

          <CommentContainer>
            <SubTitle>Comments</SubTitle>
            <List
              className="comment-list"
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(item) => (
                <li>
                  <Comment author={item.commentUser} content={item.content} />
                </li>
              )}
            />
            <Comment
              content={
                <Editor
                  onChange={handleChangeComment}
                  onSubmit={handleSubmitComment}
                  submitting={submitting}
                  value={value}
                />
              }
            />
          </CommentContainer>
          <p style={{ border: "1px dashed #000000", margin: "50px 0" }} />
          <SubTitle>More delicious ideas for you</SubTitle>
        </Content>
      </MainContent>
      <RelatedRecipesContainer>
        <ShowRecipesList data={recommendRecipes} type="published" />
      </RelatedRecipesContainer>
    </div>
  );
};

export default RecipesDetail;

const MainContent = styled.div`
  padding: 0 200px;
  margin: 20px;
`;
const Content = styled.div`
  margin: 15px;
`;
const CoverImgContainer = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: center;
`;
const Title = styled.div`
  display: flex;
  justify-content: space-between;
`;
const RecipeName = styled.div`
  display: flex;
  font-weight: 600;
  font-size: 35px;
  margin: 10px 0;
  font-family: "Inter";
  font-style: normal;
  line-height: 50px;
`;
const TitleRight = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;
const CreatorGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 20px 0 0;
`;
const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
`;
const CreatorName = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-size: 23px;
  line-height: 34px;
  margin-left: 10px;
`;
const MiddleContent = styled.div`
  margin: 50px 0 50px 0;
`;
const SubTitle = styled.div`
  font-weight: 700;
  margin: 0 0 35px 0;
  font-family: "Inter";
  font-style: normal;
  font-size: 28px;
  line-height: 46px;
`;
const StepContainer = styled.div`
  margin: 10px 0;
`;
const StepFinal = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 36px;
  color: #595959;
  margin-bottom: 34px;
`;
const TagsContainer = styled.div`
  margin: 10px 0;
`;
const TagsContent = styled.div`
  font-weight: 500;
  margin: 0;
  font-family: "Inter";
  font-style: normal;
  font-size: 15px;
  line-height: 27px;
`;
const LikeContainer = styled.div`
  position: relative;
  font-size: 22px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
const CommentContainer = styled.div``;
const RelatedRecipesContainer = styled.div``;
