package com.nomeacao.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Boolean ativo = false;

    @Column(name = "codigo_verificacao")
    private String codigoVerificacao;

    @Column(name = "validade_codigo")
    private LocalDateTime validadeCodigo;

    @Column(name = "tutorial_concluido", nullable = false)
    private Boolean tutorialConcluido = false;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<Materia> materias;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<Concurso> concursos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<RegistroEstudo> registros;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<TipoEstudo> tiposEstudo;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<RefreshToken> refreshTokens;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.REMOVE)
    @ToString.Exclude
    private List<Feedback> feedbacks;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}