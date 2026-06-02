import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message as antdMessage } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { RegisterRequest } from '../../types';
import './Auth.css';

const { Title, Text } = Typography;

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegistrationSuccess: (email: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(values);
      if (response.success) {
        antdMessage.success(response.message);
        onRegistrationSuccess(values.email);
      } else {
        antdMessage.error(response.message);
      }
    } catch (error: any) {
      antdMessage.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (value && value !== password) {
      return Promise.reject('Passwords do not match');
    }
    return Promise.resolve();
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Register</Title>
          <Text>Create your account</Text>
        </div>
        <Form
          form={form}
          name="register"
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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter' },
              { pattern: /[a-z]/, message: 'Password must contain a lowercase letter' },
              { pattern: /\d/, message: 'Password must contain a number' },
              { pattern: /[^a-zA-Z0-9]/, message: 'Password must contain a special character' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              { validator: validateConfirmPassword },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Text>Already have an account? </Text>
            <Button type="link" onClick={onSwitchToLogin}>
              Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
