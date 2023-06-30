import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header";
import styled from "styled-components";
import { IconButton } from "@material-ui/core";
import { Visibility } from "@mui/icons-material";
import { Divider, message, Tabs, Table, Tooltip, Avatar, Button } from "antd";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";

export default function RankingPage() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [allContributors, setAllContributors] = useState([]);
  const [weekRecipes, setWeekRecipes] = useState([]);
  const [weekContributors, setWeekContributors] = useState([]);
  const [isLogged, setIsLogged] = useState(false);

  // subscribe
  const subscribePeople = (record) => {
    const viteName = localStorage.getItem("viteName");
    if (viteName === record.name) {
      message.warning("You can not subscribe yourself!");
      return;
    }
    if (isLogged) {
      if (record.subscribedMan === false) {
        setAllContributors(
          allContributors.map((item) => {
            if (record.id === item.id) {
              return {
                ...item,
                subscribedMan: true,
              };
            } else {
              return item;
            }
          })
        );
        request
          .post(Api.postSubscriber, {
            data: {
              id: record.id,
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
        setAllContributors(
          allContributors.map((item) => {
            if (record.id === item.id) {
              return {
                ...item,
                subscribedMan: false,
              };
            } else {
              return item;
            }
          })
        );
        // delete subscribe
        request
          .delete(Api.deleteSubscriber, {
            data: { id: record.id },
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
  // get all ranking data
  const getAllRankingData = () => {
    request.get(Api.getRankingData, { query: { Date: "all" } }).then((data) => {
      if (data.status === 200) {
        setAllRecipes(data.recipes);
        setAllContributors(data.contributors);
      } else message.error(data.msg);
    });
  };
  // get week ranking data
  const getWeekRankingData = () => {
    request
      .get(Api.getRankingData, { query: { Date: "week" } })
      .then((data) => {
        if (data.status === 200) {
          setWeekRecipes(data.recipes);
          setWeekContributors(data.contributors);
        } else message.error(data.msg);
      });
  };

  const navigate = useNavigate();
  const viewDetails = (text) => navigate(`/published_recipes/${text}`);

  useEffect(() => {
    getAllRankingData();
    getWeekRankingData();
  }, []);
  useEffect(() => {
    const viteToken = localStorage.getItem("viteToken");
    if (viteToken) {
      setIsLogged(true);
    }
  }, [isLogged]);
  // contributors columns
  const contributorsColumns = [
    {
      title: "Photo",
      dataIndex: "photoPath",
      key: "photoPath",
      render: (text, record) => (
        <Avatar
          size={60}
          src={text ? "data:image/jpg;base64," + text : undefined}
        >
          {record.name[0]}
        </Avatar>
      ),
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Number of followers",
      dataIndex: "count",
      key: "count",
      align: "center",
    },
    {
      title: "Subscribe",
      dataIndex: "subscribedMan",
      key: "subscribedMan",
      render: (text, record) => (
        <Button
          style={{
            background: `${text ? "#cdcdcd" : "#FFA64E"}`,
            color: "white",
            margin: "20px",
          }}
          onClick={() => {
            subscribePeople(record);
          }}
        >
          {text ? "Subscribed" : "Subscribe"}
        </Button>
      ),
      align: "center",
    },
  ];
  // recipes columns
  const recipesColumns = [
    {
      title: "Photo",
      dataIndex: "photoPath",
      key: "photoPath",
      render: (text) => (
        <Avatar
          size={60}
          shape="square"
          src={"data:image/jpg;base64," + text}
        />
      ),
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Number of likes",
      dataIndex: "count",
      key: "count",
      align: "center",
    },
    {
      title: "View",
      dataIndex: "recipe_id",
      key: "recipe_id",
      render: (text) => (
        <IconButton aria-label="details" onClick={() => viewDetails(text)}>
          <Visibility />
        </IconButton>
      ),
      align: "center",
    },
  ];

  return (
    <div>
      <Header />
      <Divider>
        <RankingPageTitle>Ranking Page</RankingPageTitle>
      </Divider>
      <RankingDetails>
        <Tabs
          defaultActiveKey="1"
          size="large"
          items={[
            {
              label: `Top 5 Contributors`,
              key: "1",
              children: (
                <>
                  <Divider>
                    <Tooltip title="The Top 5 contributors according to the total number of followers">
                      <span>Total Ranking</span>
                    </Tooltip>
                  </Divider>
                  <Table
                    columns={contributorsColumns}
                    dataSource={allContributors}
                    scroll={{
                      y: 640,
                    }}
                  />
                  <Divider>
                    <Tooltip title="The Top 5 contributors according to the number of followers that increased last week">
                      <span>Week Ranking</span>
                    </Tooltip>
                  </Divider>
                  <Table
                    columns={contributorsColumns}
                    dataSource={weekContributors}
                    scroll={{
                      y: 640,
                    }}
                  />
                </>
              ),
            },
            {
              label: `Top 10 Recipes`,
              key: "2",
              children: (
                <>
                  <Divider>
                    <Tooltip title="The Top 10 recipes according to the total number of likes">
                      <span>Total Ranking</span>
                    </Tooltip>
                  </Divider>
                  <Table
                    columns={recipesColumns}
                    dataSource={allRecipes}
                    scroll={{
                      y: 940,
                    }}
                  />
                  <Divider>
                    <Tooltip title="The Top 10 recipes according to the number of likes that increased last week">
                      <span>Week Ranking</span>
                    </Tooltip>
                  </Divider>
                  <Table
                    columns={recipesColumns}
                    dataSource={weekRecipes}
                    scroll={{
                      y: 940,
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </RankingDetails>
    </div>
  );
}

const RankingPageTitle = styled.div`
  font-size: 30px;
  font-weight: 600;
  text-align: center;
  margin: 10px;
`;
const RankingDetails = styled.div`
  padding: 0 50px;
`;
