package org.example.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import org.example.DTO.CategoriaResponseDTO;
import org.example.exceptions.DuplicateResourceException;
import org.example.exceptions.ResourceNotFoundException;
import org.example.models.Categoria;
import org.example.models.User;
import org.example.repository.CategoriaRepository;
import org.example.repository.UsersRepository;

import jakarta.transaction.Transactional;

@Service
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final UsersRepository usersRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, UsersRepository usersRepository) {
        this.categoriaRepository = categoriaRepository;
        this.usersRepository = usersRepository;
    }

    @Transactional
    public CategoriaResponseDTO criarCategoria(CategoriaResponseDTO dto, Long usuarioId) {
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        // FIX: duplicidade escopada por usuário
        if (categoriaRepository.findByNomeAndUsuarioCategoriaId(dto.getNome(), usuarioId).isPresent()) {
            throw new DuplicateResourceException("Você já possui uma categoria com esse nome: " + dto.getNome());
        }

        Categoria novaCategoria = new Categoria();
        novaCategoria.setNome(dto.getNome());
        novaCategoria.setUsuarioCategoria(usuario);
        Categoria salvarCategoria = categoriaRepository.save(novaCategoria);

        return toResponseDTO(salvarCategoria);
    }

    public CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        CategoriaResponseDTO novo = new CategoriaResponseDTO();
        novo.setIdCategoria(categoria.getId());
        novo.setNome(categoria.getNome());
        novo.setUsuarioId(categoria.getUsuarioCategoria().getId());
        return novo;
    }

    @Transactional
    public CategoriaResponseDTO buscarId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma categoria com esse ID: " + id));
        return toResponseDTO(categoria);
    }

    @Transactional
    public void deletarCategoriaPorId(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Não existe nenhuma categoria com esse ID: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    @Transactional
    public List<CategoriaResponseDTO> listarTodas() {
        List<Categoria> categorias = categoriaRepository.findAll();
        List<CategoriaResponseDTO> resultado = new ArrayList<>();
        for (Categoria categoria : categorias) {
            resultado.add(toResponseDTO(categoria));
        }
        return resultado;
    }

    @Transactional
    public CategoriaResponseDTO alterarCategoria(CategoriaResponseDTO dto, Long id) {
        // FIX: era .get() antes de isPresent()
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma categoria com esse ID: " + id));

        categoria.setNome(dto.getNome());
        categoriaRepository.save(categoria);
        return toResponseDTO(categoria);
    }
}