/**
 * Hàm tiện ích dùng chung xử lý định dạng ngày tháng (FPMS Date Utilities)
 */

/**
 * Chuyển đổi chuỗi ngày tháng hoặc đối tượng Date thành định dạng dd/mm/yyyy.
 * Xử lý an toàn các định dạng:
 * - "YYYY-MM-DD" (vd: "2026-11-25" -> "25/11/2026")
 * - ISO string "YYYY-MM-DDTHH:mm:ss" (vd: "2026-11-25T14:30:00" -> "25/11/2026")
 * - "YYYY-MM-DD HH:mm:ss"
 * - Đối tượng Date hoặc Timestamp
 *
 * @param dateInput Chuỗi ngày tháng, đối tượng Date hoặc null/undefined
 * @param fallback Giá trị trả về nếu dateInput không hợp lệ (mặc định '')
 * @returns Chuỗi định dạng dd/mm/yyyy (vd: "25/11/2026")
 */
export const formatDate = (
  dateInput?: string | Date | number | null,
  fallback = ''
): string => {
  if (!dateInput) return fallback;

  // Nếu là chuỗi, kiểm tra định dạng bắt đầu bằng YYYY-MM-DD
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Bắt chuỗi dạng YYYY-MM-DD hoặc YYYY/MM/DD
    const match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }

    // Nếu đã là định dạng dd/mm/yyyy
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(trimmed)) {
      const parts = trimmed.split(/[-/]/);
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
    }
  }

  // Parse Date object
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return fallback;
  }
};

/**
 * Chuyển đổi chuỗi ngày tháng sang dạng "dd/mm/yyyy HH:mm" (hoặc kèm giờ phút)
 */
export const formatDateTime = (
  dateInput?: string | Date | number | null,
  fallback = ''
): string => {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return formatDate(dateInput, fallback);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return fallback;
  }
};

/**
 * Lấy thứ trong tuần kết hợp ngày tháng: "Thứ Hai, 25/11/2026"
 */
export const formatDateWithDayOfWeek = (
  dateInput?: string | Date | number | null,
  fallback = ''
): string => {
  if (!dateInput) return fallback;
  try {
    const d = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T00:00:00`)
      : new Date(dateInput);

    if (isNaN(d.getTime())) return fallback;

    const dayNames = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    const dayOfWeek = dayNames[d.getDay()];
    return `${dayOfWeek}, ${formatDate(d)}`;
  } catch {
    return fallback;
  }
};

export default formatDate;
