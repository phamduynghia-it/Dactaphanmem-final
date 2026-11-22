package com.fpms.config;

import com.fpms.entity.*;
import com.fpms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PitchRepository pitchRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PitchSlotRepository pitchSlotRepository;
    private final ServiceItemRepository serviceItemRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Kiểm tra và thêm dữ liệu dịch vụ mẫu nếu chưa có
        if (serviceItemRepository.count() == 0) {
            serviceItemRepository.saveAll(List.of(
                ServiceItem.builder().name("Nước khoáng Aquafina").unit("Chai").price(new BigDecimal("10000")).category("DRINK").isActive(true).description("Chai 500ml").build(),
                ServiceItem.builder().name("Nước tăng lực Revive").unit("Chai").price(new BigDecimal("15000")).category("DRINK").isActive(true).description("Bù khoáng").build(),
                ServiceItem.builder().name("Bộ áo bib thi đấu (10 áo)").unit("Bộ").price(new BigDecimal("30000")).category("EQUIPMENT").isActive(true).description("Màu cam/xanh").build(),
                ServiceItem.builder().name("Thuê bóng thi đấu số 4").unit("Quả").price(new BigDecimal("20000")).category("EQUIPMENT").isActive(true).description("Bóng đúc FIFA").build(),
                ServiceItem.builder().name("Dịch vụ Trọng tài điều khiển").unit("Trận").price(new BigDecimal("200000")).category("REFEREE").isActive(true).description("Trọng tài chuyên nghiệp").build()
            ));
        }

        // 2. Kiểm tra và thêm sân mẫu nếu chưa có
        if (pitchRepository.count() == 0) {
            pitchRepository.saveAll(List.of(
                Pitch.builder().name("Sân 5A").status("ACTIVE").description("Sân cỏ nhân tạo 5 người").build(),
                Pitch.builder().name("Sân 5B").status("ACTIVE").description("Sân cỏ nhân tạo 5 người").build(),
                Pitch.builder().name("Sân 7A").status("ACTIVE").description("Sân cỏ nhân tạo 7 người tiêu chuẩn").build()
            ));
        }

        // 3. Kiểm tra và thêm khung giờ mẫu nếu chưa có
        if (timeSlotRepository.count() == 0) {
            timeSlotRepository.saveAll(List.of(
                TimeSlot.builder().startTime(LocalTime.of(6, 0)).endTime(LocalTime.of(7, 30)).isPeakHour(false).isActive(true).build(),
                TimeSlot.builder().startTime(LocalTime.of(16, 0)).endTime(LocalTime.of(17, 30)).isPeakHour(false).isActive(true).build(),
                TimeSlot.builder().startTime(LocalTime.of(17, 30)).endTime(LocalTime.of(19, 0)).isPeakHour(true).isActive(true).build(),
                TimeSlot.builder().startTime(LocalTime.of(19, 0)).endTime(LocalTime.of(20, 30)).isPeakHour(true).isActive(true).build(),
                TimeSlot.builder().startTime(LocalTime.of(20, 30)).endTime(LocalTime.of(22, 0)).isPeakHour(false).isActive(true).build()
            ));
        }

        // 4. Tự động sinh lịch ca đá (PitchSlot) cho hôm nay nếu chưa có
        LocalDate today = LocalDate.now();
        if (pitchSlotRepository.findBySlotDate(today).isEmpty()) {
            List<Pitch> pitches = pitchRepository.findAll();
            List<TimeSlot> slots = timeSlotRepository.findAll();

            for (Pitch p : pitches) {
                for (TimeSlot t : slots) {
                    BigDecimal price = t.isPeakHour() ? new BigDecimal("350000") : new BigDecimal("250000");
                    if (p.getName().contains("7")) {
                        price = price.add(new BigDecimal("150000")); // Sân 7 đắt hơn sân 5
                    }

                    PitchSlot ps = PitchSlot.builder()
                            .pitch(p)
                            .timeSlot(t)
                            .slotDate(today)
                            .price(price)
                            .status("AVAILABLE")
                            .build();

                    pitchSlotRepository.save(ps);
                }
            }
            System.out.println(">>> Đã tự động sinh toàn bộ ca đá (PitchSlot) cho ngày hôm nay: " + today);
        }
    }
}
