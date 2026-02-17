package com.infonest.service; // Resolves: declared package "" does not match
import com.infonest.model.Schedules;
import com.infonest.repository.ScheduleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository repository;

    public void importExcel(MultipartFile file) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Schedules> list = new ArrayList<>();
            
            // This tool prevents the "NUMERIC cell" error by converting everything to String
            DataFormatter formatter = new DataFormatter(); 

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; 

                try {
                    if (row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) continue;

                    Schedules s = new Schedules();
                    
                    // Use formatter.formatCellValue() instead of getStringCellValue()
                    s.setTeacherName(formatter.formatCellValue(row.getCell(0)).trim());
                    s.setSubject(formatter.formatCellValue(row.getCell(1)).trim());
                    s.setRoomNo(formatter.formatCellValue(row.getCell(2)).trim());
                    s.setDayOfWeek(formatter.formatCellValue(row.getCell(3)).trim().toUpperCase());
                    // captures the 7th column (Index 6) from your Excel
                    s.setSittingCabin(formatter.formatCellValue(row.getCell(6)).trim());
                    java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("H:mm[:ss]");
                    String start = formatter.formatCellValue(row.getCell(4)).trim();
                    String end = formatter.formatCellValue(row.getCell(5)).trim();
                    
                    // Clean up time strings (e.g., if Excel adds extra spaces)
                    s.setStartTime(LocalTime.parse(start, timeFormatter));
                    s.setEndTime(LocalTime.parse(end, timeFormatter));

                    list.add(s);
                } catch (Exception e) {
                    throw new Exception("Error in row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }
            
            if (list.isEmpty()) {
                throw new Exception("The Excel file appeared to be empty or had no valid data rows.");
            }

            repository.saveAll(list);
        }
    }

    public String getRealTimeStatus(String name) {
    LocalTime now = LocalTime.now();
    DayOfWeek day = LocalDate.now().getDayOfWeek();

    // Fix: Your college is off on Tuesdays
    if (day == DayOfWeek.TUESDAY) {
        return "Tuesdays are off! Enjoy your holiday.";
    }

    // Working Hours Check (9-5)
    if (now.isBefore(LocalTime.of(9, 0)) || now.isAfter(LocalTime.of(17, 0))) {
        return "College is closed. Staff available 9 AM - 5 PM.";
    }

    return repository.findCurrentLocation(name, day.toString().toUpperCase(), now)
            .map(s -> "📍 " + s.getTeacherName() + " is in " + s.getRoomNo() + " for " + s.getSubject())
            .orElseGet(() -> repository.findSittingCabin(name)
                    .map(c -> "No active class. Teacher is in Sitting Cabin: " + c)
                    .orElse("No information found for this teacher."));
}

            public String getTeacherCabin(String name) {
                // DISTICT prevents the 500 error if a teacher has multiple entries
                return repository.findSittingCabin(name)
                        .map(cabin -> "Staff Cabin: " + cabin)
                        .orElse("Cabin information not found for " + name);
            }
}