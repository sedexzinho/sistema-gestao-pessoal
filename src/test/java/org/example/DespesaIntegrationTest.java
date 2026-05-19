package org.example;

import org.example.DTO.CategoriaResponseDTO;
import org.example.DTO.DespesaResponseDTO;
import org.example.DTO.UsuarioResponseDTO;
import org.example.exceptions.DuplicateResourceException;
import org.example.exceptions.ResourceNotFoundException;
import org.example.service.CategoriaService;
import org.example.service.DespesaService;
import org.example.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional // limpa o banco após cada teste
class DespesaIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private DespesaService despesaService;

    private Long usuarioId;
    private Long usuario2Id;

    @BeforeEach
    void setup() {
        // Cria dois usuários reais no banco antes de cada teste
        UsuarioResponseDTO user1 = new UsuarioResponseDTO();
        user1.setNome("Kawan");
        user1.setCodigo("USR001");
        user1.setSalarioMensal(new BigDecimal("5000.00"));
        usuarioId = userService.criarUsuario(user1).getId();

        UsuarioResponseDTO user2 = new UsuarioResponseDTO();
        user2.setNome("Maria");
        user2.setCodigo("USR002");
        user2.setSalarioMensal(new BigDecimal("4000.00"));
        usuario2Id = userService.criarUsuario(user2).getId();
    }

    // ✅ Testa: criar categoria e despesa no banco real
    @Test
    void deveCriarCategoriaeVincularDespesa() {
        CategoriaResponseDTO catDTO = new CategoriaResponseDTO();
        catDTO.setNome("Eletrônicos");

        CategoriaResponseDTO categoriaCriada = categoriaService.criarCategoria(catDTO, usuarioId);
        assertNotNull(categoriaCriada.getIdCategoria());
        assertEquals("Eletrônicos", categoriaCriada.getNome());
        assertEquals(usuarioId, categoriaCriada.getUsuarioId());

        DespesaResponseDTO despDTO = new DespesaResponseDTO();
        despDTO.setNome("Notebook");
        despDTO.setValor(new BigDecimal("3000.00"));
        despDTO.setNomeCategoria("Eletrônicos");
        despDTO.setIsParcelado(true);
        despDTO.setTotalParcelas(12);
        despDTO.setValorParcela(new BigDecimal("250.00"));
        despDTO.setDiaPagamento(10);

        DespesaResponseDTO despesaCriada = despesaService.criarDespesa(despDTO, usuarioId);

        assertNotNull(despesaCriada.getId());
        assertEquals("Notebook", despesaCriada.getNome());
        assertEquals("PARCELADO", despesaCriada.getTipo());
        assertEquals("EM_ANDAMENTO", despesaCriada.getStatus());
        assertEquals(1, despesaCriada.getParcelaAtual());
        assertEquals(12, despesaCriada.getTotalParcelas());
        assertEquals(new BigDecimal("250.00"), despesaCriada.getValorParcela());
    }

    // ✅ Testa: dois usuários podem ter categoria com mesmo nome
    @Test
    void doisUsuarios_mesmoNomeCategoria_deveFuncionar() {
        CategoriaResponseDTO cat1 = new CategoriaResponseDTO();
        cat1.setNome("Alimentação");
        categoriaService.criarCategoria(cat1, usuarioId);

        CategoriaResponseDTO cat2 = new CategoriaResponseDTO();
        cat2.setNome("Alimentação");

        // Usuário 2 também pode ter "Alimentação" — não deve lançar exceção
        assertDoesNotThrow(() -> categoriaService.criarCategoria(cat2, usuario2Id));
    }

    // ✅ Testa: mesmo usuário não pode ter duas categorias com mesmo nome
    @Test
    void mesmoUsuario_categoriasDuplicadas_deveLancarExcecao() {
        CategoriaResponseDTO cat1 = new CategoriaResponseDTO();
        cat1.setNome("Alimentação");
        categoriaService.criarCategoria(cat1, usuarioId);

        CategoriaResponseDTO cat2 = new CategoriaResponseDTO();
        cat2.setNome("Alimentação");

        assertThrows(DuplicateResourceException.class, () ->
            categoriaService.criarCategoria(cat2, usuarioId)
        );
    }

    // ✅ Testa: dois usuários podem ter despesa com mesmo nome
    @Test
    void doisUsuarios_mesmoNomeDespesa_deveFuncionar() {
        // Categoria para usuário 1
        CategoriaResponseDTO cat1 = new CategoriaResponseDTO();
        cat1.setNome("Contas");
        categoriaService.criarCategoria(cat1, usuarioId);

        // Categoria para usuário 2
        CategoriaResponseDTO cat2 = new CategoriaResponseDTO();
        cat2.setNome("Contas");
        categoriaService.criarCategoria(cat2, usuario2Id);

        DespesaResponseDTO desp1 = new DespesaResponseDTO();
        desp1.setNome("Aluguel");
        desp1.setValor(new BigDecimal("1500.00"));
        desp1.setNomeCategoria("Contas");
        desp1.setIsParcelado(false);
        desp1.setDiaPagamento(5);
        despesaService.criarDespesa(desp1, usuarioId);

        DespesaResponseDTO desp2 = new DespesaResponseDTO();
        desp2.setNome("Aluguel");
        desp2.setValor(new BigDecimal("1200.00"));
        desp2.setNomeCategoria("Contas");
        desp2.setIsParcelado(false);
        desp2.setDiaPagamento(5);

        // Usuário 2 também pode ter "Aluguel"
        assertDoesNotThrow(() -> despesaService.criarDespesa(desp2, usuario2Id));
    }

    // ✅ Testa: buscar categoria com ID inexistente
    @Test
    void buscarCategoria_idInexistente_deveLancarExcecao() {
        assertThrows(ResourceNotFoundException.class, () ->
            categoriaService.buscarId(999L)
        );
    }

    // ✅ Testa: alterar categoria com ID inexistente
    @Test
    void alterarCategoria_idInexistente_deveLancarExcecao() {
        CategoriaResponseDTO dto = new CategoriaResponseDTO();
        dto.setNome("Novo nome");

        // Aqui confirmamos o fix do .get() antes de isPresent()
        assertThrows(ResourceNotFoundException.class, () ->
            categoriaService.alterarCategoria(dto, 999L)
        );
    }

    // ✅ Testa: despesa parcelada sem totalParcelas deve falhar
    @Test
    void criarDespesa_parceladaSemTotalParcelas_deveLancarExcecao() {
        CategoriaResponseDTO cat = new CategoriaResponseDTO();
        cat.setNome("Tecnologia");
        categoriaService.criarCategoria(cat, usuarioId);

        DespesaResponseDTO dto = new DespesaResponseDTO();
        dto.setNome("Celular");
        dto.setValor(new BigDecimal("2000.00"));
        dto.setNomeCategoria("Tecnologia");
        dto.setIsParcelado(true);
        // totalParcelas e valorParcela intencionalmente nulos
        dto.setDiaPagamento(15);

        // @PrePersist valida e deve lançar exceção
        assertThrows(Exception.class, () ->
            despesaService.criarDespesa(dto, usuarioId)
        );
    }
}