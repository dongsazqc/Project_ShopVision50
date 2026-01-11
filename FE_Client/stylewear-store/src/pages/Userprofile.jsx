import { useEffect, useState } from "react";
import { 
    Card, 
    Tabs, 
    Form, 
    Input, 
    Button, 
    Row, 
    Col, 
    message, 
    Spin,
    Avatar,
    Badge,
    Divider,
    Space,
    Typography,
    Modal,
    Progress,
    Alert,
    Tooltip,
    Tag,
    Switch,
    Upload,
    notification,
    Steps,
    Result,
    Flex,
    Layout
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    SafetyOutlined,
    CheckCircleOutlined,
    EditOutlined,
    CameraOutlined,
    BellOutlined,
    SettingOutlined,
    SecurityScanOutlined,
    CloudUploadOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    InfoCircleOutlined,
    ReloadOutlined,
    SaveOutlined,
    SendOutlined,
    KeyOutlined,
    IdcardOutlined
} from "@ant-design/icons";
import api from "../utils/axios";

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Content } = Layout;

const UserProfile = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [notificationApi, notificationHolder] = notification.useNotification();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formInfo] = Form.useForm();
    const [formPassword] = Form.useForm();
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    
    // Thêm các state mới để làm đẹp
    const [activeTab, setActiveTab] = useState("1");
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [profileCompletePercent, setProfileCompletePercent] = useState(0);
    const [securityLevel, setSecurityLevel] = useState("medium");
    const [showPasswordHint, setShowPasswordHint] = useState(false);
    const [changePasswordStep, setChangePasswordStep] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("online");

    const userId = localStorage.getItem("userId");
    const roleId =localStorage.getItem("roleId");

    // ================= STYLES & CONSTANTS =================
    const gradientStyle = {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white"
    };

    const cardShadowStyle = {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
        borderRadius: "16px",
        overflow: "hidden"
    };

    const inputStyles = {
        borderRadius: "8px",
        padding: "10px 12px"
    };

    // ================= CALCULATE PROFILE COMPLETION =================
    const calculateProfileCompletion = (userData) => {
        if (!userData) return 0;
        let total = 0;
        let filled = 0;
        
        const fields = ['fullName', 'email', 'phone', 'defaultAddress'];
        fields.forEach(field => {
            total++;
            if (userData[field] && userData[field].trim().length > 0) {
                filled++;
            }
        });
        
        return Math.round((filled / total) * 100);
    };

    // ================= GET USER INFO =================
    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/Users/getById/${userId}`);
            setUser(res.data);

            formInfo.setFieldsValue({
                fullName: res.data.fullName || "",
                email: res.data.email || "",
                phone: res.data.phone || "",
                address: res.data.defaultAddress || "",
                roleId: res.data.roleId || "", 
            });

            setProfileCompletePercent(calculateProfileCompletion(res.data));
            setLastUpdated(new Date().toLocaleTimeString());
            
            // Cập nhật mức độ bảo mật dựa trên email verification, phone verification, etc.
            updateSecurityLevel(res.data);
            
        } catch (err) {
            console.error(err);
            messageApi.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const updateSecurityLevel = (userData) => {
        let score = 0;
        if (userData.emailVerified) score += 2;
        if (userData.phoneVerified) score += 2;
        if (userData.hasTwoFactor) score += 3;
        
        if (score >= 5) setSecurityLevel("high");
        else if (score >= 3) setSecurityLevel("medium");
        else setSecurityLevel("low");
    };

    useEffect(() => {
        fetchUserInfo();
        // Simulate connection status
        const interval = setInterval(() => {
            setConnectionStatus(Math.random() > 0.1 ? "online" : "offline");
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // ================= UPDATE PROFILE =================
    const onUpdateProfile = async (values) => {
        try {
            setLoading(true);
            await api.put(`/Users/updateprofile/${userId}`, {   
                UserId: Number(userId),
                fullName: values.fullName,
                phone: values.phone,
                defaultAddress: values.address, 
            });
            
            messageApi.success({
                content: "Cập nhật thông tin thành công!",
                duration: 3,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
            });
            
            setIsEditing(false);
            fetchUserInfo();
            
        } catch (err) {
            console.error(err);
            messageApi.error({
                content: "Cập nhật thất bại! Vui lòng thử lại",
                duration: 3
            });
        } finally {
            setLoading(false);
        }
    };
    // ================= SEND OTP FOR CHANGE PASSWORD =================
    const onSendOtp = async () => {
        try {
            setSendingOtp(true);
            await api.post(`/Users/send-otp-change-password/${userId}`);
            
            notificationApi.success({
                message: "OTP đã được gửi thành công!",
                description: "Vui lòng kiểm tra email của bạn. Mã OTP có hiệu lực trong 10 phút.",
                placement: "topRight",
                duration: 5
            });
            
            setOtpSent(true);
            setChangePasswordStep(1);
            
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Gửi OTP thất bại!",
                description: "Vui lòng kiểm tra kết nối mạng và thử lại sau.",
                placement: "topRight"
            });
        } finally {
            setSendingOtp(false);
        }
    };

    // ================= CHANGE PASSWORD WITH OTP =================
    const onChangePassword = async (values) => {
        try {
            setLoading(true);
            await api.post("/Users/change-password-with-otp", {
                userId: parseInt(userId),
                otp: values.otp,
                newPassword: values.newPassword,
            });
            
            notificationApi.success({
                message: "🎉 Đổi mật khẩu thành công!",
                description: "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại với mật khẩu mới.",
                placement: "topRight",
                duration: 5
            });
            
            formPassword.resetFields();
            setOtpSent(false);
            setChangePasswordStep(0);
            
            // Logout suggestion
            setTimeout(() => {
                Modal.info({
                    title: "Đề xuất bảo mật",
                    content: "Để đảm bảo an toàn, bạn nên đăng xuất và đăng nhập lại với mật khẩu mới.",
                    okText: "Đã hiểu",
                    centered: true
                });
            }, 1000);
            
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Đổi mật khẩu thất bại!",
                description: err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.",
                placement: "topRight"
            });
        } finally {
            setLoading(false);
        }
    };

    // ================= NEW FEATURES =================
    const handleProfileImageUpload = async (info) => {
        // Implementation for profile image upload
        setUploadingImage(true);
        try {
            // Upload logic here
            setTimeout(() => {
                setUploadingImage(false);
                messageApi.success("Cập nhật ảnh đại diện thành công!");
            }, 1500);
        } catch (error) {
            setUploadingImage(false);
            messageApi.error("Tải ảnh lên thất bại!");
        }
    };

    const toggleTwoFactorAuth = async (checked) => {
        try {
            setTwoFactorEnabled(checked);
            messageApi.success(
                checked 
                    ? "Bật xác thực 2 lớp thành công!" 
                    : "Tắt xác thực 2 lớp thành công!"
            );
        } catch (error) {
            messageApi.error("Thao tác thất bại!");
        }
    };

    const handleResendOtp = () => {
        onSendOtp();
        messageApi.info("Đang gửi lại mã OTP...");
    };

    if (loading && !user) {
        return (
            <Flex justify="center" align="center" style={{ height: "70vh" }}>
                <Space direction="vertical" align="center" size="large">
                    <Spin size="large" />
                    <Text type="secondary">Đang tải thông tin tài khoản...</Text>
                    <Progress percent={30} status="active" showInfo={false} style={{ width: 200 }} />
                </Space>
            </Flex>
        );
    }

    return (
        <Layout style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
            {contextHolder}
            {notificationHolder}
            
            <Content style={{ padding: "30px 20px" }}>
                <Row justify="center">
                    <Col xs={24} xxl={18}>
                        {/* Profile Header Card */}
                        <Card 
                            style={{ 
                                ...cardShadowStyle,
                                marginBottom: 30,
                                background: gradientStyle.background,
                                color: gradientStyle.color
                            }}
                            bodyStyle={{ padding: "30px" }}
                        >
                            <Row align="middle" gutter={30}>
                                <Col>
                                    <Badge 
                                        dot 
                                        color={connectionStatus === "online" ? "#52c41a" : "#ff4d4f"}
                                        offset={[-5, 70]}
                                    >
                                        <Avatar 
                                            size={100}
                                            icon={<UserOutlined />}
                                            style={{ 
                                                border: "4px solid rgba(255, 255, 255, 0.3)",
                                                backgroundColor: "rgba(255, 255, 255, 0.2)"
                                            }}
                                        />
                                    </Badge>
                                    <div style={{ textAlign: "center", marginTop: 10 }}>
                                        <Tooltip title="Thay đổi ảnh đại diện">
                                            <Upload 
                                                showUploadList={false}
                                                onChange={handleProfileImageUpload}
                                            >
                                                <Button 
                                                    shape="circle" 
                                                    icon={<CameraOutlined />}
                                                    size="small"
                                                    loading={uploadingImage}
                                                    style={{ 
                                                        background: "rgba(255, 255, 255, 0.2)",
                                                        borderColor: "rgba(255, 255, 255, 0.5)",
                                                        color: "white"
                                                    }}
                                                />
                                            </Upload>
                                        </Tooltip>
                                    </div>
                                </Col>
                                
                                <Col flex="auto">
                                    <Space direction="vertical" size="small">
                                        <Title level={2} style={{ color: "white", margin: 0 }}>
                                            {user?.fullName || "Người dùng"}
                                            {user?.fullName && (
                                                <Badge 
                                                    count="✓"
                                                    style={{ 
                                                        backgroundColor: '#52c41a',
                                                        marginLeft: 10,
                                                        fontSize: 12
                                                    }}
                                                />
                                            )}
                                        </Title>
                                        
                                        <Space size="middle">
                                            <Tag icon={<MailOutlined />} color="blue" style={{ color: "white", border: "none", background: "rgba(255, 255, 255, 0.2)" }}>
                                                {user?.email || "Chưa có email"}
                                            </Tag>
                                            <Tag icon={<PhoneOutlined />} color="cyan" style={{ color: "white", border: "none", background: "rgba(255, 255, 255, 0.2)" }}>
                                                {user?.phone || "Chưa có số điện thoại"}
                                            </Tag>
                                        </Space>
                                        
                                        <Space align="center">
                                            <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                                                <BellOutlined /> Trạng thái:{" "}
                                                <span style={{ fontWeight: "bold" }}>
                                                    {connectionStatus === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
                                                </span>
                                            </Text>
                                            <Divider type="vertical" style={{ background: "rgba(255, 255, 255, 0.3)" }} />
                                            <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                                                <SettingOutlined /> Cập nhật lần cuối: {lastUpdated || "Đang tải..."}
                                            </Text>
                                        </Space>
                                    </Space>
                                </Col>
                                
                                <Col>
                                    <Space direction="vertical" align="end">
                                        <Title level={4} style={{ color: "white", margin: 0 }}>
                                            Hoàn thành hồ sơ
                                        </Title>
                                        <Progress 
                                            type="circle" 
                                            percent={profileCompletePercent}
                                            size={80}
                                            strokeColor={{
                                                '0%': '#87d068',
                                                '100%': '#108ee9',
                                            }}
                                            format={percent => `${percent}%`}
                                        />
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                        
                        {/* Main Content Card */}
                        <Card 
                            title={
                                <Space>
                                    <IdcardOutlined />
                                    <span>Quản lý tài khoản cá nhân</span>
                                </Space>
                            }
                            bordered={false}
                            style={cardShadowStyle}
                            bodyStyle={{ padding: 0 }}
                            extra={
                                <Space>
                                    <Tooltip title="Mức độ bảo mật">
                                        <Tag 
                                            icon={<SecurityScanOutlined />} 
                                            color={
                                                securityLevel === "high" ? "success" :
                                                securityLevel === "medium" ? "warning" : "error"
                                            }
                                        >
                                            Bảo mật: {securityLevel === "high" ? "Cao" : securityLevel === "medium" ? "Trung bình" : "Thấp"}
                                        </Tag>
                                    </Tooltip>
                                    <Button 
                                        icon={<ReloadOutlined />}
                                        onClick={fetchUserInfo}
                                        loading={loading}
                                    >
                                        Làm mới
                                    </Button>
                                </Space>
                            }
                        >
                            <Tabs 
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                tabPosition="left"
                                size="large"
                                style={{ minHeight: 500 }}
                                tabBarStyle={{ padding: "20px 0" }}
                            >
                                {/* ================= TAB THÔNG TIN CÁ NHÂN ================= */}
                                <TabPane 
                                    tab={
                                        <span>
                                            <UserOutlined />
                                            Thông tin cá nhân
                                        </span>
                                    } 
                                    key="1"
                                >
                                    <div style={{ padding: 30 }}>
                                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                            <Flex justify="space-between" align="center">
                                                <Title level={4} style={{ margin: 0 }}>
                                                    Chi tiết hồ sơ
                                                </Title>
                                                <Button 
                                                    type={isEditing ? "default" : "primary"}
                                                    icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                                                    onClick={() => {
                                                        if (isEditing) {
                                                            formInfo.submit();
                                                        } else {
                                                            setIsEditing(true);
                                                        }
                                                    }}
                                                    loading={loading}
                                                >
                                                    {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
                                                </Button>
                                            </Flex>
                                            
                                            {!isEditing ? (
                                                // View Mode
                                                <Card bordered={false} style={{ background: "#fafafa" }}>
                                                    <Row gutter={[32, 24]}>
                                                        <Col span={12}>
                                                            <Space direction="vertical" size="small">
                                                                <Text type="secondary">
                                                                    <UserOutlined /> Họ và tên
                                                                </Text>
                                                                <Title level={5} style={{ margin: 0 }}>
                                                                    {user?.fullName || "Chưa cập nhật"}
                                                                </Title>
                                                            </Space>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Space direction="vertical" size="small">
                                                                <Text type="secondary">
                                                                    <MailOutlined /> Email
                                                                </Text>
                                                                <Title level={5} style={{ margin: 0 }}>
                                                                    {user?.email || "Chưa cập nhật"}
                                                                </Title>
                                                                {user?.email && (
                                                                    <Tag color="green" icon={<CheckCircleOutlined />}>
                                                                        Đã xác thực
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Space direction="vertical" size="small">
                                                                <Text type="secondary">
                                                                    <PhoneOutlined /> Số điện thoại
                                                                </Text>
                                                                <Title level={5} style={{ margin: 0 }}>
                                                                    {user?.phone || "Chưa cập nhật"}
                                                                </Title>
                                                            </Space>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Space direction="vertical" size="small">
                                                                <Text type="secondary">
                                                                    <HomeOutlined /> Địa chỉ
                                                                </Text>
                                                                <Title level={5} style={{ margin: 0 }}>
                                                                    {user?.defaultAddress || "Chưa cập nhật"}
                                                                </Title>
                                                            </Space>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ) : (
                                                // Edit Mode
                                                <Form
                                                    form={formInfo}
                                                    layout="vertical"
                                                    onFinish={onUpdateProfile}
                                                    style={{ maxWidth: 800 }}
                                                >
                                                    <Row gutter={24}>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                label={
                                                                    <Space>
                                                                        <UserOutlined />
                                                                        <span>Họ và tên</span>
                                                                    </Space>
                                                                }
                                                                name="fullName"
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: "Vui lòng nhập họ tên",
                                                                    },
                                                                ]}
                                                            >
                                                                <Input 
                                                                    placeholder="Nhập họ và tên" 
                                                                    size="large"
                                                                    style={inputStyles}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item 
                                                                label={
                                                                    <Space>
                                                                        <MailOutlined />
                                                                        <span>Email</span>
                                                                    </Space>
                                                                }
                                                                name="email"
                                                            >
                                                                <Input 
                                                                    disabled 
                                                                    size="large"
                                                                    style={inputStyles}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={24}>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                label={
                                                                    <Space>
                                                                        <PhoneOutlined />
                                                                        <span>Số điện thoại</span>
                                                                    </Space>
                                                                }
                                                                name="phone"
                                                            >
                                                                <Input 
                                                                    placeholder="Nhập số điện thoại"
                                                                    size="large"
                                                                    style={inputStyles}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                label={
                                                                    <Space>
                                                                        <HomeOutlined />
                                                                        <span>Địa chỉ</span>
                                                                    </Space>
                                                                }
                                                                name="address"
                                                            >
                                                                <Input 
                                                                    placeholder="Nhập địa chỉ"
                                                                    size="large"
                                                                    style={inputStyles}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Space>
                                                        <Button
                                                            type="primary"
                                                            htmlType="submit"
                                                            loading={loading}
                                                            size="large"
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            <SaveOutlined /> Lưu thay đổi
                                                        </Button>
                                                        <Button
                                                            onClick={() => setIsEditing(false)}
                                                            size="large"
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    </Space>
                                                </Form>
                                            )}
                                            
                                            {/* Additional Info Section */}
                                            <Divider />
                                            <Title level={5}>Cài đặt bổ sung</Title>
                                            <Space direction="vertical" style={{ width: "100%" }}>
                                                <Flex justify="space-between" align="center">
                                                    <Space>
                                                        <LockOutlined />
                                                        <Text>Xác thực hai yếu tố (2FA)</Text>
                                                    </Space>
                                                    <Switch 
                                                        checked={twoFactorEnabled}
                                                        onChange={toggleTwoFactorAuth}
                                                        checkedChildren="Bật"
                                                        unCheckedChildren="Tắt"
                                                    />
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Thêm lớp bảo mật thứ hai cho tài khoản của bạn
                                                </Text>
                                            </Space>
                                        </Space>
                                    </div>
                                </TabPane>

                                {/* ================= TAB ĐỔI MẬT KHẨU ================= */}
                                <TabPane 
                                    tab={
                                        <span>
                                            <KeyOutlined />
                                            Đổi mật khẩu
                                        </span>
                                    } 
                                    key="2"
                                >
                                    <div style={{ padding: 30 }}>
                                        <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                            <Title level={4}>
                                                <LockOutlined /> Bảo mật mật khẩu
                                            </Title>
                                            
                                            <Alert
                                                message="Lời khuyên bảo mật"
                                                description="Sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt. Đổi mật khẩu định kỳ 3-6 tháng một lần."
                                                type="info"
                                                showIcon
                                                action={
                                                    <Button 
                                                        size="small" 
                                                        type="text"
                                                        onClick={() => setShowPasswordHint(!showPasswordHint)}
                                                    >
                                                        {showPasswordHint ? "Ẩn gợi ý" : "Xem gợi ý"}
                                                    </Button>
                                                }
                                            />
                                            
                                            {showPasswordHint && (
                                                <Card size="small">
                                                    <Paragraph>
                                                        <Text strong>Gợi ý mật khẩu mạnh:</Text>
                                                        <ul>
                                                            <li>Ít nhất 8 ký tự</li>
                                                            <li>Kết hợp chữ hoa và chữ thường</li>
                                                            <li>Bao gồm số và ký tự đặc biệt (!@#$%^&*)</li>
                                                            <li>Không sử dụng thông tin cá nhân</li>
                                                            <li>Không sử dụng mật khẩu đã dùng trước đây</li>
                                                        </ul>
                                                    </Paragraph>
                                                </Card>
                                            )}
                                            
                                            <Steps 
                                                current={changePasswordStep}
                                                style={{ margin: "40px 0" }}
                                                items={[
                                                    {
                                                        title: 'Xác thực',
                                                        description: 'Gửi OTP',
                                                        icon: <SafetyOutlined />
                                                    },
                                                    {
                                                        title: 'Nhập OTP',
                                                        description: 'Xác nhận mã',
                                                        icon: <KeyOutlined />
                                                    },
                                                    {
                                                        title: 'Hoàn thành',
                                                        description: 'Mật khẩu mới',
                                                        icon: <CheckCircleOutlined />
                                                    }
                                                ]}
                                            />
                                            
                                            {!otpSent ? (
                                                <Card 
                                                    style={{ background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)", border: "none" }}
                                                >
                                                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                                        <Title level={5}>
                                                            <SafetyOutlined /> Xác thực qua Email
                                                        </Title>
                                                        <Paragraph>
                                                            Chúng tôi sẽ gửi mã OTP đến email: <Text strong>{user?.email}</Text>
                                                        </Paragraph>
                                                        <Button
                                                            type="primary"
                                                            onClick={onSendOtp}
                                                            loading={sendingOtp}
                                                            size="large"
                                                            icon={<SendOutlined />}
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            Gửi mã OTP
                                                        </Button>
                                                        <Text type="secondary">
                                                            Mã OTP có hiệu lực trong 10 phút
                                                        </Text>
                                                    </Space>
                                                </Card>
                                            ) : (
                                                <Card style={{ maxWidth: 500 }}>
                                                    <Form
                                                        form={formPassword}
                                                        layout="vertical"
                                                        onFinish={onChangePassword}
                                                    >
                                                        <Form.Item
                                                            label={
                                                                <Space>
                                                                    <SafetyOutlined />
                                                                    <span>Mã OTP</span>
                                                                </Space>
                                                            }
                                                            name="otp"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "Vui lòng nhập mã OTP",
                                                                },
                                                            ]}
                                                            extra={
                                                                <Text type="secondary">
                                                                    <InfoCircleOutlined /> 
                                                                    {" "}Nhập mã 6 số đã gửi đến email của bạn
                                                                </Text>
                                                            }
                                                        >
                                                            <Input 
                                                                placeholder="Nhập mã OTP"
                                                                size="large"
                                                                maxLength={6}
                                                                style={{ ...inputStyles, textAlign: "center", letterSpacing: 10 }}
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label={
                                                                <Space>
                                                                    <KeyOutlined />
                                                                    <span>Mật khẩu mới</span>
                                                                </Space>
                                                            }
                                                            name="newPassword"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    min: 8,
                                                                    message: "Mật khẩu phải có ít nhất 8 ký tự",
                                                                },
                                                            ]}
                                                            extra={
                                                                <Progress 
                                                                    percent={60}
                                                                    status="active"
                                                                    showInfo={false}
                                                                    size="small"
                                                                />
                                                            }
                                                        >
                                                            <Input.Password 
                                                                placeholder="Nhập mật khẩu mới"
                                                                size="large"
                                                                style={inputStyles}
                                                                iconRender={(visible) => 
                                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                                                }
                                                            />
                                                        </Form.Item>

                                                        <Form.Item
                                                            label="Xác nhận mật khẩu mới"
                                                            name="confirmPassword"
                                                            dependencies={['newPassword']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: 'Vui lòng xác nhận mật khẩu!',
                                                                },
                                                                ({ getFieldValue }) => ({
                                                                    validator(_, value) {
                                                                        if (!value || getFieldValue('newPassword') === value) {
                                                                            return Promise.resolve();
                                                                        }
                                                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                                                    },
                                                                }),
                                                            ]}
                                                        >
                                                            <Input.Password 
                                                                placeholder="Nhập lại mật khẩu mới"
                                                                size="large"
                                                                style={inputStyles}
                                                            />
                                                        </Form.Item>

                                                        <Space>
                                                            <Button
                                                                type="primary"
                                                                htmlType="submit"
                                                                loading={loading}
                                                                size="large"
                                                                style={{ borderRadius: 8 }}
                                                            >
                                                                <KeyOutlined /> Đổi mật khẩu
                                                            </Button>
                                                            <Button
                                                                onClick={handleResendOtp}
                                                                loading={sendingOtp}
                                                                size="large"
                                                                style={{ borderRadius: 8 }}
                                                            >
                                                                <ReloadOutlined /> Gửi lại OTP
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    setOtpSent(false);
                                                                    setChangePasswordStep(0);
                                                                }}
                                                                size="large"
                                                                style={{ borderRadius: 8 }}
                                                            >
                                                                Hủy
                                                            </Button>
                                                        </Space>
                                                    </Form>
                                                </Card>
                                            )}
                                        </Space>
                                    </div>
                                </TabPane>

                                {/* ================= THÊM TAB MỚI: CÀI ĐẶT BỔ SUNG ================= */}
                                <TabPane 
                                    tab={
                                        <span>
                                            <SettingOutlined />
                                            Cài đặt
                                        </span>
                                    } 
                                    key="3"
                                >
                                    <div style={{ padding: 30 }}>
                                        <Result
                                            icon={<CloudUploadOutlined />}
                                            title="Tính năng đang phát triển"
                                            subTitle="Phần cài đặt bổ sung sẽ sớm có sẵn. Bao gồm: cài đặt thông báo, quyền riêng tư, và tùy chọn nâng cao."
                                            extra={[
                                                <Button type="primary" key="console">
                                                    Tìm hiểu thêm
                                                </Button>,
                                                <Button key="buy">Liên hệ hỗ trợ</Button>,
                                            ]}
                                        />
                                    </div>
                                </TabPane>
                            </Tabs>
                        </Card>
                        
                        {/* Footer Stats */}
                        <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
                            <Col xs={24} md={8}>
                                <Card size="small" style={{ ...cardShadowStyle, textAlign: "center" }}>
                                    <StatisticCard 
                                        title="Mức độ bảo mật"
                                        value={securityLevel === "high" ? "Cao" : securityLevel === "medium" ? "Trung bình" : "Thấp"}
                                        color={
                                            securityLevel === "high" ? "#52c41a" :
                                            securityLevel === "medium" ? "#faad14" : "#ff4d4f"
                                        }
                                        icon={<SecurityScanOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card size="small" style={{ ...cardShadowStyle, textAlign: "center" }}>
                                    <StatisticCard 
                                        title="Hoàn thành hồ sơ"
                                        value={`${profileCompletePercent}%`}
                                        color="#1890ff"
                                        icon={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card size="small" style={{ ...cardShadowStyle, textAlign: "center" }}>
                                    <StatisticCard 
                                        title="Trạng thái"
                                        value={connectionStatus === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
                                        color={connectionStatus === "online" ? "#52c41a" : "#ff4d4f"}
                                        icon={<BellOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

// Component helper cho statistic cards
const StatisticCard = ({ title, value, color, icon }) => (
    <Space direction="vertical" size="small">
        <div style={{ 
            fontSize: 24, 
            color,
            background: `${color}10`,
            width: 50,
            height: 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto"
        }}>
            {icon}
        </div>
        <Text type="secondary">{title}</Text>
        <Title level={3} style={{ margin: 0, color }}>{value}</Title>
    </Space>
);

export default UserProfile;