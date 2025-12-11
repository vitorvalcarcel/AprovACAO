package com.nomeacao.api.service;

import com.nomeacao.api.dto.DadosTipoEstudo;
import com.nomeacao.api.model.TipoEstudo;
import com.nomeacao.api.model.Usuario;
import com.nomeacao.api.repository.RegistroEstudoRepository;
import com.nomeacao.api.repository.TipoEstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoEstudoService {

    @Autowired private TipoEstudoRepository repository;
    @Autowired private RegistroEstudoRepository registroRepository;

    public TipoEstudo cadastrar(DadosTipoEstudo dados, Usuario usuario) {
        if (repository.existsByUsuarioAndNomeIgnoreCase(usuario, dados.nome())) {
            throw new RuntimeException("Já existe um tipo de estudo com este nome.");
        }

        var tipo = new TipoEstudo();
        tipo.setNome(dados.nome());
        tipo.setUsuario(usuario);
        tipo.setArquivado(false);
        tipo.setContaHorasCiclo(dados.contaHorasCiclo() != null ? dados.contaHorasCiclo() : true);
        
        return repository.save(tipo);
    }

    public void criarPadroes(Usuario usuario) {
        salvarPadrao(usuario, "Videoaula", true);
        salvarPadrao(usuario, "PDF / Leitura", true);
        salvarPadrao(usuario, "Questões (Bateria)", false);
        salvarPadrao(usuario, "Lei Seca", true);
        salvarPadrao(usuario, "Revisão", true);
    }

    private void salvarPadrao(Usuario usuario, String nome, boolean contaHoras) {
        var tipo = new TipoEstudo();
        tipo.setNome(nome);
        tipo.setUsuario(usuario);
        tipo.setArquivado(false);
        tipo.setContaHorasCiclo(contaHoras);
        repository.save(tipo);
    }

    public List<DadosTipoEstudo> listar(boolean incluirArquivados, Usuario usuario) {
        List<TipoEstudo> lista = incluirArquivados 
            ? repository.findAllByUsuario(usuario)
            : repository.findAllByUsuarioAndArquivadoFalse(usuario);
        return lista.stream().map(DadosTipoEstudo::new).toList();
    }

    public void atualizar(DadosTipoEstudo dados, Usuario usuario) {
        var tipo = repository.findById(dados.id()).orElseThrow();
        if (!tipo.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");
        
        if (!tipo.getNome().equalsIgnoreCase(dados.nome()) && 
             repository.existsByUsuarioAndNomeIgnoreCase(usuario, dados.nome())) {
            throw new RuntimeException("Já existe um tipo de estudo com este nome.");
        }

        tipo.setNome(dados.nome());
        if (dados.contaHorasCiclo() != null) {
            tipo.setContaHorasCiclo(dados.contaHorasCiclo());
        }
    }

    public void excluir(Long id, Usuario usuario) {
        var tipo = repository.findById(id).orElseThrow();
        if (!tipo.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");

        if (registroRepository.existsByTipoEstudoId(id)) {
            throw new RuntimeException("Este tipo de estudo possui registros vinculados. Arquive-o em vez de excluir.");
        }
        
        repository.delete(tipo);
    }
    
    public void alternarArquivamento(Long id, Usuario usuario) {
        var tipo = repository.findById(id).orElseThrow();
        if (!tipo.getUsuario().getId().equals(usuario.getId())) throw new RuntimeException("Acesso negado.");
        tipo.setArquivado(!tipo.getArquivado());
    }
}