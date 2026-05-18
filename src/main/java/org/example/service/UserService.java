package org.example.service;

import org.example.DTO.UsuarioResponseDTO;
import org.example.models.User;
import org.example.repository.UsersRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UsersRepository usersRepository;
    public UserService (UsersRepository usersRepository){
        this.usersRepository = usersRepository;
    }

    public UsuarioResponseDTO criarUsuario(UsuarioResponseDTO dto){
        User user = new User();
        user.setNome(dto.getNome());
        user.setCodigo(dto.getCodigo());
        user.setSalarioMensal(dto.getSalarioMensal());
        user.setCriadoEm(dto.getCriadoEm());
        User salvarUsuario =  usersRepository.save(user);
        return toUsuarioResponseDTO(salvarUsuario);

    }

    private UsuarioResponseDTO toUsuarioResponseDTO(User user){
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(user.getId()); 
        dto.setNome(user.getNome());
        dto.setCodigo(user.getCodigo());
        dto.setSalarioMensal(user.getSalarioMensal());
        dto.setCriadoEm(user.getCriadoEm());
        return dto;
    }
    
}
