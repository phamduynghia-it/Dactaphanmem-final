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

    private final PitchTypeRepository pitchTypeRepository;
    private final PitchRepository pitchRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PitchSlotRepository pitchSlotRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final PriceMatrixRepository priceMatrixRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Kiểm tra và thêm dữ liệu dịch vụ mẫu nếu chưa có
        if (serviceItemRepository.count() == 0) {
            serviceItemRepository.saveAll(List.of(
                ServiceItem.builder().name("Nước khoáng Aquafina 500ml").unit("Chai").price(new BigDecimal("10000")).category("DRINK").isActive(true).description("Nước khoáng tinh khiết đóng chai 500ml").build(),
                ServiceItem.builder().name("Nước tăng lực Revive bù khoáng").unit("Chai").price(new BigDecimal("15000")).category("DRINK").isActive(true).description("Nước giải khát bổ sung điện giải thể thao").build(),
                ServiceItem.builder().name("Bộ áo bib thi đấu (10 áo)").unit("Bộ").price(new BigDecimal("30000")).category("EQUIPMENT").isActive(true).description("Bộ áo lưới phân đội màu cam hoặc xanh").build(),
                ServiceItem.builder().name("Thuê bóng thi đấu số 4").unit("Quả").price(new BigDecimal("20000")).category("EQUIPMENT").isActive(true).description("Bóng đúc tiêu chuẩn FIFA cho sân mini").build(),
                ServiceItem.builder().name("Dịch vụ Trọng tài điều khiển").unit("Trận").price(new BigDecimal("200000")).category("REFEREE").isActive(true).description("Trọng tài có bằng cấp điều khiển trận đấu").build()
            ));
        }

        // 2. Kiểm tra và thêm loại sân & sân bóng mẫu nếu chưa có
        PitchType type5 = pitchTypeRepository.findByName("Sân 5 người")
                .orElseGet(() -> pitchTypeRepository.save(
                        PitchType.builder().name("Sân 5 người").playerCapacity(10).description("Sân cỏ nhân tạo 5 người tiêu chuẩn mini").build()
                ));
        PitchType type7 = pitchTypeRepository.findByName("Sân 7 người")
                .orElseGet(() -> pitchTypeRepository.save(
                        PitchType.builder().name("Sân 7 người").playerCapacity(14).description("Sân cỏ nhân tạo 7 người bán chuyên nghiệp").build()
                ));

        if (pitchRepository.count() == 0) {
            pitchRepository.saveAll(List.of(
                Pitch.builder().name("Sân 5A").pitchType(type5).status("ACTIVE").description("Sân 5 thảm cỏ nhân tạo mới thay năm 2026").build(),
                Pitch.builder().name("Sân 5B").pitchType(type5).status("ACTIVE").description("Sân 5 khu vực khán đài A").build(),
                Pitch.builder().name("Sân 7A").pitchType(type7).status("ACTIVE").description("Sân 7 tiêu chuẩn có hệ thống đèn LED cao cấp").build()
            ));
        }

        // 3. Khởi tạo Bảng giá sân mẫu theo đúng thiết kế (Sân 5 người)
        if (priceMatrixRepository.count() == 0) {
            priceMatrixRepository.saveAll(List.of(
                PriceMatrix.builder().pitchType(type5).dayType("WEEKDAY").isPeakHour(false).price(new BigDecimal("550000")).build(),
                PriceMatrix.builder().pitchType(type5).dayType("WEEKDAY").isPeakHour(true).price(new BigDecimal("600000")).build(),
                PriceMatrix.builder().pitchType(type5).dayType("WEEKEND").isPeakHour(false).price(new BigDecimal("200000")).build(),
                PriceMatrix.builder().pitchType(type5).dayType("WEEKEND").isPeakHour(true).price(new BigDecimal("400000")).build(),
                PriceMatrix.builder().pitchType(type5).dayType("HOLIDAY").isPeakHour(false).price(new BigDecimal("500000")).build(),
                PriceMatrix.builder().pitchType(type5).dayType("HOLIDAY").isPeakHour(true).price(new BigDecimal("700000")).build(),

                PriceMatrix.builder().pitchType(type7).dayType("WEEKDAY").isPeakHour(false).price(new BigDecimal("700000")).build(),
                PriceMatrix.builder().pitchType(type7).dayType("WEEKDAY").isPeakHour(true).price(new BigDecimal("850000")).build(),
                PriceMatrix.builder().pitchType(type7).dayType("WEEKEND").isPeakHour(false).price(new BigDecimal("350000")).build(),
                PriceMatrix.builder().pitchType(type7).dayType("WEEKEND").isPeakHour(true).price(new BigDecimal("600000")).build(),
                PriceMatrix.builder().pitchType(type7).dayType("HOLIDAY").isPeakHour(false).price(new BigDecimal("750000")).build(),
                PriceMatrix.builder().pitchType(type7).dayType("HOLIDAY").isPeakHour(true).price(new BigDecimal("950000")).build()
            ));
        }

        // 4. Khởi tạo danh mục Ngày lễ mẫu
        if (holidayRepository.count() == 0) {
            holidayRepository.saveAll(List.of(
                Holiday.builder().holidayDate(LocalDate.of(2026, 9, 2)).holidayName("Lễ Quốc Khánh").description("Kỷ niệm ngày Quốc Khánh 2/9").build(),
                Holiday.builder().holidayDate(LocalDate.of(2026, 4, 30)).holidayName("Ngày Giải Phóng Miền Nam").description("Kỷ niệm 30/4").build(),
                Holiday.builder().holidayDate(LocalDate.of(2026, 5, 1)).holidayName("Ngày Quốc Tế Lao Động").description("Kỷ niệm 1/5").build(),
                Holiday.builder().holidayDate(LocalDate.of(2026, 1, 1)).holidayName("Tết Dương Lịch").description("Nghỉ Tết Dương Lịch").build()
            ));
        }

        // 5. Kiểm tra và thêm khung giờ mẫu nếu chưa có
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
        if (pitchSlotRepository.findByDateslot(today).isEmpty()) {
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
                            .dateslot(today)
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
