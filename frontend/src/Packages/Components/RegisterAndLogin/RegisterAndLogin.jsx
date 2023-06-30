import * as React from "react";
import { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import request from "../../libs/request/request";
import { Api } from "../../libs/request/Api";
import { useNavigate } from "react-router-dom";

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
      offset: 12,
    },
  },
};
const linkFormItemLayout = {
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
export default function RegisterAndLogin(props) {
  const [form] = Form.useForm();
  const { transmitLoggedInfo } = props;
  // sign Modal
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const showSignModal = () => setIsSignModalOpen(true);
  const handleSignCancel = () => setIsSignModalOpen(false);
  // sign-in and sign-up type transfer
  const [signType, setSignType] = useState("signIn");
  const signInToSignUp = () => setSignType("signUp");
  const signUpToSignIn = () => setSignType("signIn");
  const navigate = useNavigate();

  // sign-in
  const signInSubmit = (values) => {
    request
      .post(Api.login, {
        data: values,
      })
      .then((data) => {
        if (data.status === 200) {
          transmitLoggedInfo(true);
          localStorage.setItem("viteToken", data.token);
          handleSignCancel();
          message.success("Sign in successfully!");
          navigate("/", { replace: false });
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
  // sign-up
  const signUpSubmit = (values) => {
    request
      .post(Api.register, {
        data: {
          email: values.email,
          username: values.username,
          password: values.password,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setSignType("signIn");
          message.success("Sign up successfully!");
        } else message.error(data.msg);
      });
  };

  return (
    <div>
      <Button type="text" size="large" onClick={showSignModal}>
        Sign In
      </Button>
      <Modal
        title={
          signType === "signIn"
            ? "Sign in your account!"
            : "Sign up a new account!"
        }
        centered
        open={isSignModalOpen}
        onCancel={handleSignCancel}
        footer={null}
      >
        {signType === "signIn" ? (
          // sign-in Form
          <Form
            {...formItemLayout}
            form={form}
            name="Sign In"
            onFinish={signInSubmit}
            scrollToFirstError
          >
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
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button
                type="default"
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: "#FFA64E",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Sign In
              </Button>
            </Form.Item>
            <Form.Item {...linkFormItemLayout}>
              <Button
                type="link"
                style={{ color: "orangered" }}
                onClick={signInToSignUp}
              >
                Don’t have an account? Sign Up
              </Button>
            </Form.Item>
          </Form>
        ) : (
          // sign-up Form
          <Form
            {...formItemLayout}
            form={form}
            name="Sign Up"
            onFinish={signUpSubmit}
            scrollToFirstError
          >
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
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              tooltip="What do you want others to call you?"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                  whitespace: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                () => ({
                  validator(_, value) {
                    if (checkPassword(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The password should be 8-24 characters long and include " +
                          "lowercase, uppercase, and digit character!"
                      )
                    );
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button
                type="default"
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: "#FFA64E",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Sign Up
              </Button>
            </Form.Item>
            <Form.Item {...linkFormItemLayout}>
              <Button
                type="link"
                style={{ color: "orangered" }}
                onClick={signUpToSignIn}
              >
                Already have an account? Sign In
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
