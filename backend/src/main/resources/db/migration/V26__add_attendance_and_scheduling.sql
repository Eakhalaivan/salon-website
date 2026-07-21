CREATE TABLE shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_shift_staff FOREIGN KEY (staff_id) REFERENCES staff(id),
    CONSTRAINT fk_shift_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE attendances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    shift_id BIGINT,
    date DATE NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    status VARCHAR(50) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_staff FOREIGN KEY (staff_id) REFERENCES staff(id),
    CONSTRAINT fk_attendance_shift FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE shift_swap_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_staff_id BIGINT NOT NULL,
    requester_shift_id BIGINT NOT NULL,
    target_staff_id BIGINT NOT NULL,
    target_shift_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    manager_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_swap_req_staff FOREIGN KEY (requester_staff_id) REFERENCES staff(id),
    CONSTRAINT fk_swap_req_shift FOREIGN KEY (requester_shift_id) REFERENCES shifts(id),
    CONSTRAINT fk_swap_tgt_staff FOREIGN KEY (target_staff_id) REFERENCES staff(id),
    CONSTRAINT fk_swap_tgt_shift FOREIGN KEY (target_shift_id) REFERENCES shifts(id)
);

CREATE TABLE app_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);
