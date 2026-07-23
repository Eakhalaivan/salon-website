package com.luxesuite.api.controller;

import com.luxesuite.api.model.Branch;
import com.luxesuite.api.model.LeaveRequest;
import com.luxesuite.api.model.Role;
import com.luxesuite.api.model.Staff;
import com.luxesuite.api.model.User;
import com.luxesuite.api.repository.LeaveRequestRepository;
import com.luxesuite.api.repository.StaffRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class LeaveRequestControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LeaveRequestRepository leaveRequestRepository;

    @MockitoBean
    private StaffRepository staffRepository;

    @Test
    @WithMockUser(username = "stylist@luxesuite.com", roles = "STYLIST")
    public void givenStaffRole_whenUpdateLeaveRequest_thenForbidden() throws Exception {
        String payload = """
                {
                    "status": "APPROVED"
                }
                """;

        mockMvc.perform(put("/api/v1/leave-requests/1/status")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager_branch1@luxesuite.com", roles = "MANAGER")
    public void givenManagerRole_whenUpdateLeaveRequestDifferentBranch_thenForbidden() throws Exception {
        Branch branch1 = new Branch();
        branch1.setId(1L);

        Branch branch2 = new Branch();
        branch2.setId(2L);

        Role managerRole = new Role(2L, "MANAGER");
        User managerUser = User.builder().email("manager_branch1@luxesuite.com").role(managerRole).build();
        Staff managerStaff = Staff.builder().user(managerUser).branch(branch1).build();

        Staff targetStaff = Staff.builder().branch(branch2).build();
        LeaveRequest targetRequest = new LeaveRequest();
        targetRequest.setId(1L);
        targetRequest.setStaff(targetStaff);

        when(leaveRequestRepository.findById(anyLong())).thenReturn(Optional.of(targetRequest));
        when(staffRepository.findByUserEmail(anyString())).thenReturn(Optional.of(managerStaff));

        String payload = """
                {
                    "status": "APPROVED"
                }
                """;

        mockMvc.perform(put("/api/v1/leave-requests/1/status")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager_branch1@luxesuite.com", roles = "MANAGER")
    public void givenManagerRole_whenUpdateLeaveRequestSameBranch_thenOk() throws Exception {
        Branch branch1 = new Branch();
        branch1.setId(1L);

        Role managerRole = new Role(2L, "MANAGER");
        User managerUser = User.builder().email("manager_branch1@luxesuite.com").role(managerRole).build();
        Staff managerStaff = Staff.builder().user(managerUser).branch(branch1).build();

        Staff targetStaff = Staff.builder().branch(branch1).build();
        LeaveRequest targetRequest = new LeaveRequest();
        targetRequest.setId(1L);
        targetRequest.setStaff(targetStaff);

        when(leaveRequestRepository.findById(anyLong())).thenReturn(Optional.of(targetRequest));
        when(staffRepository.findByUserEmail(anyString())).thenReturn(Optional.of(managerStaff));
        when(leaveRequestRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(i -> i.getArguments()[0]);

        String payload = """
                {
                    "status": "APPROVED"
                }
                """;

        mockMvc.perform(put("/api/v1/leave-requests/1/status")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }
}
