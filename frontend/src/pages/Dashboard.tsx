import React from 'react';
import { Layout, Typography, Card, Button, Row, Col, Statistic } from 'antd';
import { UserOutlined, MailOutlined, LogoutOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const email = localStorage.getItem('accessToken') ? 'user@example.com' : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          MFA Application
        </Title>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={onLogout}
        >
          Logout
        </Button>
      </Header>
      <Content style={{ padding: '50px' }}>
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
            <Title level={2} style={{ marginTop: '16px' }}>
              Welcome to MFA!
            </Title>
            <Text type="secondary">You have successfully authenticated</Text>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card bordered>
                <Statistic
                  title="Account Status"
                  value="Active"
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered>
                <Statistic
                  title="Email Verified"
                  value="Yes"
                  prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginTop: '24px' }} title="Security Features">
            <ul style={{ lineHeight: '2.5' }}>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Email-based registration with OTP verification</li>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Password policy enforcement (min 8 chars, uppercase, lowercase, digit, special char)</li>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Brute-force protection with account lockout</li>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Redis-stored temporary tokens for OTP and password reset</li>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />JWT-based authentication with access and refresh tokens</li>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Secure password reset via email</li>
            </ul>
          </Card>

          <Card style={{ marginTop: '24px' }} title="User Information">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Email:</Text>
              </Col>
              <Col span={12}>
                <Text>{email || 'logged-in-user@example.com'}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Text strong>Authentication:</Text>
              </Col>
              <Col span={12}>
                <Text>JWT Token (Bearer)</Text>
              </Col>
            </Row>
          </Card>
        </Card>
      </Content>
    </Layout>
  );
};

export default Dashboard;
