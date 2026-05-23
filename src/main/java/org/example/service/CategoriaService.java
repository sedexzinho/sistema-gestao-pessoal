package org.example.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    public CategoriaResponseDTO criarCategoriaDespesa(CategoriaResponseDTO dto, Long usuarioId) {
        return criarCategoria(dto, usuarioId, "DESPESA");
    }

    @Transactional
    public CategoriaResponseDTO criarCategoriaReceita(CategoriaResponseDTO dto, Long usuarioId) {
        return criarCategoria(dto, usuarioId, "RECEITA");
    }

    private CategoriaResponseDTO criarCategoria(CategoriaResponseDTO dto, Long usuarioId, String tipo) {
        User usuario = usersRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        if (categoriaRepository.findByNomeAndUsuarioCategoriaIdAndTipo(dto.getNome(), usuarioId, tipo).isPresent()) {
            throw new DuplicateResourceException("Você já possui uma categoria " + tipo + " com esse nome: " + dto.getNome());
        }

        Categoria novaCategoria = new Categoria();
        novaCategoria.setNome(dto.getNome());
        novaCategoria.setUsuarioCategoria(usuario);
        novaCategoria.setTipo(tipo);

        return toResponseDTO(categoriaRepository.save(novaCategoria));
    }

    // ✅ Lista apenas categorias do usuário autenticado
    @Transactional
    public List<CategoriaResponseDTO> listarPorUsuario(Long usuarioId) {
        List<Categoria> categorias = categoriaRepository.findByUsuarioCategoriaId(usuarioId);
        List<CategoriaResponseDTO> resultado = new ArrayList<>();
        for (Categoria categoria : categorias) {
            resultado.add(toResponseDTO(categoria));
        }
        return resultado;
    }

    // ✅ Valida ownership ao alterar
    @Transactional
    public CategoriaResponseDTO alterarCategoria(CategoriaResponseDTO dto, Long id, Long usuarioId) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma categoria com esse ID: " + id));

        if (!categoria.getUsuarioCategoria().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para alterar essa categoria.");
        }

        categoria.setNome(dto.getNome());
        return toResponseDTO(categoriaRepository.save(categoria));
    }

    // ✅ Valida ownership ao deletar
    @Transactional
    public void deletarCategoriaPorId(Long id, Long usuarioId) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não existe nenhuma categoria com esse ID: " + id));

        if (!categoria.getUsuarioCategoria().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem permissão para deletar essa categoria.");
        }

        categoriaRepository.deleteById(id);
    }

    public CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        CategoriaResponseDTO novo = new CategoriaResponseDTO();
        novo.setIdCategoria(categoria.getId());
        novo.setNome(categoria.getNome());
        novo.setUsuarioId(categoria.getUsuarioCategoria().getId());
        novo.setTipo(categoria.getTipo());
        return novo;
    }
}