import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Avatar from "@mui/material/Avatar";
import { Button, Form, Input, message, Divider, Upload } from "antd";
import TextArea from "antd/es/input/TextArea";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import Header from "../../Components/Header/Header";

// Form style
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
export default function EditProfile() {
  const [formEditProfile] = Form.useForm();
  const [formChangePassword] = Form.useForm();
  const [initialUserProfile, setInitialUserProfile] = useState(null);
  const [photo, setPhoto] = useState("");
  // get initial user profile
  const getInitialUserProfile = () => {
    request.get(Api.profile, {}).then((data) => {
      if (data.status === 200) {
        setInitialUserProfile(data);
        setPhoto(data.photo);
      } else message.error(data.msg);
    });
  };
  // upload photo
  function customRequest(option) {
    const formData = new FormData();
    formData.append("files[]", option.file);
    const reader = new FileReader();
    reader.readAsDataURL(option.file);
    reader.onloadend = function (e) {
      setPhoto(e.target.result.split(",")[1]);
      if (e && e.target && e.target.result) option.onSuccess();
    };
  }
  function beforeUpload(file) {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Image must be in .jpg, .jpeg or .png format.");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 <= 2;
    if (!isLt2M) {
      message.error("Image must be no more than 2MB!");
      return false;
    }
    return isJpgOrPng && isLt2M;
  }
  const props = {
    customRequest: customRequest,
    showUploadList: false,
    beforeUpload: beforeUpload,
  };

  const navigate = useNavigate();
  // edit profile
  const editProfile = (values) => {
    const body = {
      username: values.username,
      photo: photo,
      selfDescription: values.selfDescription,
    };
    request
      .put(Api.profile, {
        data: body,
      })
      .then((data) => {
        if (data.status === 200) {
          message.success("Edit profile successfully!");
          navigate("/userInfo", { replace: false });
        } else message.error(data.msg);
      });
  };
  // check password
  const checkPassword = (value) => {
    const regLowerCase = /[a-z]/,
      regUpperCase = /[A-Z]/,
      regDigit = /[0-9]/;
    return (
      value.length >= 8 &&
      value.length <= 24 &&
      regLowerCase.test(value) &&
      regUpperCase.test(value) &&
      regDigit.test(value)
    );
  };
  // change password
  const changePassword = (values) => {
    const body = {
      email: initialUserProfile.email,
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    };
    request
      .put(Api.changePassword, {
        data: body,
      })
      .then((data) => {
        if (data.status === 200) {
          message.success("Change password successfully!");
          navigate("/userInfo", { replace: false });
        } else message.error(data.msg);
      });
  };

  useEffect(() => {
    getInitialUserProfile();
  }, []);

  return (
    <div>
      <Header />
      <MainContent>
        {initialUserProfile ? (
          <>
            {/*Edit Profile*/}
            <Divider>Edit Profile</Divider>
            <Form
              {...formItemLayout}
              form={formEditProfile}
              name="Edit Profile"
              onFinish={editProfile}
              initialValues={{
                email: `${initialUserProfile.email}`,
                username: `${initialUserProfile.username}`,
                selfDescription: `${initialUserProfile.selfDescription}`,
              }}
              scrollToFirstError
            >
              <Form.Item name="photo" label="Photo">
                <div style={{ display: "flex" }}>
                  <Avatar
                    alt={initialUserProfile?.username}
                    sx={{ width: 120, height: 120 }}
                    src={"data:image/jpg;base64," + photo}
                  />
                  <Upload {...props}>
                    <Button type="link" style={{ color: "#FFA64E" }}>
                      Upload a picture
                    </Button>
                  </Upload>
                </div>
              </Form.Item>
              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input style={{ width: 300 }} disabled />
              </Form.Item>
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                    whitespace: true,
                  },
                ]}
              >
                <Input style={{ width: 300 }} disabled />
              </Form.Item>
              <Form.Item name="selfDescription" label="Self-Description">
                <TextArea
                  rows={7}
                  maxLength={300}
                  minLength={100}
                  showCount
                  style={{ maxWidth: 300 }}
                />
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button
                  type="default"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#FFA64E",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Save Profile
                </Button>
              </Form.Item>
            </Form>
            {/*Edit Password*/}
            <Divider>Edit Password</Divider>
            <Form
              {...formItemLayout}
              form={formChangePassword}
              name="Change Password"
              onFinish={changePassword}
              scrollToFirstError
            >
              <Form.Item
                name="oldPassword"
                label="Old Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your old password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                  () => ({
                    validator(_, value) {
                      if (checkPassword(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The new password should be 8-24 characters long and include " +
                            "lowercase, uppercase, and digit character!"
                        )
                      );
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
              <Form.Item
                name="confirmNewPassword"
                label="Confirm New Password"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two new passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password style={{ width: 300 }} />
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button
                  type="default"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#FFA64E",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : null}
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
  justify-content: center;
`;
