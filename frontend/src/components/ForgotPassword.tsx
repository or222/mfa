import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message as antdMessage } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { ForgotPasswordRequest } from '../../types';
import './Auth.css';

const { Title, Text } = Typography;

interface ForgotPasswordProps {
  onBack: () => void;
  onSent: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSent }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: ForgotPasswordRequest) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(values);
      if (response.success) {
        antdMessage.success(response.message);
        onSent(values.email);
      } else {
        antdMessage.error(response.message);
      }
    } catch (error: any) {
      antdMessage.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Forgot Password</Title>
          <Text>Enter your email to receive a password reset token</Text>
        </div>
        <Form
          form={form}
          name="forgot-password"
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Token
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Button type="link" onClick={onBack}>
              Back to Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
