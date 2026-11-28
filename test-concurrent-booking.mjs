/**
 * Script test Race Condition: 2 người cùng bấm đặt 1 ca đá (pitchSlotId) tại cùng 1 thời điểm.
 * Cách chạy: node test-concurrent-booking.mjs
 */

// ============================================================
// CẤU HÌNH: Thay PITCH_SLOT_ID bằng ID ca đá đang ở trạng thái AVAILABLE
// ============================================================
const PITCH_SLOT_ID = 86; // <-- THAY ID CA ĐÁ VÀO ĐÂY
const BASE_URL = 'http://localhost:8080/api';

async function createBooking(userLabel, guestName, guestPhone) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pitchSlotId: PITCH_SLOT_ID,
        guestName,
        guestPhone,
        bookingType: 'ONLINE',
        customerNote: `Test concurrent booking - ${userLabel}`,
        services: [],
      }),
    });

    const data = await response.json();
    const durationMs = Date.now() - startTime;

    return {
      userLabel,
      httpStatus: response.status,
      ok: response.ok,
      durationMs,
      data,
    };
  } catch (err) {
    return {
      userLabel,
      httpStatus: 0,
      ok: false,
      durationMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

async function run() {
  console.log(`\n🚀 Bắt đầu bắn 2 request ĐỒNG THỜI đặt pitchSlotId = ${PITCH_SLOT_ID}...\n`);

  const results = await Promise.all([
    createBooking('Người A', 'Nguyen Van A', '0911111111'),
    createBooking('Người B', 'Tran Van B', '0922222222'),
  ]);

  for (const res of results) {
    console.log(`--- [${res.userLabel}] (${res.durationMs}ms) ---`);
    console.log(`HTTP Status : ${res.httpStatus}`);
    if (res.error) {
      console.log(`Lỗi kết nối : ${res.error}`);
    } else {
      console.log(`Success     : ${res.data?.success}`);
      console.log(`Message     : ${res.data?.message}`);
      if (res.data?.data?.bookingCode) {
        console.log(`Booking Code: ${res.data.data.bookingCode}`);
      }
    }
    console.log('');
  }

  const successCount = results.filter((r) => r.ok).length;
  console.log('====================================');
  if (successCount === 1) {
    console.log('✅ KẾT QUẢ CHUẨN: Chỉ có đúng 1 người đặt thành công, người còn lại bị chặn!');
  } else if (successCount === 0) {
    console.log('⚠️ Cả 2 đều thất bại (kiểm tra lại backend đang chạy chưa hoặc pitchSlotId đã bị đặt từ trước).');
  } else {
    console.log('❌ CẢNH BÁO: Cả 2 đều đặt thành công (bị trùng đơn)!');
  }
}

run();
