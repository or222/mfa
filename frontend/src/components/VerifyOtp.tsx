import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message as antdMessage } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { VerifyOtpRequest } from '../../types';
import './Auth.css';

const { Title, Text } = Typography;

interface VerifyOtpProps {
  email: string;
  onVerificationSuccess: (token: string) => void;
  onBack: () => void;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ email, onVerificationSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: VerifyOtpRequest) => {
    setLoading(true);
    try {
      const response = await authService.verifyRegistration(values);
      if (response.success && response.data) {
        authService.saveTokens(response.data);
        antdMessage.success(response.message);
        onVerificationSuccess(response.data.accessToken);
      } else {
        antdMessage.error(response.message);
      }
    } catch (error: any) {
      antdMessage.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Verify Email</Title>
          <Text>Enter the OTP sent to {email}</Text>
        </div>
        <Form
          form={form}
          name="verify-otp"
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
            name="otp"
            rules={[
              { required: true, message: 'Please input the OTP!' },
              { len: 6, message: 'OTP must be 6 digits' },
              { pattern: /^\d+$/, message: 'OTP must contain only numbers' },
            ]}
          >
            <Input prefix={<LockOutlined />} placeholder="Enter 6-digit OTP" maxLength={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Verify
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Button type="link" onClick={onBack}>
              Back to Registration
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default VerifyOtp;
