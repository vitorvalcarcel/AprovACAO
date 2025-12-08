package com.nomeacao.api.controller;

import com.nomeacao.api.dto.DadosCadastroMateria;
import com.nomeacao.api.dto.DadosListagemMateria;
import com.nomeacao.api.dto.DadosAtualizacaoMateria;
import com.nomeacao.api.model.Materia;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.MateriaRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaRepository repository;

    @PostMapping
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid DadosCadastroMateria dados, 
                                    @AuthenticationPrincipal Usuario usuarioLogado,
                                    UriComponentsBuilder uriBuilder) {
        
        var materia = new Materia();
        materia.setNome(dados.nome());
        materia.setUsuario(usuarioLogado);

        repository.save(materia);

        var uri = uriBuilder.path("/materias/{id}").buildAndExpand(materia.getId()).toUri();
        return ResponseEntity.created(uri).body(materia);
    }

    @GetMapping
    public ResponseEntity<List<DadosListagemMateria>> listar(@AuthenticationPrincipal Usuario usuarioLogado) {
        // Busca ÁRIO LOGADOapenas as matérias DO USU
        var lista = repository.findAllByUsuario(usuarioLogado)
                .stream()
                .map(DadosListagemMateria::new) // Transforma cada Matéria em DTO
                .toList();

        return ResponseEntity.ok(lista);
    }

    @PutMapping
    @Transactional
    public ResponseEntity atualizar(@RequestBody @Valid DadosAtualizacaoMateria dados, @AuthenticationPrincipal Usuario usuarioLogado) {
        var materia = repository.findById(dados.id())
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        // SEGURANÇA: Garante que o usuário só edite a SUAS PRÓPRIAS matérias
        if (!materia.getUsuario().getId().equals(usuarioLogado.getId())) {
            return ResponseEntity.status(403).build();
        }

        materia.atualizarInformacoes(dados.nome());
        
        return ResponseEntity.ok(new DadosListagemMateria(materia));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity excluir(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        var materia = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));

        // SEGURANÇA: Garante que o usuário só exclua as SUAS PRÓPRIAS matérias
        if (!materia.getUsuario().getId().equals(usuarioLogado.getId())) {
            return ResponseEntity.status(403).build();
        }

        repository.delete(materia);

        return ResponseEntity.noContent().build(); // Retorna código 204 (Sucesso sem conteúdo)
    }
}