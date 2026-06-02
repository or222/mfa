import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message as antdMessage } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { ResetPasswordRequest } from '../../types';
import './Auth.css';

const { Title, Text } = Typography;

interface ResetPasswordProps {
  email: string;
  onResetSuccess: () => void;
  onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email, onResetSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: ResetPasswordRequest) => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(values);
      if (response.success) {
        antdMessage.success(response.message);
        onResetSuccess();
      } else {
        antdMessage.error(response.message);
      }
    } catch (error: any) {
      antdMessage.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const newPassword = form.getFieldValue('newPassword');
    if (value && value !== newPassword) {
      return Promise.reject('Passwords do not match');
    }
    return Promise.resolve();
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Reset Password</Title>
          <Text>Enter the token and your new password</Text>
        </div>
        <Form
          form={form}
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ email }}
        >
          <Form.Item
            name="email"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="token"
            rules={[{ required: true, message: 'Please input the reset token!' }]}
          >
            <Input prefix={<LockOutlined />} placeholder="Reset Token" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter' },
              { pattern: /[a-z]/, message: 'Password must contain a lowercase letter' },
              { pattern: /\d/, message: 'Password must contain a number' },
              { pattern: /[^a-zA-Z0-9]/, message: 'Password must contain a special character' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              { validator: validateConfirmPassword },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Reset Password
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

export default ResetPassword;
