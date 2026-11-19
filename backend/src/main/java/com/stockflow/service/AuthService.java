package com.stockflow.service;

import com.stockflow.dto.AuthResponse;
import com.stockflow.dto.LoginRequest;
import com.stockflow.dto.SignupRequest;
import com.stockflow.entity.Organization;
import com.stockflow.entity.User;
import com.stockflow.exception.BadRequestException;
import com.stockflow.exception.DuplicateResourceException;
import com.stockflow.repository.OrganizationRepository;
import com.stockflow.repository.UserRepository;
import com.stockflow.security.JwtService;
import com.stockflow.security.UserPrincipal;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        // Validate unique email
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email " + normalizedEmail + " already exists");
        }

        // Create organization
        Organization organization = new Organization(request.getOrganizationName().trim(), 5);
        organization = organizationRepository.save(organization);

        // Derive full name if not provided
        String fullName = StringUtils.hasText(request.getFullName())
                ? request.getFullName().trim()
                : normalizedEmail.split("@")[0];

        // Create user
        User user = new User(
                fullName,
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                organization
        );
        user = userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                organization.getId(),
                organization.getName(),
                organization.getDefaultLowStockThreshold()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        Organization org = user.getOrganization();

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                org.getId(),
                org.getName(),
                org.getDefaultLowStockThreshold()
        );
    }

    public UserPrincipal getAuthenticatedPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new BadCredentialsException("User is not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }
}
