import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import {
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
} from "@material-ui/core";
import Typography from "@mui/material/Typography";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import styled from "styled-components";

const { confirm } = Modal;
const RecipesThumbnailCard = ({ data, type, changeDeleteRecipe }) => {
  const recipeId = type === "published" ? data.recipe_id : data.id;
  const path =
    type === "published"
      ? `/published_recipes/${recipeId}`
      : `/my_recipes/${recipeId}`;
  const navigate = useNavigate();
  const viewDetails = () => navigate(path);
  const editRecipe = () => navigate(`/my_recipes/${recipeId}/edit`);
  // delete recipe
  const deleteRecipe = () => {
    request
      .delete(Api.deleteRecipe, {
        params: {
          recipeId: recipeId,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          message.success("Delete recipe successfully!");
          changeDeleteRecipe();
        } else message.error(data.msg);
      });
  };
  // show delete confirm
  const showDeleteConfirm = () => {
    confirm({
      title: "Are you sure delete this recipe?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteRecipe();
      },
    });
  };

  return (
    <Card sx={{ maxWidth: 345, minWidth: 345 }}>
      <CardHeader
        title={<a onClick={viewDetails}>{data?.name}</a>}
        subheader={data?.createTime}
      />
      <CardMedia
        component="img"
        height="194"
        alt="Recipe Photo"
        src={"data:image/jpg;base64," + data?.photoPath}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          <Description>{data?.description}</Description>
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="details" onClick={viewDetails}>
          <Visibility />
        </IconButton>
        {type === "my_recipe" && (
          <IconButton aria-label="edit" onClick={editRecipe}>
            <Edit />
          </IconButton>
        )}
        {type === "my_recipe" && (
          <IconButton aria-label="delete" onClick={showDeleteConfirm}>
            <Delete />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

export default RecipesThumbnailCard;

const Description = styled.div`
  display: inline-block;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
