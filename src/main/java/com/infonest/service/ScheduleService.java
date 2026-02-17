package com.infonest.service;

import com.infonest.model.Schedules;
import com.infonest.repository.ScheduleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository repository;

    public void importExcel(MultipartFile file) throws Exception {
        // We use a try-with-resources to ensure the workbook is closed even if an error occurs
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Schedules> list = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header row

                try {
                    // Check if the row is actually empty to prevent NullPointerExceptions
                    if (row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) continue;

                    Schedules s = new Schedules();
                    s.setTeacherName(row.getCell(0).getStringCellValue().trim());
                    s.setSubject(row.getCell(1).getStringCellValue().trim());
                    s.setRoomNo(row.getCell(2).getStringCellValue().trim());
                    s.setDayOfWeek(row.getCell(3).getStringCellValue().trim().toUpperCase());
                    
                    // Professional parsing: handle potential spaces in time strings
                    String start = row.getCell(4).getStringCellValue().trim();
                    String end = row.getCell(5).getStringCellValue().trim();
                    
                    s.setStartTime(LocalTime.parse(start));
                    s.setEndTime(LocalTime.parse(end));

                    list.add(s);
                } catch (Exception e) {
                    // Throwing a detailed error helps the Office User fix the specific row in Excel
                    throw new Exception("Error in row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }
            
            if (list.isEmpty()) {
                throw new Exception("The Excel file appeared to be empty or had no valid data rows.");
            }

            repository.saveAll(list);
        }
    }
}