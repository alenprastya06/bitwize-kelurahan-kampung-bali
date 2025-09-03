-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 13 Agu 2025 pada 00.54
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jakone`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int(11) NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `id_pengajuan` int(11) DEFAULT NULL,
  `kelengkapan_data_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `document_type` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `is_complete` tinyint(1) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data untuk tabel `documents`
--

INSERT INTO `documents` (`id`, `user_id`, `id_pengajuan`, `kelengkapan_data_id`, `file_name`, `file_path`, `file_size`, `mime_type`, `original_name`, `document_type`, `status`, `admin_notes`, `is_complete`, `uploaded_at`, `updated_at`) VALUES
(1, 2, 1, NULL, 'document-1752800070536-686126421.png', 'uploads/document-1752800070536-686126421.png', 354601, 'image/png', 'tripa.png', 'surat_pengantar_rt_rw', 'approved', '', 1, '2025-07-18 00:54:30', '2025-07-19 07:29:41'),
(2, 2, 3, NULL, 'document-1752911451482-307154449.pdf', 'uploads/document-1752911451482-307154449.pdf', 167036, 'application/pdf', 'file-1750406057888157913-eetwmr.pdf', 'surat_pengantar_rt_rw', 'approved', '', 1, '2025-07-19 07:50:51', '2025-07-19 07:52:28'),
(3, 2, 3, NULL, 'document-1752911458498-136335702.pdf', 'uploads/document-1752911458498-136335702.pdf', 562589, 'application/pdf', '20250711011451-23HLAImaLmCAV0ovvFgiGH1Wk-20250716170932.pdf', 'surat_kuasa_bermaterai', 'approved', '', 1, '2025-07-19 07:50:58', '2025-07-19 07:52:20'),
(4, 2, 3, NULL, 'document-1752911472573-410568121.png', 'uploads/document-1752911472573-410568121.png', 132223, 'image/png', 'kiwris.png', 'fc_ktp_penerima_kuasa', 'approved', '', 1, '2025-07-19 07:51:12', '2025-07-19 07:52:12'),
(5, 2, 3, NULL, 'document-1752911483816-830261662.png', 'uploads/document-1752911483816-830261662.png', 612022, 'image/png', 'Content (1).png', 'fc_ktp_pemohon', 'approved', '', 1, '2025-07-19 07:51:23', '2025-07-19 07:52:04'),
(7, 2, 1, NULL, 'document-1752948277732-362140882.pdf', 'uploads/document-1752948277732-362140882.pdf', 306, 'application/pdf', 'surat_pengantar_3 (2).pdf', 'fc_surat_pbb', 'approved', '', 1, '2025-07-19 18:04:37', '2025-07-20 10:25:34'),
(8, 2, 2, NULL, 'document-1752948379466-679602195.pdf', 'uploads/document-1752948379466-679602195.pdf', 306, 'application/pdf', 'surat_pengantar_3 (2).pdf', 'permohonan_para_ahli_waris', 'approved', '', 1, '2025-07-19 18:06:19', '2025-07-19 19:12:03'),
(9, 2, 3, NULL, 'document-1753004089880-321754176.pdf', 'uploads/document-1753004089880-321754176.pdf', 402009, 'application/pdf', 'surat_pengantar_2_2_1752977256327.pdf', 'fc_kk_pemohon', 'approved', '', 1, '2025-07-20 09:34:49', '2025-07-20 09:35:08'),
(10, 2, 1, NULL, 'document-1753006051424-222383323.pdf', 'uploads/document-1753006051424-222383323.pdf', 402802, 'application/pdf', 'surat_pengantar_2_2_1752985107091.pdf', 'surat_pernyataan_ahli_waris', 'approved', '', 1, '2025-07-20 10:07:31', '2025-07-20 10:25:28'),
(11, 2, 1, NULL, 'document-1753007024534-926321178.pdf', 'uploads/document-1753007024534-926321178.pdf', 402654, 'application/pdf', 'surat_pengantar_2_2_1752977946301.pdf', 'fc_ktp_pemohon', 'approved', '', 1, '2025-07-20 10:23:44', '2025-07-20 10:25:20'),
(12, 2, 1, NULL, 'document-1753007033103-687366252.png', 'uploads/document-1753007033103-687366252.png', 354601, 'image/png', 'tripa.png', 'fc_kk_pemohon', 'approved', '', 1, '2025-07-20 10:23:53', '2025-07-20 10:25:13'),
(13, 2, 1, NULL, 'document-1753007040593-852226567.png', 'uploads/document-1753007040593-852226567.png', 646056, 'image/png', 'bunga1.png', 'surat_pernyataan_penguasaan_fisik', 'approved', '', 1, '2025-07-20 10:24:00', '2025-07-20 10:25:07'),
(14, 2, 1, NULL, 'document-1753007046899-582823143.png', 'uploads/document-1753007046899-582823143.png', 822696, 'image/png', 'Group 1000004096.png', 'fc_surat_asal_usul_tanah', 'approved', '', 1, '2025-07-20 10:24:06', '2025-07-20 10:24:59'),
(15, 2, 1, NULL, 'document-1753007054062-515959834.pdf', 'uploads/document-1753007054062-515959834.pdf', 36382, 'application/pdf', 'PENOLAKAN-PENGAJUAN-1400000067.pdf', 'surat_pernyataan_tidak_sengketa', 'approved', '', 1, '2025-07-20 10:24:14', '2025-07-20 10:24:52'),
(16, 2, 1, NULL, 'document-1753007060679-726597508.pdf', 'uploads/document-1753007060679-726597508.pdf', 273234, 'application/pdf', 'Surat Lamaran kerja.pdf', 'berita_acara_peninjauan_lapangan', 'approved', '', 1, '2025-07-20 10:24:20', '2025-07-20 10:24:39'),
(17, 5, 2, NULL, 'document-1753007302714-405001921.pdf', 'uploads/document-1753007302714-405001921.pdf', 378791, 'application/pdf', 'surat_pengantar_2_1_1753007138744.pdf', 'permohonan_para_ahli_waris', 'approved', '', 1, '2025-07-20 10:28:22', '2025-07-20 10:31:10'),
(18, 5, 2, NULL, 'document-1753007308766-164544817.pdf', 'uploads/document-1753007308766-164544817.pdf', 402654, 'application/pdf', 'surat_pengantar_2_2_1752977946301.pdf', 'surat_pengantar_rt_rw', 'approved', '', 1, '2025-07-20 10:28:28', '2025-07-20 10:31:03'),
(19, 5, 2, NULL, 'document-1753007314936-216430840.pdf', 'uploads/document-1753007314936-216430840.pdf', 398810, 'application/pdf', 'surat_pengantar_2_3_1752937877562.pdf', 'fc_ktp_pewaris', 'approved', '', 1, '2025-07-20 10:28:34', '2025-07-20 10:30:56'),
(20, 5, 2, NULL, 'document-1753007321011-640033572.pdf', 'uploads/document-1753007321011-640033572.pdf', 398810, 'application/pdf', 'surat_pengantar_2_3_1752937877562.pdf', 'fc_ktp_ahli_waris', 'approved', '', 1, '2025-07-20 10:28:41', '2025-07-20 10:30:50'),
(21, 5, 2, NULL, 'document-1753007326328-493492951.pdf', 'uploads/document-1753007326328-493492951.pdf', 402802, 'application/pdf', 'surat_pengantar_2_2_1752985107091.pdf', 'fc_kk_ahli_waris', 'approved', '', 1, '2025-07-20 10:28:46', '2025-07-20 10:30:44'),
(22, 5, 2, NULL, 'document-1753007331207-420915689.pdf', 'uploads/document-1753007331207-420915689.pdf', 398810, 'application/pdf', 'surat_pengantar_2_3_1752937877562.pdf', 'fc_akta_kelahiran_ahli_waris', 'approved', '', 1, '2025-07-20 10:28:51', '2025-07-20 10:30:37'),
(23, 5, 2, NULL, 'document-1753007335716-569410267.pdf', 'uploads/document-1753007335716-569410267.pdf', 398810, 'application/pdf', 'surat_pengantar_2_3_1752937877562.pdf', 'fc_surat_nikah_pewaris', 'approved', '', 1, '2025-07-20 10:28:55', '2025-07-20 10:30:30'),
(24, 5, 2, NULL, 'document-1753007340997-769215494.pdf', 'uploads/document-1753007340997-769215494.pdf', 402012, 'application/pdf', 'surat_pengantar_2_3_1752976055553.pdf', 'surat_pernyataan_ahli_waris_bermaterai', 'approved', '', 1, '2025-07-20 10:29:01', '2025-07-20 10:30:23'),
(25, 5, 2, NULL, 'document-1753007351930-29156842.pdf', 'uploads/document-1753007351930-29156842.pdf', 402664, 'application/pdf', 'surat_pengantar_2_2_1753002666646.pdf', 'fc_akta_cerai_pewaris', 'approved', '', 1, '2025-07-20 10:29:11', '2025-07-20 10:30:17'),
(26, 5, 2, NULL, 'document-1753007357382-559589779.pdf', 'uploads/document-1753007357382-559589779.pdf', 402664, 'application/pdf', 'surat_pengantar_2_2_1753002666646.pdf', 'fc_surat_kematian_pewaris', 'approved', '', 1, '2025-07-20 10:29:17', '2025-07-20 10:30:09'),
(27, 5, 2, NULL, 'document-1753007361859-223231040.pdf', 'uploads/document-1753007361859-223231040.pdf', 402664, 'application/pdf', 'surat_pengantar_2_2_1753002666646.pdf', 'fc_surat_kematian_ahli_waris', 'approved', '', 1, '2025-07-20 10:29:21', '2025-07-20 10:30:01'),
(28, 5, 2, NULL, 'document-1753007367362-898455776.pdf', 'uploads/document-1753007367362-898455776.pdf', 402654, 'application/pdf', 'surat_pengantar_2_2_1752977946301.pdf', 'fc_ktp_2_saksi', 'approved', '', 1, '2025-07-20 10:29:27', '2025-07-20 10:29:55'),
(29, 7, 3, NULL, 'document-1753148929132-106782536.pdf', 'uploads/document-1753148929132-106782536.pdf', 39493, 'application/pdf', '29UC09AJA_PENGANTAR_MEDIS_48GOJ.pdf', 'surat_pengantar_rt_rw', 'approved', '', 1, '2025-07-22 01:48:49', '2025-07-22 01:54:14'),
(30, 7, 3, NULL, 'document-1753148942482-526445256.docx', 'uploads/document-1753148942482-526445256.docx', 23879, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '46c429ae6a01771a66c558fc9c2a96b1.docx', 'surat_kuasa_bermaterai', 'approved', '', 1, '2025-07-22 01:49:02', '2025-07-22 01:54:07'),
(31, 7, 3, NULL, 'document-1753148953541-553647764.pdf', 'uploads/document-1753148953541-553647764.pdf', 183853, 'application/pdf', '46c429ae6a01771a66c558fc9c2a96b1.pdf', 'fc_ktp_penerima_kuasa', 'approved', '', 1, '2025-07-22 01:49:13', '2025-07-22 01:54:00'),
(32, 7, 3, NULL, 'document-1753148963459-311920794.pdf', 'uploads/document-1753148963459-311920794.pdf', 183853, 'application/pdf', '46c429ae6a01771a66c558fc9c2a96b1.pdf', 'fc_ktp_pemohon', 'approved', '', 1, '2025-07-22 01:49:23', '2025-07-22 01:53:45'),
(33, 7, 3, NULL, 'document-1753148973156-762184859.docx', 'uploads/document-1753148973156-762184859.docx', 16890, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '1752509674870-System Requirement.docx', 'fc_kk_pemohon', 'approved', '', 1, '2025-07-22 01:49:33', '2025-07-22 01:53:34'),
(34, 2, 2, NULL, 'document-1753264334356-442793801.pdf', 'uploads/document-1753264334356-442793801.pdf', 378793, 'application/pdf', 'surat_pengantar_2_1_1753240933165.pdf', 'surat_pengantar_rt_rw', 'approved', '', 1, '2025-07-23 09:52:14', '2025-07-23 09:52:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `document_checklist_items`
--

CREATE TABLE `document_checklist_items` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `item_description` varchar(255) NOT NULL,
  `is_checked` tinyint(1) DEFAULT 0,
  `is_required` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kelengkapan_data`
--

CREATE TABLE `kelengkapan_data` (
  `id` int(11) NOT NULL,
  `rt` varchar(10) NOT NULL,
  `rw` varchar(10) NOT NULL,
  `no_surat_pengantar` varchar(50) NOT NULL,
  `tanggal_surat_pengantar` date NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `luas_lahan` decimal(10,2) NOT NULL,
  `alamat_lahan` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kelengkapan_data`
--

INSERT INTO `kelengkapan_data` (`id`, `rt`, `rw`, `no_surat_pengantar`, `tanggal_surat_pengantar`, `nama_lengkap`, `luas_lahan`, `alamat_lahan`, `created_at`, `updated_at`, `user_id`) VALUES
(1, '003', '003', '621/SP/RT/03/003/XII/023', '2023-12-05', 'Alen Prastya', 61.00, 'Jl RT. 003 RW. 003 Kel. Kampung Bali Kec. Tanah Abang Kota Administrasi Jakarta Pusat Prov. DKI Jakarta', '2025-07-20 00:19:21', '2025-07-20 02:45:43', 2),
(4, '004', '001', '621/SP/RT/03/003/XII/023', '2025-07-20', 'SIRI', 5000.00, 'Jalan Karang Malang', '2025-07-20 04:18:09', '2025-07-20 04:18:09', 2),
(5, '01', '04', '09876567casdq', '2025-07-14', 'Rindah Suharti', 230.00, 'Jalan Haruman', '2025-07-20 10:28:07', '2025-07-20 10:28:07', 5),
(6, '04', '01', '8y89237412dfas', '2025-07-22', 'Alen Prastya', 20.00, 'Jalan PLK II', '2025-07-22 01:46:47', '2025-07-22 01:46:47', 7),
(7, '0021', '001', '1235412341', '2025-07-23', 'Naura', 200.00, 'Jalan kauman', '2025-07-23 09:48:49', '2025-07-23 09:48:49', 2),
(9, '001', '002', 'SP-001', '2025-08-01', 'Budi', 100.00, 'Jl. Anggrek', '2025-08-12 09:26:07', '2025-08-12 09:26:07', 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_pengantar`
--

CREATE TABLE `surat_pengantar` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `id_pengajuan` int(11) NOT NULL,
  `kelengkapan_data_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `letter_number` varchar(100) NOT NULL,
  `letter_path` varchar(255) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `letter_content` text NOT NULL,
  `generated_at` datetime DEFAULT current_timestamp(),
  `status` enum('generated','downloaded','expired') NOT NULL DEFAULT 'generated',
  `approved_by` int(11) DEFAULT NULL,
  `approval_document` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_downloaded` tinyint(1) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data untuk tabel `surat_pengantar`
--

INSERT INTO `surat_pengantar` (`id`, `user_id`, `id_pengajuan`, `kelengkapan_data_id`, `document_id`, `letter_number`, `letter_path`, `original_file_name`, `letter_content`, `generated_at`, `status`, `approved_by`, `approval_document`, `expires_at`, `is_downloaded`, `download_count`, `updated_at`, `created_at`) VALUES
(160, 2, 2, 7, NULL, 'SP/STAND/2025/2213', 'uploads/surat_pengantar_2_2_1754467483266.pdf', 'surat_pengantar_2_2_1754467483266.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 15:04:50', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 08:05:00', '2025-08-06 08:04:50'),
(161, 2, 2, 7, NULL, 'SP/STAND/2025/0741', 'uploads/surat_pengantar_2_2_1754476321706.pdf', 'surat_pengantar_2_2_1754476321706.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:32:03', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:32:07', '2025-08-06 10:32:03'),
(162, 2, 1, 7, NULL, 'SP/STAND/2025/1434', 'uploads/surat_pengantar_2_1_1754476432611.pdf', 'surat_pengantar_2_1_1754476432611.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:33:54', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:33:58', '2025-08-06 10:33:54'),
(163, 2, 1, 7, NULL, 'SP/STAND/2025/7331', 'uploads/surat_pengantar_2_1_1754476558247.pdf', 'surat_pengantar_2_1_1754476558247.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:36:00', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:36:03', '2025-08-06 10:36:00'),
(164, 2, 1, 7, NULL, 'SP/STAND/2025/3845', 'uploads/surat_pengantar_2_1_1754476644651.pdf', 'surat_pengantar_2_1_1754476644651.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:37:26', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:37:31', '2025-08-06 10:37:26'),
(165, 2, 1, 7, NULL, 'SP/STAND/2025/9845', 'uploads/surat_pengantar_2_1_1754476700808.pdf', 'surat_pengantar_2_1_1754476700808.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:38:22', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:38:26', '2025-08-06 10:38:22'),
(166, 2, 1, 7, NULL, 'SP/STAND/2025/4073', 'uploads/surat_pengantar_2_1_1754476745416.pdf', 'surat_pengantar_2_1_1754476745416.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:39:07', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:39:12', '2025-08-06 10:39:07'),
(167, 2, 1, 7, NULL, 'SP/STAND/2025/2137', 'uploads/surat_pengantar_2_1_1754476813119.pdf', 'surat_pengantar_2_1_1754476813119.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:40:15', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:40:19', '2025-08-06 10:40:15'),
(168, 2, 1, 7, NULL, 'SP/STAND/2025/0219', 'uploads/surat_pengantar_2_1_1754476881188.pdf', 'surat_pengantar_2_1_1754476881188.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:41:25', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:41:35', '2025-08-06 10:41:25'),
(169, 2, 1, 7, NULL, 'SP/STAND/2025/1314', 'uploads/surat_pengantar_2_1_1754476962044.pdf', 'surat_pengantar_2_1_1754476962044.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:42:44', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:42:47', '2025-08-06 10:42:44'),
(170, 2, 1, 7, NULL, 'SP/STAND/2025/5176', 'uploads/surat_pengantar_2_1_1754477046133.pdf', 'surat_pengantar_2_1_1754477046133.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:44:07', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:44:11', '2025-08-06 10:44:07'),
(171, 2, 2, 7, NULL, 'SP/STAND/2025/2126', 'uploads/surat_pengantar_2_2_1754477453195.pdf', 'surat_pengantar_2_2_1754477453195.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:50:57', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:51:01', '2025-08-06 10:50:57'),
(172, 2, 1, 7, NULL, 'SP/STAND/2025/7770', 'uploads/surat_pengantar_2_1_1754477478621.pdf', 'surat_pengantar_2_1_1754477478621.pdf', '\nBerdasarkan surat pengantar RT 0021 RW 001 No.1235412341 Tanggal 23 Juli 2025, Menerangkan Bahwa benar nama tersebut diatas adalah warga kami yang ingin mengajukan PM1. Berdasarkan surat pernyataan tanggal 23 Juli 2025, benar yang bersangkutan diatas akan mengurus peningkatan Sertifikat Hak Guna Bangunan menjadi Sertifikat Hak Milik dengan data Sertifikat Hak Guna Bangunan No. 1310 an. Naura dengan luas 200.00  M2 yang terletak di Jalan kauman. DKI Jakarta dan objek tanah nya berdiri bangunan rumah tinggal. Surat keterangan ini diperlukan untuk kepengurursan Administrasi Ke BPN. Yang dipergunakan Sebagai : Apabila di kemudian hari keterangan/pengakuan yang bersangkutan tidak benar/melanggar aturan yang berlaku/membuat pengakuan/keterangan/keresahan/keberatan dari pihak yang berwenata sebagai pemilik yang memilafatkan surat keterangan ini, maka sepenuhnya menjadi tanggung jawab yang bersangkutan tanpa melibatkan aparat/pejabat yang menandatanganinya dan Surat Keterangan ini dinyatakan tidak berlaku/dibatalkan kecuali ada penyelesaian sesuai peraturan yang berlaku. Demikian Surat Keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan bukan merupakan rekomendasi dan berlaku selama 3 (tiga) bulan setelah tanggal diterbitkans', '2025-08-06 17:51:29', 'downloaded', 1, NULL, NULL, 0, 1, '2025-08-06 10:51:34', '2025-08-06 10:51:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_pengajuan`
--

CREATE TABLE `tabel_pengajuan` (
  `id_pengajuan` int(11) NOT NULL,
  `nama_pengajuan` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_pengajuan`
--

INSERT INTO `tabel_pengajuan` (`id_pengajuan`, `nama_pengajuan`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Standar Pelayanan Kelengkapan Administrasi Permohonan Rekomendasi Hak Atas Tanah Eks Kota Praja', 'Standar Pelayanan Kelengkapan Administrasi Permohonan Rekomendasi Hak Atas Tanah Eks Kota Praja', 'active', '2025-07-18 00:01:25', '2025-07-19 18:05:28'),
(2, 'Standar Pelayanan Pencatatan Surat Pernyataan Ahli Waris WNI', 'Standar Pelayanan Pencatatan Surat Pernyataan Ahli Waris WNI', 'active', '2025-07-18 00:01:25', '2025-07-19 18:05:20'),
(3, 'Standar Pelayanan Pemberian Surat Keterangan Peningkatan Hak atas tanah', 'Layanan untuk peningkatan hak atas tanah', 'active', '2025-07-18 00:01:25', '2025-07-18 00:01:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_picture` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nama_lengkap` varchar(255) DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL COMMENT 'L=Laki-laki, P=Perempuan',
  `agama` varchar(50) DEFAULT NULL,
  `kewarganegaraan` varchar(50) DEFAULT 'Indonesia',
  `no_ktp_sktld` varchar(20) DEFAULT NULL,
  `alamat_lengkap` text DEFAULT NULL,
  `pekerjaan` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `profile_picture`, `phone`, `address`, `is_active`, `email_verified`, `last_login`, `updated_at`, `nama_lengkap`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `agama`, `kewarganegaraan`, `no_ktp_sktld`, `alamat_lengkap`, `pekerjaan`) VALUES
(1, 'admin', 'admin@gmail.com', '$2b$10$xZ1HkjAfB5pdCCFryUJJROM8eKP85nz0ZtAzJ6XT7ZLn5xF4p5sNO', 'admin', '2025-07-18 00:38:55', NULL, NULL, NULL, 1, 0, NULL, '2025-07-18 00:38:55', NULL, NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, NULL),
(2, 'alen', 'alen@gmail.com', '$2b$10$TJcMobhkjl.C0KD4Qok6ku.lRSwgwB1CR38M5ojxIu0Bfkgbn0wem', 'user', '2025-07-18 00:39:49', 'https://example.com/pic.jpg', '0811111111', 'Jl. Melati No. 2', 1, 0, NULL, '2025-08-12 09:21:53', 'Alen Budi', 'Jakarta', '1990-01-01', 'L', 'Islam', 'Indonesia', '1234567890123456', 'Jl. Mawar No. 1', 'Karyawan'),
(4, 'tes', 'tes@gmai.com', '$2b$10$/03Gq1nI4rFuLw5vwOI8IuVMDF.FrrZkQKYpdNleYIRawB8ATweU.', 'user', '2025-07-19 07:10:05', NULL, NULL, NULL, 1, 0, NULL, '2025-07-19 07:10:05', NULL, NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, NULL),
(5, 'rindah', 'rindah@gmail.com', '$2b$10$39dgbnJtzlcOJLB4CBegDutC1yubVKuWx/mAgEbzf8fy3OijkcPNy', 'user', '2025-07-20 10:26:26', NULL, '098765456', NULL, 1, 0, NULL, '2025-07-20 10:27:22', 'Rindah Suharti', 'Cilacap', '2025-07-01', 'P', 'Islam', 'Indonesia', '3300987656789098', 'Jalan Kemanggisan Utam', 'Guru'),
(6, 'tes', 'tes@gmail.com', '$2b$10$NQpNnEr.jIwYE4XQjfXXsOIeqEiU3/ruSRJH2F8j2hks7kA.tEnGy', 'user', '2025-07-22 01:44:21', NULL, NULL, NULL, 1, 0, NULL, '2025-07-22 01:44:21', NULL, NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, NULL),
(7, 'alen1', 'alen1@gmail.com', '$2b$10$D6QPrRflLnrDLKm1M/gMkeWOh60zoyaXC0/8xAXBeQAnuduSvkM7i', 'user', '2025-07-22 01:45:23', NULL, '097656787654', NULL, 1, 0, NULL, '2025-07-22 01:48:14', 'Alen Prastya', 'Jakarta', '2025-05-07', 'L', 'Islam', 'Indonesia', '3231346126391273', 'JL Bentengan No. 19B', 'Dev'),
(8, 'hanas', 'hanas@gmail.com', '$2b$10$XKeimuc1ksOGJlaaxsGuEexxddtOdp4aqYDTiCrQAt9Jv0b.jBrZy', 'user', '2025-07-24 00:42:25', NULL, '08765678', NULL, 1, 0, NULL, '2025-07-24 01:19:41', 'Hanas Setiawan', 'Jakarta', '2025-07-03', 'L', 'Islam', 'Indonesia', '3231346126391273', 'JL Bentengan No. 19B', 'asdqs'),
(9, 'arya', 'arya@gmail.com', '$2b$10$oVYWUyEBaZYlqe85vAYHJujH2hIagKYbNSgG7jdqwAafWAzmrYh4K', 'user', '2025-08-12 22:32:28', NULL, NULL, NULL, 1, 0, NULL, '2025-08-12 22:43:59', 'Arya Kamandanu', NULL, NULL, NULL, NULL, 'Indonesia', NULL, NULL, 'Bertani');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_documents_with_details`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_documents_with_details` (
`id` int(11)
,`user_id` int(11)
,`username` varchar(255)
,`email` varchar(255)
,`id_pengajuan` int(11)
,`nama_pengajuan` varchar(100)
,`file_name` varchar(255)
,`file_path` varchar(255)
,`file_size` int(11)
,`mime_type` varchar(100)
,`original_name` varchar(255)
,`document_type` varchar(100)
,`status` enum('pending','approved','rejected')
,`admin_notes` text
,`is_complete` tinyint(1)
,`uploaded_at` timestamp
,`updated_at` timestamp
,`status_text` varchar(9)
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_pengajuan_stats`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_pengajuan_stats` (
`id_pengajuan` int(11)
,`nama_pengajuan` varchar(100)
,`status` enum('active','inactive')
,`total_documents` bigint(21)
,`total_users` bigint(21)
,`approved_documents` decimal(22,0)
,`pending_documents` decimal(22,0)
,`rejected_documents` decimal(22,0)
,`total_surat_generated` bigint(21)
);

-- --------------------------------------------------------

--
-- Struktur untuk view `v_documents_with_details`
--
DROP TABLE IF EXISTS `v_documents_with_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_documents_with_details`  AS SELECT `d`.`id` AS `id`, `d`.`user_id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `d`.`id_pengajuan` AS `id_pengajuan`, `tp`.`nama_pengajuan` AS `nama_pengajuan`, `d`.`file_name` AS `file_name`, `d`.`file_path` AS `file_path`, `d`.`file_size` AS `file_size`, `d`.`mime_type` AS `mime_type`, `d`.`original_name` AS `original_name`, `d`.`document_type` AS `document_type`, `d`.`status` AS `status`, `d`.`admin_notes` AS `admin_notes`, `d`.`is_complete` AS `is_complete`, `d`.`uploaded_at` AS `uploaded_at`, `d`.`updated_at` AS `updated_at`, CASE WHEN `d`.`status` = 'approved' THEN 'Disetujui' WHEN `d`.`status` = 'rejected' THEN 'Ditolak' ELSE 'Menunggu' END AS `status_text` FROM ((`documents` `d` join `users` `u` on(`d`.`user_id` = `u`.`id`)) left join `tabel_pengajuan` `tp` on(`d`.`id_pengajuan` = `tp`.`id_pengajuan`)) ;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_pengajuan_stats`
--
DROP TABLE IF EXISTS `v_pengajuan_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_pengajuan_stats`  AS SELECT `tp`.`id_pengajuan` AS `id_pengajuan`, `tp`.`nama_pengajuan` AS `nama_pengajuan`, `tp`.`status` AS `status`, count(`d`.`id`) AS `total_documents`, count(distinct `d`.`user_id`) AS `total_users`, sum(case when `d`.`status` = 'approved' then 1 else 0 end) AS `approved_documents`, sum(case when `d`.`status` = 'pending' then 1 else 0 end) AS `pending_documents`, sum(case when `d`.`status` = 'rejected' then 1 else 0 end) AS `rejected_documents`, count(`sp`.`id`) AS `total_surat_generated` FROM ((`tabel_pengajuan` `tp` left join `documents` `d` on(`tp`.`id_pengajuan` = `d`.`id_pengajuan`)) left join `surat_pengantar` `sp` on(`tp`.`id_pengajuan` = `sp`.`id_pengajuan`)) GROUP BY `tp`.`id_pengajuan`, `tp`.`nama_pengajuan`, `tp`.`status` ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_table_record` (`table_name`,`record_id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_action` (`action`),
  ADD KEY `idx_audit_created_at` (`created_at`);

--
-- Indeks untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_documents_user_id` (`user_id`),
  ADD KEY `idx_documents_pengajuan_id` (`id_pengajuan`),
  ADD KEY `idx_documents_status` (`status`),
  ADD KEY `idx_documents_user_pengajuan` (`user_id`,`id_pengajuan`),
  ADD KEY `idx_kelengkapan_data_id` (`kelengkapan_data_id`);

--
-- Indeks untuk tabel `document_checklist_items`
--
ALTER TABLE `document_checklist_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_checklist_document` (`document_id`);

--
-- Indeks untuk tabel `kelengkapan_data`
--
ALTER TABLE `kelengkapan_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kelengkapan_data_user_id` (`user_id`);

--
-- Indeks untuk tabel `surat_pengantar`
--
ALTER TABLE `surat_pengantar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_surat_document` (`document_id`),
  ADD KEY `fk_surat_approved_by` (`approved_by`),
  ADD KEY `idx_surat_user_id` (`user_id`),
  ADD KEY `idx_surat_pengajuan_id` (`id_pengajuan`),
  ADD KEY `idx_surat_status` (`status`),
  ADD KEY `idx_surat_kelengkapan_data_id` (`kelengkapan_data_id`);

--
-- Indeks untuk tabel `tabel_pengajuan`
--
ALTER TABLE `tabel_pengajuan`
  ADD PRIMARY KEY (`id_pengajuan`),
  ADD UNIQUE KEY `nama_pengajuan` (`nama_pengajuan`),
  ADD KEY `idx_pengajuan_status` (`status`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_active` (`is_active`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `document_checklist_items`
--
ALTER TABLE `document_checklist_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kelengkapan_data`
--
ALTER TABLE `kelengkapan_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `surat_pengantar`
--
ALTER TABLE `surat_pengantar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tabel_pengajuan`
--
ALTER TABLE `tabel_pengajuan`
  MODIFY `id_pengajuan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_kelengkapan_data` FOREIGN KEY (`kelengkapan_data_id`) REFERENCES `kelengkapan_data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documents_pengajuan` FOREIGN KEY (`id_pengajuan`) REFERENCES `tabel_pengajuan` (`id_pengajuan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documents_pengajuan_id` FOREIGN KEY (`id_pengajuan`) REFERENCES `tabel_pengajuan` (`id_pengajuan`),
  ADD CONSTRAINT `fk_documents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documents_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `document_checklist_items`
--
ALTER TABLE `document_checklist_items`
  ADD CONSTRAINT `fk_checklist_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kelengkapan_data`
--
ALTER TABLE `kelengkapan_data`
  ADD CONSTRAINT `fk_kelengkapan_data_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kelengkapan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `surat_pengantar`
--
ALTER TABLE `surat_pengantar`
  ADD CONSTRAINT `fk_surat_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_surat_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_surat_pengajuan` FOREIGN KEY (`id_pengajuan`) REFERENCES `tabel_pengajuan` (`id_pengajuan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_surat_pengantar_kelengkapan_data` FOREIGN KEY (`kelengkapan_data_id`) REFERENCES `kelengkapan_data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_surat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
