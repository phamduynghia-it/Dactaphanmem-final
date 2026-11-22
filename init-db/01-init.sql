-- ========================================================
-- DATABASE SCHEMA & SAMPLE SEED DATA (POSTGRESQL 16)
-- Hệ thống Quản lý và Đặt sân bóng đá mini (FPMS)
-- Khởi tạo tự động cho Docker Container
-- ========================================================

DROP TABLE IF EXISTS booking_cancellations CASCADE;
DROP TABLE IF EXISTS payment_transaction CASCADE;
DROP TABLE IF EXISTS payment_method CASCADE;
DROP TABLE IF EXISTS booking_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS price_matrices CASCADE;
DROP TABLE IF EXISTS pitch_slots CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS pitches CASCADE;
DROP TABLE IF EXISTS pitch_types CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

INSERT INTO roles (role_name, description) VALUES
    ('ROLE_ADMIN', 'Quản trị viên toàn quyền quản lý hệ thống'),
    ('ROLE_STAFF', 'Nhân viên trực sân, quản lý ca và thu tiền'),
    ('ROLE_CUSTOMER', 'Khách hàng thành viên đặt sân trực tuyến'),
    ('ROLE_MANAGER', 'Quản lý cơ sở sân bóng và bảng giá'),
    ('ROLE_ACCOUNTANT', 'Kế toán phụ trách đối soát và doanh thu');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    role_id INT NOT NULL REFERENCES roles(id)
);

INSERT INTO users (email, phone_number, password, full_name, status, role_id) VALUES
    ('admin@fpms.com', '0901234567', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Trần Văn Quản Trị', 'ACTIVE', 1),
    ('staff01@fpms.com', '0907654321', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Lê Văn Nhân Viên', 'ACTIVE', 2),
    ('staff02@fpms.com', '0908889999', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Phạm Thị Thu Ngân', 'ACTIVE', 2),
    ('customer01@gmail.com', '0912345678', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Nguyễn Văn Khách', 'ACTIVE', 3),
    ('customer02@gmail.com', '0987654321', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Hoàng Minh Tuấn', 'ACTIVE', 3);

CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO password_resets (email, otp_code, expires_at, user_id) VALUES
    ('admin@fpms.com', '123456', '2026-11-25 10:00:00', 1),
    ('staff01@fpms.com', '654321', '2026-11-25 11:30:00', 2),
    ('staff02@fpms.com', '789012', '2026-11-25 14:15:00', 3),
    ('customer01@gmail.com', '456789', '2026-11-25 16:45:00', 4),
    ('customer02@gmail.com', '987654', '2026-11-25 19:20:00', 5);

CREATE TABLE pitch_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    player_capacity INT NOT NULL,
    description VARCHAR(255)
);

INSERT INTO pitch_types (name, player_capacity, description) VALUES
    ('Sân 5 người', 10, 'Sân cỏ nhân tạo 5 người tiêu chuẩn mini'),
    ('Sân 7 người', 14, 'Sân cỏ nhân tạo 7 người bán chuyên nghiệp'),
    ('Sân 9 người', 18, 'Sân cỏ nhân tạo 9 người kích thước mở rộng'),
    ('Sân 11 người', 22, 'Sân cỏ nhân tạo 11 người kích thước chuẩn thi đấu FIFA'),
    ('Sân Futsal trong nhà', 10, 'Sân sàn gỗ futsal có mái che và điều hòa');

CREATE TABLE pitches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    pitch_type_id INT NOT NULL REFERENCES pitch_types(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description VARCHAR(255)
);

INSERT INTO pitches (name, pitch_type_id, status, description) VALUES
    ('Sân 5A', 1, 'ACTIVE', 'Sân 5 thảm cỏ nhân tạo mới thay năm 2026'),
    ('Sân 5B', 1, 'ACTIVE', 'Sân 5 khu vực khán đài A'),
    ('Sân 7A', 2, 'ACTIVE', 'Sân 7 tiêu chuẩn có hệ thống đèn LED cao cấp'),
    ('Sân 7B', 2, 'ACTIVE', 'Sân 7 gần khu vực căn tin và bãi giữ xe'),
    ('Sân Futsal F1', 5, 'MAINTENANCE', 'Sân trong nhà đang bảo trì hệ thống sàn gỗ');

CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_peak_hour BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_time_slots UNIQUE (start_time, end_time)
);

INSERT INTO time_slots (start_time, end_time, is_peak_hour, is_active) VALUES
    ('06:00:00', '07:30:00', FALSE, TRUE),
    ('16:00:00', '17:30:00', FALSE, TRUE),
    ('17:30:00', '19:00:00', TRUE, TRUE),
    ('19:00:00', '20:30:00', TRUE, TRUE),
    ('20:30:00', '22:00:00', FALSE, TRUE);

CREATE TABLE pitch_slots (
    id SERIAL PRIMARY KEY,
    pitch_id INT NOT NULL REFERENCES pitches(id),
    timeslot_id INT NOT NULL REFERENCES time_slots(id),
    dateslot DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    price NUMERIC(12, 2) NOT NULL,
    hold_expires_at TIMESTAMP NULL,
    CONSTRAINT uk_pitch_slot_date UNIQUE (pitch_id, timeslot_id, dateslot)
);

INSERT INTO pitch_slots (pitch_id, timeslot_id, dateslot, status, price, hold_expires_at) VALUES
    (1, 1, '2026-11-25', 'AVAILABLE', 200000.00, NULL),
    (1, 3, '2026-11-25', 'BOOKED', 350000.00, NULL),
    (2, 3, '2026-11-25', 'HOLDING', 350000.00, '2026-11-25 17:15:00'),
    (3, 4, '2026-11-25', 'BOOKED', 550000.00, NULL),
    (4, 5, '2026-11-25', 'AVAILABLE', 450000.00, NULL);

CREATE TABLE price_matrices (
    id SERIAL PRIMARY KEY,
    is_peak_hour BOOLEAN NOT NULL DEFAULT FALSE,
    pitch_type_id INT NOT NULL REFERENCES pitch_types(id) ON DELETE CASCADE,
    day_type VARCHAR(20) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    CONSTRAINT uk_price_matrices UNIQUE (is_peak_hour, pitch_type_id, day_type)
);

INSERT INTO price_matrices (is_peak_hour, pitch_type_id, day_type, price) VALUES
    (FALSE, 1, 'WEEKDAY', 200000.00),
    (TRUE, 1, 'WEEKDAY', 350000.00),
    (TRUE, 1, 'WEEKEND', 400000.00),
    (FALSE, 2, 'WEEKDAY', 400000.00),
    (TRUE, 2, 'WEEKEND', 600000.00);

CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

INSERT INTO holidays (holiday_date, holiday_name, description) VALUES
    ('2026-01-01', 'Tết Dương Lịch', 'Nghỉ Tết Dương Lịch đầu năm mới'),
    ('2026-04-30', 'Ngày Giải Phóng Miền Nam', 'Kỷ niệm ngày giải phóng miền Nam 30/4'),
    ('2026-05-01', 'Ngày Quốc Tế Lao Động', 'Kỷ niệm ngày Quốc tế Lao động 1/5'),
    ('2026-09-02', 'Ngày Quốc Khánh', 'Kỷ niệm Quốc Khánh 2/9'),
    ('2026-10-10', 'Ngày Giải Phóng Thủ Đô', 'Kỷ niệm ngày giải phóng thủ đô Hà Nội');

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255)
);

INSERT INTO services (name, unit, price, category, is_active, description) VALUES
    ('Nước khoáng Aquafina 500ml', 'Chai', 10000.00, 'DRINK', TRUE, 'Nước khoáng tinh khiết đóng chai 500ml'),
    ('Nước tăng lực Revive bù khoáng', 'Chai', 15000.00, 'DRINK', TRUE, 'Nước giải khát bổ sung điện giải thể thao'),
    ('Bộ áo bib thi đấu (10 áo)', 'Bộ', 30000.00, 'EQUIPMENT', TRUE, 'Bộ áo lưới phân đội màu cam hoặc xanh'),
    ('Thuê bóng thi đấu số 4', 'Quả', 20000.00, 'EQUIPMENT', TRUE, 'Bóng đúc tiêu chuẩn FIFA cho sân mini'),
    ('Dịch vụ Trọng tài điều khiển', 'Trận', 200000.00, 'REFEREE', TRUE, 'Trọng tài có bằng cấp điều khiển trận đấu');

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    pitch_slot_id INT NOT NULL REFERENCES pitch_slots(id),
    customer_id INT REFERENCES users(id),
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    booking_type VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
    total_pitch_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    total_service_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    customer_note TEXT
);

INSERT INTO bookings (booking_code, pitch_slot_id, customer_id, guest_name, guest_phone, deposit_amount, booking_type, total_pitch_amount, status, total_service_amount, total_amount, customer_note) VALUES
    ('BK2026112501', 1, 4, 'Nguyễn Văn Khách', '0912345678', 60000.00, 'ONLINE', 200000.00, 'CONFIRMED', 0.00, 200000.00, 'Cần mượn thêm bơm bóng'),
    ('BK2026112502', 2, 5, 'Hoàng Minh Tuấn', '0987654321', 120000.00, 'ONLINE', 350000.00, 'CONFIRMED', 50000.00, 400000.00, 'Yêu cầu áo bib màu xanh lá cây'),
    ('BK2026112503', 3, 4, 'Nguyễn Văn Khách', '0912345678', 105000.00, 'ONLINE', 350000.00, 'PENDING_PAYMENT', 0.00, 350000.00, 'Khách đang thực hiện chuyển khoản cọc'),
    ('BK2026112504', 4, NULL, 'Đặng Hải Đăng', '0944556677', 240000.00, 'DIRECT', 550000.00, 'COMPLETED', 250000.00, 800000.00, 'Thuê trọng tài bắt chính và 5 chai nước (Khách vãng lai tại quầy)'),
    ('BK2026112505', 5, 5, 'Hoàng Minh Tuấn', '0987654321', 135000.00, 'ONLINE', 450000.00, 'CANCELLED', 0.00, 450000.00, 'Khách xin hủy do thời tiết mưa bão');

CREATE TABLE booking_services (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    CONSTRAINT uk_booking_services UNIQUE (booking_id, service_id)
);

INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price) VALUES
    (2, 2, 2, 15000.00, 30000.00),
    (2, 4, 1, 20000.00, 20000.00),
    (4, 1, 5, 10000.00, 50000.00),
    (4, 5, 1, 200000.00, 200000.00),
    (5, 3, 1, 30000.00, 30000.00);

CREATE TABLE payment_method (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255),
    icon_url VARCHAR(255)
);

INSERT INTO payment_method (code, name, is_maintenance, is_active, description, icon_url) VALUES
    ('VNPAY', 'Cổng thanh toán VNPAY-QR', FALSE, TRUE, 'Thanh toán quét mã QR qua ngân hàng', 'https://cdn.fpms.vn/icons/vnpay.png'),
    ('MOMO', 'Ví điện tử MoMo', FALSE, TRUE, 'Thanh toán trực tuyến qua ứng dụng ví MoMo', 'https://cdn.fpms.vn/icons/momo.png'),
    ('ZALOPAY', 'Ví điện tử ZaloPay', FALSE, TRUE, 'Thanh toán qua ứng dụng ZaloPay', 'https://cdn.fpms.vn/icons/zalopay.png'),
    ('CASH', 'Tiền mặt tại quầy', FALSE, TRUE, 'Thanh toán trực tiếp cho nhân viên trực sân', 'https://cdn.fpms.vn/icons/cash.png'),
    ('BANK_TRANSFER', 'Chuyển khoản ngân hàng 24/7', FALSE, TRUE, 'Chuyển khoản trực tiếp vào tài khoản ngân hàng', 'https://cdn.fpms.vn/icons/bank.png');

CREATE TABLE payment_transaction (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    payment_method_id INT NOT NULL REFERENCES payment_method(id),
    booking_id INT NOT NULL REFERENCES bookings(id),
    payment_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

INSERT INTO payment_transaction (transaction_code, payment_method_id, booking_id, payment_type, amount, status) VALUES
    ('TXN20261125001', 1, 1, 'DEPOSIT', 60000.00, 'SUCCESS'),
    ('TXN20261125002', 2, 2, 'DEPOSIT', 120000.00, 'SUCCESS'),
    ('TXN20261125003', 1, 3, 'DEPOSIT', 105000.00, 'PENDING'),
    ('TXN20261125004', 4, 4, 'FULL', 800000.00, 'SUCCESS'),
    ('TXN20261125005', 5, 5, 'REFUND', 135000.00, 'SUCCESS');

CREATE TABLE booking_cancellations (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id),
    requested_by INT NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    refund_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,
    approved_by INT REFERENCES users(id),
    processed_at TIMESTAMP
);

INSERT INTO booking_cancellations (booking_id, requested_by, reason, refund_amount, refund_status, requested_at, rejection_reason, approved_by, processed_at) VALUES
    (5, 4, 'Thời tiết mưa bão không thể thi đấu', 135000.00, 'REFUNDED', '2026-11-24 09:00:00', NULL, 2, '2026-11-24 09:30:00'),
    (3, 4, 'Đội có việc gia đình đột xuất', 105000.00, 'APPROVED', '2026-11-24 14:00:00', NULL, 2, '2026-11-24 15:00:00'),
    (2, 5, 'Đối tác giao hữu báo hoãn', 0.00, 'REJECTED', '2026-11-25 17:00:00', 'Yêu cầu hủy quá sát giờ thi đấu (dưới 2 tiếng)', 2, '2026-11-25 17:10:00'),
    (1, 4, 'Đội thiếu quân số không đủ người đá', 60000.00, 'PENDING', '2026-11-25 18:00:00', NULL, NULL, NULL),
    (4, 5, 'Đặt nhầm khung giờ thi đấu', 240000.00, 'PENDING', '2026-11-25 19:00:00', NULL, NULL, NULL);
