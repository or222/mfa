import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message as antdMessage } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { LoginRequest } from '../../types';
import './Auth.css';

const { Title, Text } = Typography;

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister, onForgotPassword }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      if (response.success && response.data) {
        authService.saveTokens(response.data);
        antdMessage.success(response.message);
        onLoginSuccess();
      } else {
        antdMessage.error(response.message);
      }
    } catch (error: any) {
      antdMessage.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Login</Title>
          <Text>Welcome back!</Text>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Text>Don't have an account? </Text>
            <Button type="link" onClick={onSwitchToRegister}>
              Register
            </Button>
          </div>

          <div className="auth-footer">
            <Button type="link" onClick={onForgotPassword}>
              Forgot Password?
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
