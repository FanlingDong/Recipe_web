import * as React from "react";
import styled from "styled-components";
import Avatar from "@mui/material/Avatar";
import { Dropdown, Menu, message, Badge, Modal, List } from "antd";
import { NotificationOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAndLogin from "../RegisterAndLogin/RegisterAndLogin";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";

export default function Header() {
  const viteToken = localStorage.getItem("viteToken");
  const [isLogged, setIsLogged] = useState(Boolean(viteToken));
  const transmitLoggedInfo = (value) => setIsLogged(value);
  const [userprofile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const [feed, setFeed] = useState(null);
  const [isFeed, setIsFeed] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const showMessage = () => {
    setIsFeed(false);
    setIsMessageOpen(true);
  };
  const handleOk = () => {
    setIsMessageOpen(false);
  };
  const handleCancel = () => {
    setIsMessageOpen(false);
  };
  const goToRankingPage = () => {
    navigate("/rankingPage", { replace: false });
  };
  const goToUserInfo = () => {
    navigate("/userInfo", { replace: false });
  };

  // logout
  const logOut = () => {
    localStorage.removeItem("viteToken");
    localStorage.removeItem("viteName");
    setIsLogged(false);
    navigate("/", { replace: false });
  };
  // menu component
  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: <a onClick={goToUserInfo}>My Info</a>,
        },
        {
          key: "2",
          label: <a onClick={logOut}>Logout</a>,
        },
      ]}
    />
  );
  // get user profile
  const getProfile = () => {
    request.get(Api.profile, {}).then((data) => {
      if (data.status === 200) {
        localStorage.setItem("viteName", data.username);
        setUserProfile(data);
      } else message.error(data.msg);
    });
  };
  const returnHomepage = () => navigate("/", { replace: false });
  // get feed
  const getFeed = () => {
    request.get(Api.getFeedNews, {}).then((data) => {
      if (data.status === 200) {
        setFeed(data.recipes);
      } else message.error(data.msg);
    });
  };
  // get isFeed
  const getIsFeed = () => {
    request.get(Api.getIsFeedNews, {}).then((data) => {
      if (data.status === 200) {
        if (data.new) {
          setIsFeed(true);
        } else {
          setIsFeed(false);
        }
      } else message.error(data.msg);
    });
  };
  // see the details of feed message
  const seeDetails = (item) => {
    setIsMessageOpen(false);
    const path = `/published_recipes/${item.recipe_id}`;
    navigate(path);
  };

  useEffect(() => {
    if (isLogged) {
      getProfile();
      // feed
      getFeed();
      // get isFeed
      getIsFeed();
    } else setUserProfile(null);
  }, [isLogged]);

  return (
    <HeaderLayout>
      <div className="header-left">
        <div className="logo" onClick={returnHomepage}>
          <span>
            Bon<span className="logo-yellow">Appetite</span>
          </span>
        </div>
        <div className="button-shadow" onClick={goToRankingPage}>
          Ranking Page!
        </div>
      </div>
      <div className="header-right">
        {isLogged &&
          (isFeed ? (
            <Badge dot count={1}>
              <NotificationOutlined
                style={{
                  fontSize: 20,
                  cursor: "pointer",
                }}
                onClick={showMessage}
              />
            </Badge>
          ) : (
            <Badge dot count={0}>
              <NotificationOutlined
                style={{
                  fontSize: 20,
                  cursor: "pointer",
                }}
                onClick={showMessage}
              />
            </Badge>
          ))}
        <Modal
          title="Messages"
          open={isMessageOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
        >
          <List
            dataSource={feed}
            renderItem={(item) => (
              <Badge.Ribbon
                text={item.new ? "New" : "View"}
                color={item.new ? "volcano" : "cyan"}
              >
                <List.Item
                  onClick={() => seeDetails(item)}
                  style={{
                    alignItems: "start",
                    borderRadius: "20px",
                    border: "1px solid #e2e2e2",
                    padding: "10px",
                    marginBottom: "20px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <FeedInfo>
                      <Avatar
                        alt="avatar"
                        sx={{ width: 20, height: 20 }}
                        src={"data:image/jpg;base64," + item?.avatar}
                        style={{ marginRight: 10 }}
                      />
                      <FeedName>{item?.contributorName}</FeedName> {"\u00A0"}{" "}
                      has posted a new recipe
                      <FeedTime>{item?.createTime}</FeedTime>
                    </FeedInfo>
                    <FeedRecipe>
                      <img
                        src={"data:image/jpg;base64," + item?.photoPath}
                        alt="food picture"
                        style={{
                          width: 130,
                          borderRadius: "20px",
                          marginTop: "15px",
                        }}
                      />
                      <FeedRecipeName>"{item?.name}"</FeedRecipeName>
                    </FeedRecipe>
                    <CheckButton>View Details {">>"} </CheckButton>
                  </div>
                </List.Item>
              </Badge.Ribbon>
            )}
          />
        </Modal>
        {isLogged ? (
          <Dropdown overlay={menu} placement="bottom">
            <Avatar
              alt={userprofile?.username}
              sx={{ width: 64, height: 64 }}
              src={"data:image/jpg;base64," + userprofile?.photo}
              style={{ cursor: "pointer", marginLeft: 30 }}
            />
          </Dropdown>
        ) : (
          <RegisterAndLogin transmitLoggedInfo={transmitLoggedInfo} />
        )}
      </div>
    </HeaderLayout>
  );
}

const HeaderLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 60px;
  height: 100px;
  box-shadow: 0 4px 10px 4px rgba(217, 217, 217, 0.4);
  .header-left,
  .header-right {
    display: flex;
    align-items: center;
  }
  .logo {
    font-size: 32px;
    font-weight: Bold;
    cursor: pointer;
  }
  .logo-yellow {
    color: #ffa64e;
  }
  .button-shadow {
    cursor: pointer;
    text-align: center;
    height: 55px;
    margin: 0 0 0 40px;
    line-height: 55px;
    width: 194px;
    font-size: 22px;
    font-weight: 500;
    box-shadow: 0 4px 4px rgba(153, 153, 153, 0.34);
  }
  .message {
    width: 42px;
    height: 42px;
    margin-left: 100px;
  }
`;
const FeedInfo = styled.div`
  display: flex;
  width: 420px;
  justify-content: space-around;
`;
const FeedName = styled.div`
  color: #999;
`;
const FeedRecipe = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const FeedRecipeName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-left: 20px;
`;
const CheckButton = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  color: #999;
  font-size: 10px;
`;
const FeedTime = styled.div`
  margin-left: 60px;
`;
