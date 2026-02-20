package com.infonest.service; // Resolves: declared package "" does not match
import com.infonest.model.Schedules;
import com.infonest.model.VenueBooking;
import com.infonest.repository.ScheduleRepository;
import com.infonest.repository.VenueBookingRepository;
import com.infonest.repository.UserRepository;
import com.infonest.model.User;
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

    @Autowired
    private VenueBookingRepository venueBookingRepository;

    @Autowired
    private UserRepository userRepository; // Role validation ke liye zaroori hai
    // added boolean isUpdate parameter
    public void importExcel(MultipartFile file, boolean isUpdate) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Schedules> list = new ArrayList<>();
            DataFormatter formatter = new DataFormatter(); 

            // 1. Pehle validate karein ki file empty toh nahi hai
            Row firstDataRow = sheet.getRow(1);
            if (firstDataRow == null || firstDataRow.getCell(0) == null) {
                throw new Exception("Excel file is empty or invalid!");
            }

            // 2. Pehli data row se teacher name nikal kar role check karein
            String teacherNameForValidation = formatter.formatCellValue(firstDataRow.getCell(0)).trim();
            
            // searchManageableTeachers ensure karega ki role STUDENT/OFFICE na ho
            List<com.infonest.model.User> validUsers = userRepository.searchManageableTeachers(teacherNameForValidation);
            if (validUsers.isEmpty()) {
                throw new Exception("Unauthorized: Teacher '" + teacherNameForValidation + "' not found or has invalid role.");
            }

            // 3. Agar 'Edit' flag (isUpdate) true hai, toh purana data delete karein
            if (isUpdate) { 
                repository.deleteByTeacherName(teacherNameForValidation); 
            }

            // 4. Loop start karein sirf data parsing ke liye
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Header skip karein

                try {
                    if (row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) continue;

                    Schedules s = new Schedules();
                    s.setTeacherName(formatter.formatCellValue(row.getCell(0)).trim());
                    s.setSubject(formatter.formatCellValue(row.getCell(1)).trim());
                    s.setRoomNo(formatter.formatCellValue(row.getCell(2)).trim());
                    s.setDayOfWeek(formatter.formatCellValue(row.getCell(3)).trim().toUpperCase());
                    s.setSittingCabin(formatter.formatCellValue(row.getCell(6)).trim()); // Index 6 is Column G

                    java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("H:mm[:ss]");
                    String start = formatter.formatCellValue(row.getCell(4)).trim();
                    String end = formatter.formatCellValue(row.getCell(5)).trim();
                    
                    s.setStartTime(LocalTime.parse(start, timeFormatter));
                    s.setEndTime(LocalTime.parse(end, timeFormatter));

                    list.add(s);
                } catch (Exception e) {
                    throw new Exception("Error in row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }
            
            if (list.isEmpty()) {
                throw new Exception("The Excel file had no valid data rows.");
            }

            repository.saveAll(list); // Naya schedule save karein
        }
    }

    public String getRealTimeStatus(String name) {
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();
        DayOfWeek day = today.getDayOfWeek();

        // PRIORITY 1: Check for active venue bookings (Override all time/day restrictions)
        List<VenueBooking> activeBookings = venueBookingRepository.findActiveBookingByTeacher(name, today, now);
        if (!activeBookings.isEmpty()) {
            VenueBooking booking = activeBookings.get(0); // Get the first active booking
            return "📍 " + name + " is in " + booking.getVenue().getName() + 
                   " (Booked: " + booking.getStartTime() + " - " + booking.getEndTime() + ")";
        }

        // PRIORITY 2: Check regular schedule (with time/day restrictions)
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