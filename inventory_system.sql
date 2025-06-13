-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2025 at 08:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Superadmin','Admin','Manager','User') NOT NULL DEFAULT 'User',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@gmail.com', '0192023a7bbd73250516f069df18b500', 'Admin', 'Active', NULL, '2025-06-07 10:00:58', '2025-06-07 10:00:58'),
(3, 'Jade', 'blancaflor480@gmail.com', 'b220e82dde8abcb5dfe247ff49606009', 'Admin', 'Inactive', NULL, '2025-06-07 10:25:38', '2025-06-07 10:42:30'),
(4, 'superadmin', 'superadmin@gmail.com', 'ac497cfaba23c4184cb03b97e8c51e0a', 'Superadmin', 'Active', NULL, '2025-06-11 00:39:42', '2025-06-11 00:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `sn_description` varchar(255) NOT NULL,
  `tag_id` varchar(50) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `dept_area` varchar(100) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `assignee` varchar(100) DEFAULT NULL,
  `email_address` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `chain_of_ownership` text DEFAULT NULL,
  `previous_owner` varchar(100) DEFAULT NULL,
  `remarks_date` text DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `warranty_expiration` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `condition_status` varchar(50) DEFAULT NULL,
  `unit_value` decimal(10,2) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `total_value` decimal(10,2) DEFAULT NULL,
  `model_no` varchar(100) DEFAULT NULL,
  `serial_no` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `sn_description`, `tag_id`, `category`, `dept_area`, `office`, `designation`, `assignee`, `email_address`, `password`, `date_issued`, `mobile_number`, `chain_of_ownership`, `previous_owner`, `remarks_date`, `supplier`, `warranty_expiration`, `status`, `condition_status`, `unit_value`, `qty`, `total_value`, `model_no`, `serial_no`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 'HP Laptop ', 'MLCA0001', 'Laptop', 'Executive Office', 'BH', 'Executive Assistant ', 'Donname De Leon', 'ea@matlexph.com', '555888', '2024-08-05', '0969-6093273', 'First', 'N/A', '0000-00-00 00:00:00', 'Hp Store', NULL, 'In Use', 'Good', 21000.00, 1, 21000.00, 'AMD Ryzen 5 5500U with Radeon Graphics 2.10 GHz', '00356-24739-16044-AAOEM', 'Laptop was issued to Donna used already and price was not disclosed to her', '2025-06-07 02:56:43', '2025-06-07 02:56:43'),
(27, 'Test', 'MLCA0002', 'Laptop', 'Logistics', 'HQ', NULL, 'Test', 'Test@gmail.com', NULL, NULL, '09123456789', NULL, NULL, '2025-06-11 16:59:20.994000', NULL, NULL, 'Active', 'New', 0.00, 1, 0.00, NULL, '1111-AAAA-BBBB-QQQQ', NULL, '2025-06-11 08:59:21', '2025-06-11 08:59:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_id` (`tag_id`),
  ADD UNIQUE KEY `unique_serial_no` (`serial_no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
