import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Form,
  Input,
  message,
  Upload,
  Radio,
  Space,
  Divider,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Header from "../../Components/Header/Header";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";

// Form layout
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
// upload image
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/JPEG/PNG file!");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 <= 5;
  if (!isLt2M) {
    message.error("Image must be smaller than 5MB!");
    return false;
  }
  return isJpgOrPng && isLt2M;
};
// upload button
const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

export default function CreateRecipe() {
  const [CreateRecipeForm] = Form.useForm();
  const [mainPicture, setMainPicture] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [mealMethod, setMealMethod] = useState("Broiling");
  const [steps, setSteps] = useState([]);

  // change main picture
  const changeMainPicture = (info) => {
    getBase64(info.file.originFileObj, (url) => {
      setMainPicture(url.split(",")[1]);
    });
  };
  // change meal type
  const changeMealType = (e) => setMealType(e.target.value);
  // change meal method
  const changeMealMethod = (e) => setMealMethod(e.target.value);
  // change step picture
  const changeStepPicture = (info, name) => {
    getBase64(info.file.originFileObj, (url) => {
      let tempArr = [...steps];
      tempArr[name].picture = url.split(",")[1];
      setSteps(tempArr);
    });
  };
  // add step
  const addStep = () => {
    let tempArr = [...steps];
    tempArr.push({ picture: "", description: "" });
    setSteps(tempArr);
  };
  // remove step
  const removeStep = (name) => {
    let tempArr = [...steps];
    tempArr.splice(name, 1);
    setSteps(tempArr);
  };
  // create recipe
  const navigate = useNavigate();
  const createRecipe = (values) => {
    let tempArr = [...steps];
    for (let i = 0; i < tempArr.length; i++) {
      tempArr[i].description = values.steps[i].description;
    }
    const body = {
      name: values.recipeName,
      method: values.mealMethod,
      mealType: values.mealType,
      ingredients: JSON.stringify(values.ingredients),
      steps: JSON.stringify(tempArr),
      description: values.description,
      photo: mainPicture,
    };
    request
      .post(Api.createRecipe, {
        data: body,
      })
      .then((data) => {
        if (data.status === 200) {
          message.success("Create recipe successfully!");
          navigate("/userInfo", { replace: false });
        } else message.error(data.msg);
      });
  };

  return (
    <div>
      <Header />
      <MainContent>
        <Divider>Create Recipe</Divider>
        <Form
          {...formItemLayout}
          form={CreateRecipeForm}
          name="Create Recipe"
          onFinish={createRecipe}
          scrollToFirstError
        >
          <Form.Item
            name="recipeName"
            label="Recipe name"
            rules={[
              {
                required: true,
                message: "Missing recipe name!",
              },
            ]}
          >
            <Input placeholder="Recipe name" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item
            name="mainPicture"
            label="Main picture"
            rules={[
              {
                required: true,
                message: "Missing main picture!",
              },
            ]}
          >
            <Upload
              name="mainPicture"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={changeMainPicture}
            >
              {mainPicture ? (
                <img
                  src={"data:image/jpg;base64," + mainPicture}
                  alt="main picture"
                  style={{
                    width: "100%",
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "Missing description!",
              },
            ]}
          >
            <TextArea
              style={{ width: 400 }}
              rows={5}
              maxLength={500}
              showCount
              placeholder="Description"
            />
          </Form.Item>
          <Form.Item
            name="mealType"
            label="Meal type"
            rules={[
              {
                required: true,
                message: "Missing meal type!",
              },
            ]}
            initialValue={"Breakfast"}
          >
            <Radio.Group onChange={changeMealType} value={mealType}>
              <Radio value="Breakfast">Breakfast</Radio>
              <Radio value="Lunch">Lunch</Radio>
              <Radio value="Dinner">Dinner</Radio>
              <Radio value="Snack">Snack</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="mealMethod"
            label="Meal method"
            rules={[
              {
                required: true,
                message: "Missing meal method!",
              },
            ]}
            initialValue={"Broiling"}
          >
            <Radio.Group onChange={changeMealMethod} value={mealMethod}>
              <div>
                <Radio value="Broiling">Broiling</Radio>
                <Radio value="Grilling">Grilling</Radio>
                <Radio value="Roasting">Roasting</Radio>
                <Radio value="Baking">Baking</Radio>
              </div>
              <div>
                <Radio value="Sauteing">Sauteing</Radio>
                <Radio value="Poaching">Poaching</Radio>
                <Radio value="Simmering">Simmering</Radio>
                <Radio value="Boiling">Boiling</Radio>
              </div>
            </Radio.Group>
          </Form.Item>
          {/*Ingredients*/}
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      marginLeft: "30%",
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "ingredient"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing ingredient",
                        },
                      ]}
                    >
                      <Input placeholder="Ingredient" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "amount"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing amount",
                        },
                      ]}
                    >
                      <Input placeholder="Amount" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginLeft: "30%", width: "70%" }}
                  >
                    Add Ingredients
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          {/*Steps*/}
          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "picture"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing step picture",
                        },
                      ]}
                    >
                      <Upload
                        name="stepPicture"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        onChange={(info) => changeStepPicture(info, name)}
                      >
                        {steps[name].picture ? (
                          <img
                            src={"data:image/jpg;base64," + steps[name].picture}
                            alt="step picture"
                            style={{
                              width: "100%",
                            }}
                          />
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing step description",
                        },
                      ]}
                    >
                      <TextArea
                        style={{ width: 400 }}
                        rows={5}
                        maxLength={500}
                        showCount
                        placeholder="Description"
                      />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name);
                        removeStep(name);
                      }}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                      addStep();
                    }}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginLeft: "30%", width: "70%" }}
                  >
                    Add Steps
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item {...tailFormItemLayout}>
            <Button
              style={{
                backgroundColor: "white",
                color: "black",
                fontWeight: "bold",
                marginRight: 10,
              }}
              onClick={() => {
                navigate("/userInfo", { replace: false });
              }}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              style={{
                backgroundColor: "#FFA64E",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Create Recipe
            </Button>
          </Form.Item>
        </Form>
      </MainContent>
    </div>
  );
}

const MainContent = styled.div`
  width: 90vw;
  margin: 50px;
  box-sizing: border-box;
  border-radius: 35px;
  background-color: #fbf8f5;
  box-shadow: 0 4px 4px rgba(182, 182, 182, 0.5);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;
