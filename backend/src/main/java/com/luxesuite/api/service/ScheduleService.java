package com.luxesuite.api.service;

import com.luxesuite.api.dto.ShiftDto;
import com.luxesuite.api.dto.ShiftRequest;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.Shift;
import com.luxesuite.api.model.ShiftStatus;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.repository.ShiftRepository;
import com.luxesuite.api.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ShiftRepository shiftRepository;
    private final StaffRepository staffRepository;
    private final BranchRepository branchRepository;
    private final NotificationService notificationService;

    @Transactional
    public ShiftDto createShift(ShiftRequest request) {
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new IllegalArgumentException("Branch not found"));

        // Basic conflict check
        List<Shift> overlapping = shiftRepository.findByStaffIdAndStartTimeBetween(
                staff.getId(), request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Shift overlaps with existing shift for staff");
        }

        Shift shift = Shift.builder()
                .staff(staff)
                .branch(branch)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(request.getType())
                .status(ShiftStatus.DRAFT)
                .build();

        shiftRepository.save(shift);
        return mapToDto(shift);
    }

    @Transactional
    public void publishShifts(List<Long> shiftIds) {
        List<Shift> shifts = shiftRepository.findAllById(shiftIds);
        shifts.forEach(shift -> {
            shift.setStatus(ShiftStatus.PUBLISHED);
            // Notify staff
            notificationService.sendAppNotification(
                    shift.getStaff().getUser(),
                    "New Shift Published",
                    "You have a new shift scheduled on " + shift.getStartTime().toLocalDate(),
                    com.luxesuite.api.model.NotificationType.GENERAL
            );
        });
        shiftRepository.saveAll(shifts);
    }

    public List<ShiftDto> getShiftsForStaff(Long staffId) {
        return shiftRepository.findByStaffId(staffId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ShiftDto> getShiftsForBranch(Long branchId) {
        return shiftRepository.findByBranchId(branchId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ShiftDto mapToDto(Shift shift) {
        ShiftDto dto = new ShiftDto();
        dto.setId(shift.getId());
        dto.setStaffId(shift.getStaff().getId());
        dto.setStaffName(shift.getStaff().getUser().getFirstName() + " " + shift.getStaff().getUser().getLastName());
        dto.setBranchId(shift.getBranch().getId());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setType(shift.getType());
        dto.setStatus(shift.getStatus());
        return dto;
    }
}
