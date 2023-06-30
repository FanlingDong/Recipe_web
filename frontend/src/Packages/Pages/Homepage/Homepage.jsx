import * as React from "react";
import styled from "styled-components";
import Header from "../../Components/Header/Header";
import { useCallback, useEffect, useState } from "react";
import ShowRecipesList from "../ShowRecipesList/ShowRecipesList";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Pagination,
  Empty,
  message,
  Select,
} from "antd";
const { Option } = Select;

function HomePage() {
  const [publishedRecipesList, setPublishedRecipesList] = useState("");
  const [searchRecipesList, setSearchRecipesList] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [size, setSize] = useState(10);

  const onChange = (pageNumber) => {
    setPageNumber(pageNumber);
  };
  const onShowSizeChange = (currentPageNumber, pageSize) => {
    setPageNumber(currentPageNumber);
    setSize(pageSize);
  };

  useEffect(() => {
    const getPublishedRecipes = () => {
      request
        .get(Api.getPublishedRecipesList, {
          query: {
            page: pageNumber,
            size: size,
          },
        })
        .then((data) => {
          if (data.status === 200) {
            setPublishedRecipesList(data);
          } else message.error(data.msg);
        });
    };
    getPublishedRecipes();
  }, [pageNumber, size]);

  const onFinish = useCallback((values) => {
    request
      .get(Api.getSearchedRecipesList, {
        query: {
          name: values.name,
          method: values.method,
          ingredients: values.ingredients,
          mealType: values.type,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setSearchRecipesList(data);
        } else message.error(data.msg);
      });
  }, []);
  const AdvancedSearchForm = () => {
    const [form] = Form.useForm();
    return (
      <Form
        form={form}
        name="advanced_search"
        className="ant-advanced-search-form"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col span={6} key={1}>
            <Form.Item
              name={`name`}
              label={`Name`}
              rules={[
                {
                  message: "Please Input Recipes Name",
                },
              ]}
            >
              <Input allowClear placeholder="Name" />
            </Form.Item>
          </Col>
          <Col span={6} key={2}>
            <Form.Item
              name={`ingredients`}
              label={`Ingredients`}
              rules={[
                {
                  message: "Please Input Ingredients",
                },
              ]}
            >
              <Input allowClear placeholder="Ingredients" />
            </Form.Item>
          </Col>
          <Col span={6} key={3}>
            <Form.Item
              name={`type`}
              label={`Type`}
              rules={[
                {
                  message: "Please Choose type",
                },
              ]}
            >
              <Select allowClear>
                <Option value="breakfast">Breakfast</Option>
                <Option value="lunch">Lunch</Option>
                <Option value="dinner">Dinner</Option>
                <Option value="snack">Snack</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6} key={4}>
            <Form.Item
              name={`method`}
              label={`Method`}
              rules={[
                {
                  message: "Please Choose Method",
                },
              ]}
            >
              <Select allowClear>
                <Option value="broiling">Broiling</Option>
                <Option value="grilling">Grilling</Option>
                <Option value="roasting">Roasting</Option>
                <Option value="baking">Baking</Option>
                <Option value="sauteing">Sauteing</Option>
                <Option value="poaching">Poaching</Option>
                <Option value="simmering">Simmering</Option>
                <Option value="boiling">Boiling</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col
            span={24}
            style={{
              textAlign: "right",
            }}
          >
            <Button
              htmlType="submit"
              style={{ color: "#fff", backgroundColor: "#ffa64e" }}
            >
              Search
            </Button>
            <Button
              style={{
                margin: "0 8px",
              }}
              onClick={() => {
                setSearchRecipesList("");
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };
  const Result = useCallback(() => {
    if (searchRecipesList) {
      if (searchRecipesList.total !== 0) {
        return (
          <>
            <p>List of Recipes Searched Result</p>
            <ShowRecipesList
              data={searchRecipesList}
              type={"published"}
              isCollection={"no"}
            />
          </>
        );
      } else {
        return (
          <>
            <p style={{ fontSize: 20, fontWeight: 600 }}>
              List of Recipes Searched Result
            </p>
            <Empty />
          </>
        );
      }
    }
    if (publishedRecipesList) {
      return (
        <>
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            List of All Published Recipes
          </p>
          <ShowRecipesList
            data={publishedRecipesList}
            type={"published"}
            isCollection={"no"}
          />
        </>
      );
    } else {
      return <Empty />;
    }
  }, [publishedRecipesList, searchRecipesList]);

  return (
    <div>
      <Header />
      <MainContent>
        {/* background */}
        <div>
          <img
            src={require("../../libs/assets/background.png")}
            className="background-img"
            alt={"food-background"}
          />
        </div>
        {/* recipes */}
        <div className="recipes-title">Recipes</div>
        <div>
          <AdvancedSearchForm />
          <SearchResultList>
            <RecipesList>
              <Result />
            </RecipesList>
            {!searchRecipesList && (
              <PaginationContainer>
                <Pagination
                  showQuickJumper
                  defaultCurrent={1}
                  total={publishedRecipesList ? publishedRecipesList.total : 50}
                  onChange={onChange}
                  onShowSizeChange={onShowSizeChange}
                />
              </PaginationContainer>
            )}
          </SearchResultList>
        </div>
      </MainContent>
    </div>
  );
}

export default HomePage;

const MainContent = styled.div`
  margin: 30px 60px 0 60px;
  .background-img {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }
  .recipes-title {
    font-size: 28px;
    margin: 84px 0 0 0;
    font-weight: 600;
  }
`;
const SearchResultList = styled.div`
  border: 1px dashed rgba(255, 13, 78, 0.1);
  background: rgba(255, 166, 78, 0.07);
  margin-top: 20px;
  border-radius: 2px;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
`;
const RecipesList = styled.div`
  margin: 20px 0;
`;
const PaginationContainer = styled.div`
  padding: 30px 0;
`;
